import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataDogService } from './datadog.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MonitoringMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MonitoringMiddleware.name);

  constructor(
    private readonly dataDogService: DataDogService,
    private readonly analyticsService: AnalyticsService,
    private readonly auditService: AuditService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const startHrTime = process.hrtime.bigint();

    // Extract request information
    const method = req.method;
    const endpoint = req.path;
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    const userId = (req as any).user?.id;
    const sessionId = (req as any).sessionId;

    // Track request start
    this.dataDogService.increment('api.requests.started', 1, {
      tags: [`method:${method}`, `endpoint:${endpoint}`],
    });

    // Override res.end to capture response details
    const originalEnd = res.end;
    const self = this; // Capture the context

    res.end = function (chunk?: any, encoding?: any, cb?: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const hrDuration = Number(process.hrtime.bigint() - startHrTime) / 1000000; // Convert to milliseconds
      const statusCode = res.statusCode;

      // Track API metrics
      self.trackApiMetrics(method, endpoint, statusCode, duration, hrDuration);

      // Track analytics
      self.trackAnalytics(endpoint, method, statusCode, duration, userId, sessionId, ip, userAgent);

      // Track audit logs for important endpoints
      self.trackAuditLogs(endpoint, method, statusCode, duration, userId, ip, userAgent, req);

      // Call original end
      return originalEnd.call(this, chunk, encoding, cb);
    };

    next();
  }

  private trackApiMetrics(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    hrDuration: number,
  ): void {
    const tags = [`method:${method}`, `endpoint:${endpoint}`, `status_code:${statusCode}`];

    // Track basic metrics
    this.dataDogService.increment('api.requests.total', 1, { tags });
    this.dataDogService.timing('api.requests.duration', duration, { tags });
    this.dataDogService.timing('api.requests.precise_duration', hrDuration, { tags });

    // Track errors
    if (statusCode >= 400) {
      this.dataDogService.increment('api.requests.errors', 1, { tags });

      if (statusCode >= 500) {
        this.dataDogService.increment('api.requests.server_errors', 1, { tags });
      } else {
        this.dataDogService.increment('api.requests.client_errors', 1, { tags });
      }
    } else {
      this.dataDogService.increment('api.requests.success', 1, { tags });
    }

    // Track slow requests (> 1 second)
    if (duration > 1000) {
      this.dataDogService.increment('api.requests.slow', 1, { tags });
    }

    // Track by status code ranges
    const statusRange = this.getStatusCodeRange(statusCode);
    this.dataDogService.increment(`api.requests.${statusRange}`, 1, { tags });
  }

  private async trackAnalytics(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    userId?: string,
    sessionId?: string,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.analyticsService.trackAPICall(endpoint, method, statusCode, duration, ip || '');
    } catch (error) {
      this.logger.error('Failed to track analytics:', error);
    }
  }

  private async trackAuditLogs(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    userId?: string,
    ip?: string,
    userAgent?: string,
    req?: Request,
  ): Promise<void> {
    // Only audit certain endpoints or methods
    const shouldAudit = this.shouldAuditRequest(endpoint, method, statusCode);

    if (!shouldAudit) {
      return;
    }

    try {
      await this.auditService.createAuditLog({
        userId,
        action: `api_${method.toLowerCase()}`,
        resource: this.extractResourceFromEndpoint(endpoint),
        method,
        endpoint,
        ip: ip || '',
        userAgent: userAgent || '',
        status: statusCode >= 400 ? 'error' : 'success',
        statusCode,
        duration,
        requestData: this.sanitizeRequestData(req),
      });
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
    }
  }

  private shouldAuditRequest(endpoint: string, method: string, statusCode: number): boolean {
    // Audit all errors
    if (statusCode >= 400) {
      return true;
    }

    // Audit authentication endpoints
    if (endpoint.includes('/auth/')) {
      return true;
    }

    // Audit user management endpoints
    if (endpoint.includes('/users/') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return true;
    }

    // Audit admin endpoints
    if (endpoint.includes('/admin/')) {
      return true;
    }

    // Don't audit health checks or static assets
    if (endpoint.includes('/health') || endpoint.includes('/static/')) {
      return false;
    }

    return false;
  }

  private extractResourceFromEndpoint(endpoint: string): string {
    // Extract resource name from endpoint
    // e.g., /api/v1/users/123 -> users
    const parts = endpoint.split('/').filter(Boolean);

    if (parts.length >= 3 && parts[0] === 'api' && parts[1].startsWith('v')) {
      return parts[2];
    }

    return parts[0] || 'unknown';
  }

  private sanitizeRequestData(req?: Request): any {
    if (!req) return {};

    // Remove sensitive data
    const sanitized = {
      query: req.query,
      params: req.params,
      headers: { ...req.headers },
    };

    // Remove sensitive headers
    delete sanitized.headers.authorization;
    delete sanitized.headers.cookie;
    delete sanitized.headers['x-api-key'];

    return sanitized;
  }

  private getStatusCodeRange(statusCode: number): string {
    if (statusCode < 200) return '1xx';
    if (statusCode < 300) return '2xx';
    if (statusCode < 400) return '3xx';
    if (statusCode < 500) return '4xx';
    return '5xx';
  }
}
