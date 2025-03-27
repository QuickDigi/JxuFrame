import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";
import "reflect-metadata";
import fs from "fs/promises";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";

export class JxuFrame {
    private app: Application;

    constructor(enableJsonBody: boolean = false, enableURLEncoded: boolean = false) {
        this.app = express();

        // 🛡️ 1. تفعيل الحماية بالـ Helmet
        this.app.use(helmet());

        // 🛡️ 2. تفعيل CORS مع إعدادات آمنة
        this.app.use(cors({
            origin: ["*"], // حدد نطاقات مسموح بها
            methods: ["GET", "POST", "PUT", "DELETE"],
            allowedHeaders: ["Content-Type", "Authorization"],
        }));

        // 🛡️ 5. منع التلاعب بالـ HTTP Parameters
        this.app.use(hpp());

        // 🛡️ 6. إزالة الإعلانات عن نوع الخادم
        this.app.disable("x-powered-by");

        // 🛡️ 7. تأمين JSON & URL Encoded مع تحديد الحجم الأقصى للبيانات
        if (enableJsonBody) {
            this.app.use(express.json({ limit: "1mb" }));
        }

        if (enableURLEncoded) {
            this.app.use(express.urlencoded({ extended: true, limit: "1mb" }));
        }
    }

    registerController(controller: any) {
        const instance = new controller();
        const basePath = Reflect.getMetadata("basePath", controller) ?? "";
        const routes = Reflect.getMetadata("routes", controller) || [];

        routes.forEach((route: any) => {
            const method = route.method.toLowerCase() as keyof Application;

            // التحقق من دعم الميثود قبل تسجيله
            if (typeof this.app[method] === "function") {
                this.app[method](`${basePath}${route.path}`, async (req: Request, res: Response, next: NextFunction) => {
                    try {
                        if (req.method.toUpperCase() !== method.toString().toUpperCase()) {
                            throw new Error(`🚫 Method Not Allowed: ${req.method.toUpperCase()} || Expected: ${method.toString().toUpperCase()}`);
                        }
                        const result = await instance[route.handler](req, res);

                        if (!res.headersSent) {
                            res.json(result);
                        }
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

    listen(port: number, callback: (error?: Error) => void = () => { }) {
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
