import { Request, Response } from "express";

export interface ResponseX extends Response {
    sendPHP: (
        filePath: string,
        options?: any
    ) => Promise<any>;
    sendSSE(
        data: string,
        event?: string,
    ): void;
    logEvent(event: string, data?: any): void;
    sendVariant(
        variants: {
            mobile?: any;
            desktop?: any;
            api?: any;
            fallback?: any;
        }
    ): void;
    ok(data: any, message?: string): void;
    withTrace(data: any): void;
    validation:{
        _password(value: string,minLength?: number): boolean;
    }
}

export interface RequestX extends Request {
    EndPointList: object[] | string[];
}

