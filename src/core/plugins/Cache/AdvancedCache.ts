class AdvancedCache {
    private cache = new Map<string, any>();
    private ttlMap = new Map<string, number>();
    private accessCount = new Map<string, number>();
    private tags = new Map<string, Set<string>>();
    private maxSize: number;
    private stats = { hits: 0, misses: 0, evictions: 0 };

    constructor(maxSize = 1000) {
        this.maxSize = maxSize;
        this.startCleanupTimer();
    }

    set(key: string, value: any, ttl: number = 300000, tags: string[] = []) {
        // LRU eviction if at capacity
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLeastUsed();
        }

        this.cache.set(key, {
            value,
            createdAt: Date.now(),
            accessCount: 0
        });

        this.ttlMap.set(key, Date.now() + ttl);
        this.accessCount.set(key, 0);

        // Tag management
        tags.forEach(tag => {
            if (!this.tags.has(tag)) {
                this.tags.set(tag, new Set());
            }
            this.tags.get(tag)!.add(key);
        });
    }

    get(key: string) {
        if (!this.cache.has(key)) {
            this.stats.misses++;
            return null;
        }

        const ttl = this.ttlMap.get(key);
        if (ttl && Date.now() > ttl) {
            this.delete(key);
            this.stats.misses++;
            return null;
        }

        const item = this.cache.get(key);
        item.accessCount++;
        this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
        this.stats.hits++;

        return item.value;
    }

    delete(key: string) {
        this.cache.delete(key);
        this.ttlMap.delete(key);
        this.accessCount.delete(key);
    }

    invalidateByTag(tag: string) {
        const keys = this.tags.get(tag);
        if (keys) {
            keys.forEach(key => this.delete(key));
            this.tags.delete(tag);
        }
    }

    private evictLeastUsed() {
        let leastUsedKey = '';
        let minAccess = Infinity;

        for (const [key, count] of this.accessCount) {
            if (count < minAccess) {
                minAccess = count;
                leastUsedKey = key;
            }
        }

        if (leastUsedKey) {
            this.delete(leastUsedKey);
            this.stats.evictions++;
        }
    }

    private startCleanupTimer() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, ttl] of this.ttlMap) {
                if (now > ttl) {
                    this.delete(key);
                }
            }
        }, 60000); // Clean every minute
    }

    getStats() {
        return {
            ...this.stats,
            size: this.cache.size,
            hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
        };
    }
};

export default AdvancedCache;