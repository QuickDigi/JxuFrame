import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";
import "reflect-metadata";
import fs from "fs/promises";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import SendPHPFile from './Internal/InternalC/Runner/SendPHPFile';
import { RequestX, ResponseX } from '../types/Response';
// plugins
import { dispatch } from "./plugins/dispatch";
//** utils
// *Response
import SendSSE from "_@/utils/__/SendSSE";
import logEvent from "_@/utils/__/logEvent";
import { sendVariant } from "_@/utils/__/sendVariant";
import { ok } from "_@/utils/__/ok";
import { withTrace } from "_@/utils/__/withTrace";
// Validation
import _Password from "_@/utils/__/validation/_password";
// 
import { APIList } from "./define";

export class JxuFrame {
    private app: Application;

    constructor(enableJsonBody: boolean = true, enableURLEncoded: boolean = false) {
        this.app = express();
        // start/ secure

        // end/ secure

        // 🛡️ 1. تفعيل الحماية بالـ Helmet
        this.app.use(helmet());

        // 🛡️ 2. تفعيل CORS مع إعدادات آمنة
        this.app.use(cors());

        // 🛡️ 5. منع التلاعب بالـ HTTP Parameters
        this.app.use(hpp());

        // 🛡️ 6. إزالة الإعلانات عن نوع الخادم
        this.app.disable("x-powered-by");

        // 🛡️ 7. تأمين JSON & URL Encoded مع تحديد الحجم الأقصى للبيانات
        if (enableJsonBody) {
            this.app.use(express.json());
        }
        if (enableURLEncoded) {
            this.app.use(express.urlencoded({ extended: true }));
        }

        this.app.use((req, res, next) => {
            let Res = (res as ResponseX);
            Res.sendPHP = (
                filePath: string,
                options?: any
            ) => SendPHPFile(filePath, res, req, options);
            Res.sendSSE = (
                data: string,
                event?: string,
            ) => SendSSE(data, res, req, event);
            Res.logEvent = (event: string, data?: any) => logEvent(req, event, data);
            Res.sendVariant = (
                variants: {
                    mobile?: any;
                    desktop?: any;
                    api?: any;
                    fallback?: any;
                }
            ) => sendVariant(req, res, variants);
            Res.ok = (data: any, message?: string) => ok(req, res, data, message);
            Res.withTrace = (data: any) => withTrace(req, res, data);
            // *Validation;
            Res.validation = {
                _password: (value: string,minLength?: number) => _Password(value,minLength),
            };
            // RequestX
            let Req = (req as RequestX);
            Req.EndPointList = APIList;
            next();
        });

    }

    registerController(controller: any) {
        const instance = new controller();
        const basePath = Reflect.getMetadata("basePath", controller) ?? "";
        const routes = Reflect.getMetadata("routes", controller) || [];

        routes.forEach((route: any) => {
            const method = route.method.toLowerCase() as keyof Application;

            // التحقق من دعم الميثود قبل تسجيله
            if (typeof this.app[method] === "function") {
                const originalHandler = instance[route.handler];

                this.app[method](`${basePath}${route.path}`, async (req: Request, res: Response, next: NextFunction) => {
                    try {
                        if (req.method.toUpperCase() !== method.toString().toUpperCase()) {
                            throw new Error(`🚫 Method Not Allowed: ${req.method.toUpperCase()} || Expected: ${method.toString().toUpperCase()}`);
                        }

                        // مرّر الـ originalHandler والـ instance مع بعض للـ dispatch
                        await dispatch(req, res, originalHandler, instance);
                    } catch (error) {
                        next(error);
                    }
                });

            } else {
                console.error(`❌ Method ${route.method} is not supported by Express!`);
            }
        });
    }

    /** ✅ Middleware مخصص للتعامل مع الأخطاء */
    private async errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
        console.error(`❌ Error:`, err);

        if (!res.headersSent) {
            try {
                const errorPagePath = path.resolve(__dirname, "handler", "Error", "error.html");
                let htmlContent = await fs.readFile(errorPagePath, "utf8");

                // استبدال القيم الديناميكية
                htmlContent = htmlContent
                    .replace("%PRC_MSGERROR%", err.message || "Something went wrong")
                    .replace("%PRC_STATUS%", err.status || "500");

                res.status(err.status || 500).send(htmlContent);
            } catch (readErr) {
                console.error("❌ Failed to load error page:", readErr);
                res.status(500).json({
                    error: true,
                    message: err.message || "Internal Server Error",
                    status: err.status || 500,
                    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
                });
            }
        }
    }

    StartServer(port: number, callback: (error?: Error) => void = () => { }) {
        this.app.use(this.errorHandler);

        this.app.listen(port, (err?: Error) => {
            if (err) {
                console.error("❌ Server failed to start:", err);
                if (callback) callback(err);
            } else {
                // console.log(`🚀 Server running on http://localhost:${port}`);
                if (callback) callback();
            }
        });
    }
}
