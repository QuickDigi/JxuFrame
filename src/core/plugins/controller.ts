import "reflect-metadata";
import { setBasePath } from '../define';

function Controller(basePath: string = "", options: any = {}) {
    return function (target: any) {
        Reflect.defineMetadata("basePath", basePath, target);
        Reflect.defineMetadata("controllerOptions", options, target);
        setBasePath(basePath);

        if (!Reflect.hasMetadata("routes", target)) {
            Reflect.defineMetadata("routes", [], target);
        }
    };
};
export default Controller;