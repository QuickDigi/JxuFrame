import "reflect-metadata";

export function UseGuards(...guards: any[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata("custom:guards", guards, descriptor.value);
    };
}
