function detectClientType(req: any): 'mobile' | 'desktop' | 'api' {
    const ua = req.headers['user-agent'] || '';
    const accept = req.headers['accept'] || '';

    if (accept.includes('application/json') || req.xhr) return 'api';

    if (/android|iphone|ipad|mobile/i.test(ua)) return 'mobile';

    return 'desktop';
}

export function sendVariant(
    req: any,
    res: any,
    variants: {
        mobile?: any;
        desktop?: any;
        api?: any;
        fallback?: any;
    }
) {
    const type = detectClientType(req);

    const output =
        variants[type] ??
        variants.fallback ??
        `Unsupported client type: ${type}`;

    // Smart send
    if (typeof output === 'object') {
        res.json(output);
    } else if (typeof output === 'string') {
        if (output.trim().startsWith('<')) {
            res.setHeader("Content-Type", "text/html");
        }
        res.send(output);
    } else {
        res.send(output);
    }
}
