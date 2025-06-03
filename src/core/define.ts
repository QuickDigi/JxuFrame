import AdvancedCache from './plugins/Cache/AdvancedCache';
import MetricsCollector from './plugins/Collectors/MetricsCollector';
import ProcessPoolManager from './plugins/Manager/ProcessPoolManager';
import SecurityManager from './plugins/Security/SecurityManager';

// @INTERFACE
export interface RouteMetadata {
    method: string;
    path: string;
    handler: string;
    controller?: any;
    middleware?: string[];
    rateLimit?: RateLimitConfig;
    cache?: CacheConfig;
    auth?: AuthConfig;
    validation?: ValidationConfig;
    tags?: string[];
    description?: string;
    deprecated?: boolean;
    version?: string;
}

export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
    keyGenerator?: (req: any) => string;
}

export interface CacheConfig {
    ttl: number;
    key?: string;
    tags?: string[];
    vary?: string[];
}

export interface AuthConfig {
    required: boolean;
    roles?: string[];
    scopes?: string[];
    strategy?: string;
}

export interface ValidationConfig {
    body?: any;
    query?: any;
    params?: any;
    headers?: any;
}

export interface MetricsData {
    requestCount: number;
    responseTime: number[];
    errorCount: number;
    statusCodes: Map<number, number>;
    lastAccessed: Date;
    activeConnections: number;
};

// Variables
let _eBasePath: string = "";

function setBasePath(path: string) {
    _eBasePath = path;
}

function getBasePath(): string {
    return _eBasePath;
}

let APIList: RouteMetadata[] = [];
let advancedCache = new AdvancedCache();
let metricsCollector = new MetricsCollector();
let processPool = new ProcessPoolManager();
let securityManager: SecurityManager;

function setSecurityManager(data: any): any {
    securityManager = data;
};

// export 
export {
    _eBasePath,
    setBasePath,
    getBasePath,
    APIList,
    advancedCache,
    metricsCollector,
    processPool,
    securityManager,
    setSecurityManager
}