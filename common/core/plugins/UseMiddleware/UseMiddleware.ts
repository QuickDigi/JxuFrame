import "reflect-metadata";

function UseMiddleware(...middlewares: string[]) {
    return function (target: any, key?: string) {
        if (key) {
            // Method middleware
            const existingMiddleware = Reflect.getMetadata("middleware", target, key) || [];
            Reflect.defineMetadata("middleware", [...existingMiddleware, ...middlewares], target, key);
        } else {
            // Class middleware
            const existingMiddleware = Reflect.getMetadata("middleware", target) || [];
            Reflect.defineMetadata("middleware", [...existingMiddleware, ...middlewares], target);
        }
    };
};

export default UseMiddleware;