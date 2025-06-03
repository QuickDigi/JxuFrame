import { Request, Response, NextFunction } from "express";

export interface ResponseX extends Response {
    sendPHP: (
        filePath: string,
        res: Response,
        req: Request,
        options?: any
    ) => Promise<any>;
}

export interface RequestX extends Request {
    __mint__?: Boolean;
}

