import crypto from 'crypto';

export function withTrace(
    req: any,
    res: any,
    data: any,
) {
    const generateId = `${crypto.randomBytes(6).toString('hex')}-${crypto.randomBytes(6).toString('hex')}-${crypto.randomBytes(6).toString('hex')}-${crypto.randomBytes(6).toString('hex')}-${crypto.randomBytes(4).toString('hex')}`;
    res.json({
        data,
        _traceID: generateId
    });
}
