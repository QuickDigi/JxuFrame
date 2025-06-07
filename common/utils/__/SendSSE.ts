
function SendSSE(
    data: string,
    res: any,
    req?: any,
    event?: string
) {
    if (!res.headersSent) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders?.();
    }

    if (event) {
        res.write(`event: ${event}\n`);
    }
    res.write(`data: ${data}\n\n`);
};
export default SendSSE;