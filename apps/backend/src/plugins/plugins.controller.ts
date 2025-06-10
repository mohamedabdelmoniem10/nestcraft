import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Plugins')
@Controller('plugins')
export class PluginsController {
  @Get()
  @ApiOperation({ summary: 'Get all plugins' })
  @ApiResponse({ status: 200, description: 'Plugins retrieved successfully' })
  async getAllPlugins(@Query('category') category?: string, @Query('status') status?: string) {
    // Mock data matching the frontend
    return {
      data: [
        {
          id: 'seo-optimizer',
          name: 'SEO Optimizer',
          version: 'v2.1.3',
          author: 'NestCraft Team',
          description: "Advanced SEO tools to improve your site's search engine ranking",
          category: 'SEO',
          rating: 4.8,
          downloads: 15420,
          price: null,
          status: 'installed',
          isEnabled: false,
          icon: 'S',
          color: '#3B82F6',
        },
        {
          id: 'analytics-pro',
          name: 'Analytics Pro',
          version: 'v1.4.2',
          author: 'Analytics Inc',
          description: 'Comprehensive analytics and reporting dashboard',
          category: 'Analytics',
          rating: 4.6,
          downloads: 8932,
          price: 29.99,
          status: 'installed',
          isEnabled: true,
          icon: 'A',
          color: '#10B981',
        },
        {
          id: 'social-media-kit',
          name: 'Social Media Kit',
          version: 'v3.0.1',
          author: 'Social Tools Ltd',
          description: 'Complete social media integration and sharing tools',
          category: 'Social',
          rating: 4.5,
          downloads: 12786,
          price: 19.99,
          status: 'available',
          isEnabled: false,
          icon: 'S',
          color: '#8B5CF6',
        },
        {
          id: 'ecommerce-suite',
          name: 'E-commerce Suite',
          version: 'v2.8.0',
          author: 'Commerce Pro',
          description: 'Full-featured e-commerce solution with payment processing',
          category: 'E-commerce',
          rating: 4.9,
          downloads: 5431,
          price: 49.99,
          status: 'available',
          isEnabled: false,
          icon: 'E',
          color: '#F59E0B',
        },
        {
          id: 'backup-manager',
          name: 'Backup Manager',
          version: 'v1.2.1',
          author: 'Backup Solutions',
          description: 'Automated backup and restore functionality',
          category: 'Utilities',
          rating: 4.7,
          downloads: 9876,
          price: null,
          status: 'installed',
          isEnabled: true,
          icon: 'B',
          color: '#EF4444',
        },
        {
          id: 'form-builder',
          name: 'Form Builder',
          version: 'v2.3.0',
          author: 'Form Masters',
          description: 'Drag-and-drop form builder with advanced validation',
          category: 'Forms',
          rating: 4.4,
          downloads: 7654,
          price: 15.99,
          status: 'available',
          isEnabled: false,
          icon: 'F',
          color: '#06B6D4',
        },
      ],
      meta: {
        total: 6,
        installed: 3,
        available: 3,
      },
    };
  }

  @Post(':id/install')
  @ApiOperation({ summary: 'Install plugin' })
  async installPlugin(@Param('id') id: string) {
    return {
      success: true,
      message: `Plugin ${id} installed successfully`,
    };
  }

  @Post(':id/enable')
  @ApiOperation({ summary: 'Enable plugin' })
  async enablePlugin(@Param('id') id: string) {
    return {
      success: true,
      message: `Plugin ${id} enabled successfully`,
    };
  }

  @Post(':id/disable')
  @ApiOperation({ summary: 'Disable plugin' })
  async disablePlugin(@Param('id') id: string) {
    return {
      success: true,
      message: `Plugin ${id} disabled successfully`,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Uninstall plugin' })
  async uninstallPlugin(@Param('id') id: string) {
    return {
      success: true,
      message: `Plugin ${id} uninstalled successfully`,
    };
  }

  @Get(':id/config')
  @ApiOperation({ summary: 'Get plugin configuration' })
  async getPluginConfig(@Param('id') id: string) {
    return {
      pluginId: id,
      config: {
        // Mock configuration data
        apiKey: '',
        enabled: true,
        settings: {},
      },
    };
  }

  @Put(':id/config')
  @ApiOperation({ summary: 'Update plugin configuration' })
  async updatePluginConfig(@Param('id') id: string, @Body() config: any) {
    return {
      success: true,
      message: `Plugin ${id} configuration updated successfully`,
      data: config,
    };
  }
}
