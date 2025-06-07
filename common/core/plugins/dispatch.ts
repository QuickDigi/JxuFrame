import "reflect-metadata";

export async function runGuards(handler: Function, req: any, res: any): Promise<boolean> {
  const Guards = Reflect.getMetadata("custom:guards", handler) || [];
  for (const GuardClass of Guards) {
    const guard = new GuardClass();
    const allowed = await guard.canActivate(req, res);
    if (!allowed) return false;
  }
  return true;
}
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
