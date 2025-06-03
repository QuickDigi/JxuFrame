import { RateLimitConfig } from '../../define';

class RateLimiter {
    private requests = new Map<string, number[]>();
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.config = config;
        this.startCleanupTimer();
    }

    isAllowed(identifier: string): boolean {
        const now = Date.now();
        const windowStart = now - this.config.windowMs;

        let requestTimes = this.requests.get(identifier) || [];
        requestTimes = requestTimes.filter(time => time > windowStart);

        if (requestTimes.length >= this.config.maxRequests) {
            return false;
        }

        requestTimes.push(now);
        this.requests.set(identifier, requestTimes);
        return true;
    }

    private startCleanupTimer() {
        setInterval(() => {
            const now = Date.now();
            const windowStart = now - this.config.windowMs;

            for (const [key, times] of this.requests) {
                const validTimes = times.filter(time => time > windowStart);
                if (validTimes.length === 0) {
                    this.requests.delete(key);
                } else {
                    this.requests.set(key, validTimes);
                }
            }
        }, this.config.windowMs);
    }
};
export default RateLimiter;