import { EventEmitter } from "stream";
import { MetricsData } from '../../define';

class MetricsCollector extends EventEmitter {
    private metrics = new Map<string, MetricsData>();
    private globalMetrics = {
        totalRequests: 0,
        totalErrors: 0,
        averageResponseTime: 0,
        uptime: Date.now(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
    };

    recordRequest(route: string, method: string, statusCode: number, responseTime: number) {
        const key = `${method}:${route}`;

        if (!this.metrics.has(key)) {
            this.metrics.set(key, {
                requestCount: 0,
                responseTime: [],
                errorCount: 0,
                statusCodes: new Map(),
                lastAccessed: new Date(),
                activeConnections: 0
            });
        }

        const metric = this.metrics.get(key)!;
        metric.requestCount++;
        metric.responseTime.push(responseTime);
        metric.lastAccessed = new Date();

        if (statusCode >= 400) {
            metric.errorCount++;
            this.globalMetrics.totalErrors++;
        }

        metric.statusCodes.set(statusCode, (metric.statusCodes.get(statusCode) || 0) + 1);

        // Keep only last 1000 response times for memory efficiency
        if (metric.responseTime.length > 1000) {
            metric.responseTime = metric.responseTime.slice(-1000);
        }

        this.globalMetrics.totalRequests++;
        this.updateGlobalAverageResponseTime(responseTime);

        this.emit('request', { route, method, statusCode, responseTime });
    }

    private updateGlobalAverageResponseTime(newTime: number) {
        const currentAvg = this.globalMetrics.averageResponseTime;
        const count = this.globalMetrics.totalRequests;
        this.globalMetrics.averageResponseTime = ((currentAvg * (count - 1)) + newTime) / count;
    }

    getMetrics(route?: string): any {
        if (route) {
            const metric = this.metrics.get(route);
            if (!metric) return null;

            return {
                ...metric,
                averageResponseTime: metric.responseTime.reduce((a, b) => a + b, 0) / metric.responseTime.length,
                p95ResponseTime: this.calculatePercentile(metric.responseTime, 0.95),
                p99ResponseTime: this.calculatePercentile(metric.responseTime, 0.99),
                errorRate: metric.errorCount / metric.requestCount
            };
        }

        return {
            global: {
                ...this.globalMetrics,
                uptime: Date.now() - this.globalMetrics.uptime,
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage()
            },
            routes: Array.from(this.metrics.entries()).map(([key, data]) => ({
                route: key,
                ...this.getMetrics(key)
            }))
        };
    }

    private calculatePercentile(values: number[], percentile: number): number {
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * percentile) - 1;
        return sorted[index] || 0;
    }
};
export default MetricsCollector;