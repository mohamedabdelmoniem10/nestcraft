import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get analytics overview' })
  @ApiResponse({ status: 200, description: 'Analytics overview retrieved successfully' })
  async getAnalyticsOverview() {
    return {
      pageViews: 125432,
      pageViewsGrowth: 12.5,
      uniqueVisitors: 42318,
      uniqueVisitorsGrowth: 8.2,
      bounceRate: 32.4,
      bounceRateChange: -5.1,
      conversionRate: 3.2,
      conversionRateGrowth: 15.3,
    };
  }

  @Get('traffic-overview')
  @ApiOperation({ summary: 'Get traffic overview chart data' })
  async getTrafficOverview(@Query('period') period: string = '6m') {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [4000, 3000, 2000, 2700, 1900, 2400],
    };
  }

  @Get('user-engagement')
  @ApiOperation({ summary: 'Get user engagement chart data' })
  async getUserEngagement(@Query('period') period: string = '6m') {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [2500, 1800, 8000, 9500, 4900, 4300],
    };
  }

  @Get('content-performance')
  @ApiOperation({ summary: 'Get content performance chart data' })
  async getContentPerformance() {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [450, 520, 480, 580, 620, 480],
    };
  }

  @Get('top-content')
  @ApiOperation({ summary: 'Get top performing content' })
  async getTopContent() {
    return {
      data: [
        {
          title: 'Getting Started Guide',
          views: '12.3k',
          percentage: 45,
        },
        {
          title: 'Advanced Features',
          views: '8.7k',
          percentage: 32,
        },
        {
          title: 'API Documentation',
          views: '6.2k',
          percentage: 23,
        },
      ],
    };
  }

  @Get('real-time')
  @ApiOperation({ summary: 'Get real-time analytics data' })
  async getRealTimeData() {
    return {
      currentVisitors: 234,
      pageViewsToday: 5432,
      topPages: [
        { path: '/dashboard', views: 1234 },
        { path: '/content', views: 987 },
        { path: '/plugins', views: 654 },
      ],
      recentEvents: [
        { type: 'pageview', path: '/dashboard', timestamp: Date.now() - 1000 },
        { type: 'pageview', path: '/content', timestamp: Date.now() - 2000 },
        { type: 'pageview', path: '/plugins', timestamp: Date.now() - 3000 },
      ],
    };
  }
}
