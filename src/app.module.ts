import "reflect-metadata";
import { JxuFrame } from "./core/framework";
import { AppController } from "./Controller/app.controller";

const app = new JxuFrame();

// تسجيل الكنترولر
app.registerController(AppController);

// تشغيل السيرفر على المنفذ 3000
app.listen(3000, () => {
    console.log(`🚀 Server running on http://localhost:3000`);
});
