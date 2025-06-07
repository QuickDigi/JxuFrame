import { ResponseX, RequestX } from '_@/types/Response';

export default class BlockGuard {
    async canActivate(req: RequestX, res: ResponseX) {
        if (!req.headers["user-agent"]) {
            res.statusCode = 401;
            res.send("Unauthorized 🛑");
            return false;
        }
        return true;
    }
}