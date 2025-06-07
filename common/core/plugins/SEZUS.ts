import "reflect-metadata";
import { RouteMetadata } from "../decorator";

function SZUS(path: string, method: string, options: Partial<RouteMetadata> = {}) {
    return function (target: any, key: string) {
        const routes = Reflect.getMetadata("routes", target.constructor) || [];
        const routeMetadata: RouteMetadata = {
            method: method.toLowerCase(),
            path,
            handler: key,
            controller: target.constructor,
            ...options
        };
        
        routes.push(routeMetadata);
        Reflect.defineMetadata("routes", routes, target.constructor);
    };
};

export default SZUS;