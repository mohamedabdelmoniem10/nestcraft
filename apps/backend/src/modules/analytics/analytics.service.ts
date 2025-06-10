import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsEvent } from './schemas/analytics-event.schema';

export interface CreateAnalyticsEventDto {
  eventType: string;
  eventName: string;
  category: string;
  userId?: string;
  sessionId?: string;
  deviceId?: string;
  ip: string;
  userAgent: string;
  properties: Record<string, any>;
  value?: number;
  page?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  pageLoadTime?: number;
  renderTime?: number;
  responseTime?: number;
  customFields?: Record<string, any>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly events: AnalyticsEvent[] = []; // In-memory storage for now

  async trackEvent(data: CreateAnalyticsEventDto): Promise<AnalyticsEvent> {
    try {
      const event: AnalyticsEvent = {
        ...data,
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        createdAt: new Date(),
        // Parse user agent for device info
        ...this.parseUserAgent(data.userAgent),
        // Parse IP for location (would need external service in production)
        country: await this.getCountryFromIP(data.ip),
        city: await this.getCityFromIP(data.ip),
      };

      // Store in memory (in production, this would go to MongoDB)
      this.events.push(event);

      this.logger.log(
        `Analytics event tracked: ${data.eventType}/${data.eventName} for user ${
          data.userId || 'anonymous'
        }`,
      );

      return event;
    } catch (error) {
      this.logger.error('Failed to track analytics event:', error);
      throw error;
    }
  }

  async getEvents(filters: {
    eventType?: string;
    eventName?: string;
    category?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ events: AnalyticsEvent[]; total: number }> {
    try {
      let filteredEvents = [...this.events];

      // Apply filters
      if (filters.eventType) {
        filteredEvents = filteredEvents.filter((event) => event.eventType === filters.eventType);
      }
      if (filters.eventName) {
        filteredEvents = filteredEvents.filter((event) => event.eventName === filters.eventName);
      }
      if (filters.category) {
        filteredEvents = filteredEvents.filter((event) => event.category === filters.category);
      }
      if (filters.userId) {
        filteredEvents = filteredEvents.filter((event) => event.userId === filters.userId);
      }
      if (filters.dateFrom) {
        filteredEvents = filteredEvents.filter((event) => event.timestamp >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filteredEvents = filteredEvents.filter((event) => event.timestamp <= filters.dateTo!);
      }

      // Sort by timestamp (most recent first)
      filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      const total = filteredEvents.length;
      const offset = filters.offset || 0;
      const limit = filters.limit || 100;
      const paginatedEvents = filteredEvents.slice(offset, offset + limit);

      return { events: paginatedEvents, total };
    } catch (error) {
      this.logger.error('Failed to get analytics events:', error);
      throw error;
    }
  }

  async getAnalyticsSummary(): Promise<{
    totalEvents: number;
    uniqueUsers: number;
    uniqueSessions: number;
    eventsByType: Record<string, number>;
    eventsByCategory: Record<string, number>;
    topPages: { page: string; views: number }[];
    deviceStats: {
      browsers: Record<string, number>;
      operatingSystems: Record<string, number>;
      devices: Record<string, number>;
    };
    performanceMetrics: {
      avgPageLoadTime: number;
      avgRenderTime: number;
      avgResponseTime: number;
    };
  }> {
    try {
      const totalEvents = this.events.length;

      // Unique users and sessions
      const uniqueUsers = new Set(this.events.map((e) => e.userId).filter(Boolean)).size;
      const uniqueSessions = new Set(this.events.map((e) => e.sessionId).filter(Boolean)).size;

      // Events by type
      const eventsByType = this.events.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Events by category
      const eventsByCategory = this.events.reduce((acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Top pages
      const pageViews = this.events
        .filter((e) => e.page)
        .reduce((acc, event) => {
          acc[event.page!] = (acc[event.page!] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const topPages = Object.entries(pageViews)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Device stats
      const browsers = this.events.reduce((acc, event) => {
        if (event.browser) {
          acc[event.browser] = (acc[event.browser] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const operatingSystems = this.events.reduce((acc, event) => {
        if (event.os) {
          acc[event.os] = (acc[event.os] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const devices = this.events.reduce((acc, event) => {
        if (event.device) {
          acc[event.device] = (acc[event.device] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Performance metrics
      const pageLoadTimes = this.events.map((e) => e.pageLoadTime).filter(Boolean) as number[];
      const renderTimes = this.events.map((e) => e.renderTime).filter(Boolean) as number[];
      const responseTimes = this.events.map((e) => e.responseTime).filter(Boolean) as number[];

      const avgPageLoadTime =
        pageLoadTimes.length > 0
          ? pageLoadTimes.reduce((a, b) => a + b, 0) / pageLoadTimes.length
          : 0;

      const avgRenderTime =
        renderTimes.length > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0;

      const avgResponseTime =
        responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0;

      return {
        totalEvents,
        uniqueUsers,
        uniqueSessions,
        eventsByType,
        eventsByCategory,
        topPages,
        deviceStats: {
          browsers,
          operatingSystems,
          devices,
        },
        performanceMetrics: {
          avgPageLoadTime,
          avgRenderTime,
          avgResponseTime,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get analytics summary:', error);
      throw error;
    }
  }

  // Specific tracking methods
  async trackPageView(
    userId: string,
    page: string,
    sessionId: string,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'page_view',
      eventName: 'page_viewed',
      category: 'navigation',
      userId,
      sessionId,
      page,
      ip,
      userAgent,
      properties: { page },
    });
  }

  async trackUserAction(
    userId: string,
    action: string,
    resource: string,
    sessionId: string,
    ip: string,
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'user_action',
      eventName: action,
      category: 'interaction',
      userId,
      sessionId,
      ip,
      userAgent: '',
      properties: { action, resource },
    });
  }

  async trackAPICall(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    ip: string,
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'api_call',
      eventName: 'api_request',
      category: 'api',
      ip,
      userAgent: '',
      responseTime,
      properties: { endpoint, method, statusCode },
    });
  }

  private parseUserAgent(userAgent: string): Partial<AnalyticsEvent> {
    // Simple user agent parsing (in production, use a library like ua-parser-js)
    const result: Partial<AnalyticsEvent> = {};

    if (userAgent.includes('Chrome')) {
      result.browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      result.browser = 'Firefox';
    } else if (userAgent.includes('Safari')) {
      result.browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      result.browser = 'Edge';
    } else {
      result.browser = 'Unknown';
    }

    if (userAgent.includes('Windows')) {
      result.os = 'Windows';
    } else if (userAgent.includes('Mac')) {
      result.os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      result.os = 'Linux';
    } else if (userAgent.includes('Android')) {
      result.os = 'Android';
    } else if (userAgent.includes('iOS')) {
      result.os = 'iOS';
    } else {
      result.os = 'Unknown';
    }

    if (userAgent.includes('Mobile')) {
      result.device = 'Mobile';
    } else if (userAgent.includes('Tablet')) {
      result.device = 'Tablet';
    } else {
      result.device = 'Desktop';
    }

    return result;
  }

  private async getCountryFromIP(ip: string): Promise<string | undefined> {
    // In production, use a geo-location service
    // For now, return undefined or mock data
    if (ip.startsWith('192.168.') || ip === '127.0.0.1') {
      return 'Local';
    }
    return 'Unknown';
  }

  private async getCityFromIP(ip: string): Promise<string | undefined> {
    // In production, use a geo-location service
    // For now, return undefined or mock data
    if (ip.startsWith('192.168.') || ip === '127.0.0.1') {
      return 'Local';
    }
    return 'Unknown';
  }
}
