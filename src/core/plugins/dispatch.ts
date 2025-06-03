import "reflect-metadata";
import { runGuards } from "../../Guards/dispatcher";

export async function dispatch(
    req: any,
    res: any,
    handler: Function,
    context: any
) {
    const passed = await runGuards(handler, req, res);
    if (!passed) {
        if (!res.headersSent) {
            res.statusCode = 403;
            return res.end("Access Denied 🛑");
        }
        return;
    }

    // ننفّذ الميثود وناخد القيمة الراجعة
    const result = await handler.call(context, req, res);

    // لو الـ handler رجّع حاجة (مش undefined أو null)، نبعتها كـ JSON أو نص بناءً على النوع
    if (!res.headersSent && result !== undefined && result !== null) {
        // لو القيمة سترينغ، نبعتها كنص عادي
        if (typeof result === "string") {
            res.send(result);
        } else {
            // لو كائن، نبعتها كـ JSON
            res.json(result);
        }
    }
}
