import { Injectable, Logger } from '@nestjs/common';
import { AuditLog } from './schemas/audit-log.schema';

export interface CreateAuditLogDto {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  sessionId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  endpoint: string;
  ip: string;
  userAgent: string;
  referer?: string;
  requestData?: any;
  responseData?: any;
  status: 'success' | 'error' | 'warning';
  statusCode: number;
  errorMessage?: string;
  duration: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  context?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly auditLogs: AuditLog[] = []; // In-memory storage for now

  async createAuditLog(data: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog: AuditLog = {
        ...data,
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        riskLevel: data.riskLevel || this.calculateRiskLevel(data),
        tags: data.tags || this.generateTags(data),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store in memory (in production, this would go to MongoDB)
      this.auditLogs.push(auditLog);

      this.logger.log(
        `Audit log created: ${data.action} on ${data.resource} by ${data.userEmail || 'anonymous'}`,
      );

      return auditLog;
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
      throw error;
    }
  }

  async findAuditLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    status?: string;
    riskLevel?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      let filteredLogs = [...this.auditLogs];

      // Apply filters
      if (filters.userId) {
        filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId);
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter((log) => log.action.includes(filters.action));
      }
      if (filters.resource) {
        filteredLogs = filteredLogs.filter((log) => log.resource.includes(filters.resource));
      }
      if (filters.status) {
        filteredLogs = filteredLogs.filter((log) => log.status === filters.status);
      }
      if (filters.riskLevel) {
        filteredLogs = filteredLogs.filter((log) => log.riskLevel === filters.riskLevel);
      }
      if (filters.dateFrom) {
        filteredLogs = filteredLogs.filter((log) => log.timestamp >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filteredLogs = filteredLogs.filter((log) => log.timestamp <= filters.dateTo!);
      }

      // Sort by timestamp (most recent first)
      filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      const total = filteredLogs.length;
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      const paginatedLogs = filteredLogs.slice(offset, offset + limit);

      return { logs: paginatedLogs, total };
    } catch (error) {
      this.logger.error('Failed to find audit logs:', error);
      throw error;
    }
  }

  async getAuditStats(): Promise<{
    totalLogs: number;
    logsByStatus: Record<string, number>;
    logsByRiskLevel: Record<string, number>;
    logsByAction: Record<string, number>;
    recentActivity: AuditLog[];
  }> {
    try {
      const totalLogs = this.auditLogs.length;

      // Group by status
      const logsByStatus = this.auditLogs.reduce((acc, log) => {
        acc[log.status] = (acc[log.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group by risk level
      const logsByRiskLevel = this.auditLogs.reduce((acc, log) => {
        acc[log.riskLevel] = (acc[log.riskLevel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group by action
      const logsByAction = this.auditLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get recent activity (last 10 logs)
      const recentActivity = [...this.auditLogs]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);

      return {
        totalLogs,
        logsByStatus,
        logsByRiskLevel,
        logsByAction,
        recentActivity,
      };
    } catch (error) {
      this.logger.error('Failed to get audit stats:', error);
      throw error;
    }
  }

  private calculateRiskLevel(data: CreateAuditLogDto): 'low' | 'medium' | 'high' | 'critical' {
    // High-risk actions
    const highRiskActions = ['delete', 'destroy', 'remove', 'drop'];
    const criticalRiskActions = ['admin_access', 'privilege_escalation', 'data_export'];

    // Check for critical actions
    if (criticalRiskActions.some((action) => data.action.toLowerCase().includes(action))) {
      return 'critical';
    }

    // Check for high-risk actions
    if (highRiskActions.some((action) => data.action.toLowerCase().includes(action))) {
      return 'high';
    }

    // Check status codes for risk level
    if (data.statusCode >= 500) {
      return 'high';
    }
    if (data.statusCode >= 400) {
      return 'medium';
    }

    // Check for admin users
    if (data.userRole === 'admin' || data.userRole === 'superadmin') {
      return 'medium';
    }

    return 'low';
  }

  private generateTags(data: CreateAuditLogDto): string[] {
    const tags: string[] = [];

    // Add status-based tags
    tags.push(`status:${data.status}`);

    // Add method-based tags
    tags.push(`method:${data.method.toLowerCase()}`);

    // Add resource-based tags
    tags.push(`resource:${data.resource}`);

    // Add role-based tags
    if (data.userRole) {
      tags.push(`role:${data.userRole}`);
    }

    // Add error tags
    if (data.status === 'error') {
      tags.push('error');
    }

    // Add authentication tags
    if (data.endpoint.includes('auth')) {
      tags.push('authentication');
    }

    return tags;
  }

  // Audit specific actions
  async logUserLogin(
    userId: string,
    email: string,
    ip: string,
    userAgent: string,
    success: boolean,
  ): Promise<void> {
    await this.createAuditLog({
      userId,
      userEmail: email,
      action: 'user_login',
      resource: 'auth',
      method: 'POST',
      endpoint: '/api/v1/auth/login',
      ip,
      userAgent,
      status: success ? 'success' : 'error',
      statusCode: success ? 200 : 401,
      duration: 0,
      riskLevel: success ? 'low' : 'medium',
      tags: ['authentication', 'login'],
    });
  }

  async logUserLogout(userId: string, email: string, ip: string, userAgent: string): Promise<void> {
    await this.createAuditLog({
      userId,
      userEmail: email,
      action: 'user_logout',
      resource: 'auth',
      method: 'POST',
      endpoint: '/api/v1/auth/logout',
      ip,
      userAgent,
      status: 'success',
      statusCode: 200,
      duration: 0,
      riskLevel: 'low',
      tags: ['authentication', 'logout'],
    });
  }

  async logDataAccess(
    userId: string,
    resource: string,
    resourceId: string,
    action: string,
    ip: string,
  ): Promise<void> {
    await this.createAuditLog({
      userId,
      action: `data_${action}`,
      resource,
      resourceId,
      method: 'GET',
      endpoint: `/api/v1/${resource}/${resourceId}`,
      ip,
      userAgent: '',
      status: 'success',
      statusCode: 200,
      duration: 0,
      tags: ['data_access', action],
    });
  }
}
