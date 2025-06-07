import "reflect-metadata";
import { JxuFrame } from "_@core/framework";
import { AppController } from "./Controller/app.controller";
import { DotEnv } from "_@/_e/dotenv";
DotEnv();

const app = new JxuFrame();
const PORT: any = process.env.SERVER_PORT || 3000;

app.registerController(AppController);

app.StartServer(PORT, () => {
    console.log(`${process.env.SERVER_START_MESSAGE} http://localhost:${PORT}`);
});
