import { APIList, getBasePath, RouteMetadata } from '../../define';

function createMethodDecorator(method: string="") {
    return function (path: string="", options: Partial<RouteMetadata> = {}) {
        return function (target: any, key: string) {
            const routes = Reflect.getMetadata("routes", target.constructor) || [];
            const fullPath = getBasePath() + path;

            const routeMetadata: RouteMetadata = {
                method: method.toLowerCase(),
                path,
                handler: key,
                controller: target.constructor,
                ...options
            };

            APIList.push({ ...routeMetadata, path: fullPath });
            routes.push(routeMetadata);
            Reflect.defineMetadata("routes", routes, target.constructor);
        };
    };
};

export default createMethodDecorator;