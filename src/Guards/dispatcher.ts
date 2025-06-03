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