import { Request } from 'express';

function logEvent(req: Request, event: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const log = {
        timestamp,
        event,
        data,
        ip: req?.ip || req?.connection?.remoteAddress || 'unknown',
        method: req?.method,
        url: req?.originalUrl || req?.url
    };

    console.log("[Event]", JSON.stringify(log, null, 2));
}

export default logEvent;
