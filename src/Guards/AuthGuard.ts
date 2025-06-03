import { ResponseX, RequestX } from '../types/Response';

export default class AuthGuard {
    async canActivate(req: RequestX, res: ResponseX) {
        if (!req.headers.authorization) {
            res.statusCode = 401;
            res.send("Unauthorized 🛑");
            return false;
        }
        return true;
    }
}