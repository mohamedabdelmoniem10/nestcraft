import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PluginRegistryService } from '../services/plugin-registry.service';
import { PluginPerformanceService } from '../services/plugin-performance.service';
import { PluginErrorHandlerService } from '../services/plugin-error-handler.service';

interface PluginHealthResponse {
  pluginName: string;
  status: 'healthy' | 'warning' | 'critical' | 'isolated';
  performance: any;
  errors: any;
  uptime: number;
}

@ApiTags('Plugin Management')
@Controller('api/plugins')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
export class PluginManagerController {
  constructor(
    private readonly registryService: PluginRegistryService,
    private readonly performanceService: PluginPerformanceService,
    private readonly errorHandlerService: PluginErrorHandlerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all registered plugins' })
  @ApiResponse({ status: 200, description: 'List of all plugins' })
  async getAllPlugins() {
    try {
      const plugins = this.registryService.getAllPlugins();
      const stats = this.registryService.getPluginStats();

      return {
        success: true,
        data: {
          plugins: Array.from(plugins.entries()).map(([name, plugin]) => ({
            name,
            metadata: plugin.metadata,
            isActive: plugin.isActive,
            registeredAt: plugin.registeredAt,
            hooks: plugin.hooks,
            routes: plugin.routes,
          })),
          stats,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to get plugins: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':pluginName')
  @ApiOperation({ summary: 'Get specific plugin details' })
  @ApiResponse({ status: 200, description: 'Plugin details' })
  @ApiResponse({ status: 404, description: 'Plugin not found' })
  async getPlugin(@Param('pluginName') pluginName: string): Promise<any> {
    try {
      const plugin = this.registryService.getPlugin(pluginName);

      if (!plugin) {
        throw new HttpException(`Plugin ${pluginName} not found`, HttpStatus.NOT_FOUND);
      }

      const performance = this.performanceService.getPerformanceStats();
      const errorStats = this.errorHandlerService.getPluginErrorStats(pluginName);

      return {
        success: true,
        data: {
          plugin: {
            name: pluginName,
            metadata: plugin.metadata,
            isActive: plugin.isActive,
            registeredAt: plugin.registeredAt,
            hooks: plugin.hooks,
            routes: plugin.routes,
          },
          performance: performance.memoryByPlugin.find((p) => p.name === pluginName),
          errors: errorStats,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to get plugin ${pluginName}: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('performance/stats')
  @ApiOperation({ summary: 'Get performance statistics for all plugins' })
  @ApiResponse({ status: 200, description: 'Performance statistics' })
  async getPerformanceStats() {
    try {
      const stats = this.performanceService.getPerformanceStats();
      const memoryHealth = this.performanceService.getMemoryHealthStatus();

      return {
        success: true,
        data: {
          performance: stats,
          memoryHealth,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to get performance stats: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('errors/stats')
  @ApiOperation({ summary: 'Get error statistics for all plugins' })
  @ApiResponse({ status: 200, description: 'Error statistics' })
  async getErrorStats(): Promise<any> {
    try {
      const stats = this.errorHandlerService.getSystemErrorStats();

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to get error stats: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health/overview')
  @ApiOperation({ summary: 'Get overall plugin system health' })
  @ApiResponse({ status: 200, description: 'System health overview' })
  async getHealthOverview(): Promise<any> {
    try {
      const pluginStats = this.registryService.getPluginStats();
      const performanceStats = this.performanceService.getPerformanceStats();
      const errorStats = this.errorHandlerService.getSystemErrorStats();
      const memoryHealth = this.performanceService.getMemoryHealthStatus();

      // Calculate overall health score
      let healthScore = 100;

      // Deduct points for errors
      if (errorStats.systemHealth === 'warning') healthScore -= 20;
      if (errorStats.systemHealth === 'critical') healthScore -= 50;

      // Deduct points for memory issues
      if (memoryHealth.status === 'warning') healthScore -= 15;
      if (memoryHealth.status === 'critical') healthScore -= 40;

      // Deduct points for isolated plugins
      healthScore -= errorStats.isolatedPlugins * 10;

      const overallStatus =
        healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical';

      return {
        success: true,
        data: {
          overallStatus,
          healthScore,
          summary: {
            totalPlugins: pluginStats.total,
            activePlugins: pluginStats.active,
            isolatedPlugins: errorStats.isolatedPlugins,
            totalErrors: errorStats.totalErrors,
            memoryUsage: `${memoryHealth.totalMemoryMB}MB`,
            memoryStatus: memoryHealth.status,
          },
          details: {
            plugins: pluginStats,
            performance: performanceStats,
            errors: errorStats,
            memory: memoryHealth,
          },
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to get health overview: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':pluginName/health')
  @ApiOperation({ summary: 'Get health status for specific plugin' })
  @ApiResponse({ status: 200, description: 'Plugin health status' })
  @ApiResponse({ status: 404, description: 'Plugin not found' })
  async getPluginHealth(
    @Param('pluginName') pluginName: string,
  ): Promise<{ success: boolean; data: PluginHealthResponse }> {
    try {
      const plugin = this.registryService.getPlugin(pluginName);

      if (!plugin) {
        throw new HttpException(`Plugin ${pluginName} not found`, HttpStatus.NOT_FOUND);
      }

      const performanceStats = this.performanceService.getPerformanceStats();
      const errorStats = this.errorHandlerService.getPluginErrorStats(pluginName);

      const pluginPerformance = performanceStats.memoryByPlugin.find((p) => p.name === pluginName);

      // Determine health status
      let status: 'healthy' | 'warning' | 'critical' | 'isolated' = 'healthy';

      if (errorStats.isIsolated) {
        status = 'isolated';
      } else if (errorStats.errorsBySeverity.critical > 0) {
        status = 'critical';
      } else if (errorStats.errorsBySeverity.high > 0 || errorStats.recentErrors > 3) {
        status = 'warning';
      }

      const uptime = plugin.registeredAt ? Date.now() - plugin.registeredAt.getTime() : 0;

      return {
        success: true,
        data: {
          pluginName,
          status,
          performance: pluginPerformance,
          errors: errorStats,
          uptime: Math.round(uptime / 1000), // seconds
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to get plugin health: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':pluginName/recover')
  @ApiOperation({ summary: 'Recover isolated plugin' })
  @ApiResponse({ status: 200, description: 'Plugin recovery attempted' })
  @ApiResponse({ status: 404, description: 'Plugin not found' })
  async recoverPlugin(@Param('pluginName') pluginName: string) {
    try {
      const recovered = await this.errorHandlerService.recoverIsolatedPlugin(pluginName);

      return {
        success: true,
        data: {
          pluginName,
          recovered,
          message: recovered
            ? `Plugin ${pluginName} recovered successfully`
            : `Failed to recover plugin ${pluginName}`,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to recover plugin ${pluginName}: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('performance/optimize')
  @ApiOperation({ summary: 'Trigger performance optimization' })
  @ApiResponse({ status: 200, description: 'Optimization triggered' })
  async optimizePerformance() {
    try {
      await this.performanceService.optimizeMemoryUsage();

      return {
        success: true,
        data: {
          message: 'Performance optimization completed',
          memoryHealth: this.performanceService.getMemoryHealthStatus(),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to optimize performance: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':pluginName/errors')
  @ApiOperation({ summary: 'Clear plugin error history' })
  @ApiResponse({ status: 200, description: 'Errors cleared' })
  async clearPluginErrors(@Param('pluginName') pluginName: string) {
    try {
      this.errorHandlerService.clearPluginErrors(pluginName);

      return {
        success: true,
        data: {
          message: `Error history cleared for plugin ${pluginName}`,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to clear plugin errors: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':pluginName/performance/track')
  @ApiOperation({ summary: 'Track plugin access for performance optimization' })
  @ApiResponse({ status: 200, description: 'Access tracked' })
  async trackPluginAccess(@Param('pluginName') pluginName: string) {
    try {
      this.performanceService.trackPluginAccess(pluginName);

      return {
        success: true,
        data: {
          message: `Access tracked for plugin ${pluginName}`,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to track plugin access: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
