import {
    Controller,
    Get,
    Post,
    RequestX,
    ResponseX,
    UseGuards
} from "_@core/decorator";
import BlockGuard from "@Guards/Block.guard";

@Controller()
class AppController {
    @Post('/password-validation')
    PasswordValidation(req: RequestX, res: ResponseX) {
        const { password } = req.body;
        if (res.validation._password(password)) {
            res.ok(true, "Password is valid!");
        } else {
            res.status(400).send("Password is weak!");
        }
    }

    @Get("/hello")
    hello(req: RequestX, res: ResponseX) {
        res.logEvent("LOGIN_ATTEMPT", { user: "mohamed" });
        res.status(200).json({
            message: "Welcome to JxuFrame SSE example!",
            APIs: req.EndPointList
        });
    }
}

export { AppController };
