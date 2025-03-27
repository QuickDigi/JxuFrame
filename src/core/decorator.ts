import "reflect-metadata";
import { ResponseX, RequestX } from '../types/Response';

function Controller(basePath: string = "") {
    return function (target: any) {
        Reflect.defineMetadata("basePath", basePath, target);
        if (!Reflect.hasMetadata("routes", target)) {
            Reflect.defineMetadata("routes", [], target);
        }
    };
}

// method
function GET(path: string) {
    return function (target: any, key: string) {
        const routes = Reflect.getMetadata("routes", target.constructor) || [];
        routes.push({ method: "get", path, handler: key });
        Reflect.defineMetadata("routes", routes, target.constructor);
    };
}

function POST(path: string) {
    return function (target: any, key: string) {
        const routes = Reflect.getMetadata("routes", target.constructor) || [];
        routes.push({ method: "post", path, handler: key });
        Reflect.defineMetadata("routes", routes, target.constructor);
    };
}

function DELETE(path: string) {
    return function (target: any, key: string) {
        const routes = Reflect.getMetadata("routes", target.constructor) || [];
        routes.push({ method: "delete", path, handler: key });
        Reflect.defineMetadata("routes", routes, target.constructor);
    };
}

function PUT(path: string) {
    return function (target: any, key: string) {
        const routes = Reflect.getMetadata("routes", target.constructor) || [];
        routes.push({ method: "put", path, handler: key });
        Reflect.defineMetadata("routes", routes, target.constructor);
    };
}

function PATCH(path: string) {
    return function (target: any, key: string) {
        const routes = Reflect.getMetadata("routes", target.constructor) || [];
        routes.push({ method: "patch", path, handler: key });
        Reflect.defineMetadata("routes", routes, target.constructor);
    };
}

function HEAD(path: string) {
    return function (target: any, key: string) {
        const routes = Reflect.getMetadata("routes", target.constructor) || [];
        routes.push({ method: "head", path, handler: key });
        Reflect.defineMetadata("routes", routes, target.constructor);
    };
}

function SZUS(path: string, method: string) {
    return function (target: any, key: string) {
        const routes = Reflect.getMetadata("routes", target.constructor) || [];
        routes.push({ method, path, handler: key, controller: target.constructor });
        Reflect.defineMetadata("routes", routes, target.constructor);
    };
}

export {
    Controller,
    GET,
    POST,
    DELETE,
    PUT,
    PATCH,
    HEAD,
    SZUS,
    ResponseX,
    RequestX
}