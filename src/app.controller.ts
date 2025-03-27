import { Controller, ResponseX, RequestX, SZUS } from "./core/decorator";

@Controller("/coffe")
export class AppController {
    @SZUS("", "get")
    saySlash(req: RequestX, res: ResponseX) {
        res.send(`$ HELLO WORLD || ${req?.ip}`);
    }
}
