import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboardStats() {
    return {
      totalUsers: 12543,
      userGrowth: 12.5,
      totalContent: 8921,
      contentGrowth: 8.3,
      pageViews: 1254320,
      pageViewsGrowth: 23.1,
      revenue: 45230,
      revenueGrowth: 18.7,
      onlineUsers: 1234,
    };
  }

  @Get('user-growth')
  @ApiOperation({ summary: 'Get user growth chart data' })
  async getUserGrowthData() {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [2500, 1800, 4200, 7500, 4800, 3800],
    };
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity feed' })
  async getRecentActivity() {
    return {
      data: [
        {
          id: '1',
          type: 'user_registered',
          message: 'New user Sarah Wilson registered',
          user: {
            name: 'Sarah Wilson',
            avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson',
          },
          timestamp: '5 months ago',
        },
        {
          id: '2',
          type: 'content_published',
          message: 'Post "Getting Started with NestCraft" was published',
          user: {
            name: 'John Doe',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe',
          },
          timestamp: '5 months ago',
        },
        {
          id: '3',
          type: 'plugin_installed',
          message: 'Plugin "SEO Optimizer" was installed',
          user: {
            name: 'Admin',
            avatar: 'https://ui-avatars.com/api/?name=Admin',
          },
          timestamp: '5 months ago',
        },
        {
          id: '4',
          type: 'system_update',
          message: 'System updated to version 2.1.0',
          user: {
            name: 'System',
            avatar: 'https://ui-avatars.com/api/?name=System',
          },
          timestamp: '5 months ago',
        },
        {
          id: '5',
          type: 'user_registered',
          message: 'New user Mike Johnson registered',
          user: {
            name: 'Mike Johnson',
            avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson',
          },
          timestamp: '5 months ago',
        },
      ],
    };
  }

  @Get('content-performance')
  @ApiOperation({ summary: 'Get content performance data' })
  async getContentPerformance() {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [150, 200, 180, 220, 250, 180],
    };
  }

  @Get('quick-stats')
  @ApiOperation({ summary: 'Get quick stats for sidebar' })
  async getQuickStats() {
    return {
      onlineUsers: 1234,
      activePlugins: 8,
      totalStorage: '2.4 GB',
      serverUptime: '99.9%',
    };
  }
}
