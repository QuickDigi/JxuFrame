import "reflect-metadata";
import { ResponseX, RequestX } from '../types/Response';
import { RouteMetadata, RateLimitConfig } from './define';

//* IMPORT-S
import SZUS from "./plugins/SEZUS";

// Advanced Cache System
import AdvancedCache from "./plugins/Cache/AdvancedCache";

// Rate Limiter
import RateLimiter from "./plugins/Limiters/RateLimiter";

// Security Manager
import SecurityManager from './plugins/Security/SecurityManager';

// Metrics Collector
import MetricsCollector from './plugins/Collectors/MetricsCollector';

// Process Pool Manager
import ProcessPoolManager from "./plugins/Manager/ProcessPoolManager";

// Enhanced Decorators
import createMethodDecorator from "./plugins/MethodDecorator/createMethodDecorator";

// Controller
import Controller from "./plugins/controller";
import UseMiddleware from "./plugins/UseMiddleware/UseMiddleware";

// Enhanced HTTP Method Decorators
const Get = createMethodDecorator("GET");
const Post = createMethodDecorator("POST");
const Put = createMethodDecorator("PUT");
const Delete = createMethodDecorator("DELETE");
const Patch = createMethodDecorator("PATCH");
const HEAD = createMethodDecorator("HEAD");
const OPTIONS = createMethodDecorator("OPTIONS");
const ALL = createMethodDecorator("ALL");

// Internal Classes
import InternalC from "./Internal/InternalC/InternalC";

// 
import { UseGuards } from "./_/Guards/UseGuards";

export {
    Controller,
    Get,
    Post,
    Delete,
    Put,
    Patch,
    HEAD,
    SZUS,
    ALL,
    OPTIONS,
    UseMiddleware,
    UseGuards,
    // Classes,
    ResponseX,
    RequestX,
    InternalC,
    AdvancedCache,
    RateLimiter,
    SecurityManager,
    MetricsCollector,
    ProcessPoolManager,
    RouteMetadata,
    RateLimitConfig,
};