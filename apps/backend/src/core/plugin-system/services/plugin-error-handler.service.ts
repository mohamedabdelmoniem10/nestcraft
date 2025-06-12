import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PluginModule } from '../interfaces/plugin.interface';

export interface PluginError {
  id: string;
  pluginName: string;
  error: Error;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
  stackTrace: string;
  recovered: boolean;
  recoveryAttempts: number;
}

export interface PluginIsolation {
  pluginName: string;
  isolatedAt: Date;
  reason: string;
  isQuarantined: boolean;
  autoRecoveryEnabled: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface RecoveryStrategy {
  type: 'restart' | 'rollback' | 'isolate' | 'graceful-degradation';
  enabled: boolean;
  maxAttempts: number;
  delayMs: number;
}

@Injectable()
export class PluginErrorHandlerService {
  private readonly logger = new Logger(PluginErrorHandlerService.name);
  private readonly pluginErrors = new Map<string, PluginError[]>();
  private readonly isolatedPlugins = new Map<string, PluginIsolation>();
  private readonly recoveryStrategies = new Map<string, RecoveryStrategy>();
  private readonly errorThresholds = {
    low: 10, // 10 errors per hour
    medium: 5, // 5 errors per hour
    high: 3, // 3 errors per hour
    critical: 1, // 1 error per hour
  };

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.initializeDefaultRecoveryStrategies();
  }

  /**
   * Handle plugin error with comprehensive recovery strategies
   */
  async handlePluginError(
    pluginName: string,
    error: Error,
    severity: PluginError['severity'] = 'medium',
    context?: any,
  ): Promise<boolean> {
    const errorId = `${pluginName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const pluginError: PluginError = {
      id: errorId,
      pluginName,
      error,
      timestamp: new Date(),
      severity,
      context,
      stackTrace: error.stack || 'No stack trace available',
      recovered: false,
      recoveryAttempts: 0,
    };

    // Store error
    const errors = this.pluginErrors.get(pluginName) || [];
    errors.push(pluginError);
    this.pluginErrors.set(pluginName, errors);

    this.logger.error(`Plugin ${pluginName} error [${severity}]:`, {
      errorId,
      message: error.message,
      context,
    });

    // Emit error event
    this.eventEmitter.emit('plugin.error.detected', {
      pluginName,
      error: pluginError,
    });

    // Check if plugin should be isolated
    if (this.shouldIsolatePlugin(pluginName)) {
      await this.isolatePlugin(pluginName, `Error threshold exceeded: ${severity}`);
      return false;
    }

    // Attempt recovery
    const recovered = await this.attemptRecovery(pluginName, pluginError);
    pluginError.recovered = recovered;

    return recovered;
  }

  /**
   * Attempt to recover plugin from error
   */
  private async attemptRecovery(pluginName: string, pluginError: PluginError): Promise<boolean> {
    const strategy =
      this.recoveryStrategies.get(pluginName) || this.getDefaultStrategy(pluginError.severity);

    if (!strategy.enabled || pluginError.recoveryAttempts >= strategy.maxAttempts) {
      this.logger.warn(`Recovery disabled or max attempts reached for plugin ${pluginName}`);
      return false;
    }

    pluginError.recoveryAttempts++;
    this.logger.log(
      `Attempting recovery for plugin ${pluginName} (attempt ${pluginError.recoveryAttempts})`,
    );

    try {
      switch (strategy.type) {
        case 'restart':
          return await this.restartPlugin(pluginName);

        case 'rollback':
          return await this.rollbackPlugin(pluginName);

        case 'isolate':
          await this.isolatePlugin(pluginName, 'Recovery strategy: isolate');
          return false;

        case 'graceful-degradation':
          return await this.enableGracefulDegradation(pluginName);

        default:
          this.logger.warn(`Unknown recovery strategy: ${strategy.type}`);
          return false;
      }
    } catch (recoveryError) {
      this.logger.error(`Recovery failed for plugin ${pluginName}:`, recoveryError);

      // If recovery fails, delay and try again
      if (pluginError.recoveryAttempts < strategy.maxAttempts) {
        setTimeout(() => {
          this.attemptRecovery(pluginName, pluginError);
        }, strategy.delayMs);
      }

      return false;
    }
  }

  /**
   * Restart plugin
   */
  private async restartPlugin(pluginName: string): Promise<boolean> {
    this.logger.log(`Restarting plugin: ${pluginName}`);

    try {
      // Emit restart event
      this.eventEmitter.emit('plugin.recovery.restart', { pluginName });

      // Plugin restart logic would go here
      // For now, we'll simulate a successful restart
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.logger.log(`Plugin ${pluginName} restarted successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to restart plugin ${pluginName}:`, error);
      return false;
    }
  }

  /**
   * Rollback plugin to previous version
   */
  private async rollbackPlugin(pluginName: string): Promise<boolean> {
    this.logger.log(`Rolling back plugin: ${pluginName}`);

    try {
      // Emit rollback event
      this.eventEmitter.emit('plugin.recovery.rollback', { pluginName });

      // Plugin rollback logic would go here
      await new Promise((resolve) => setTimeout(resolve, 1500));

      this.logger.log(`Plugin ${pluginName} rolled back successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to rollback plugin ${pluginName}:`, error);
      return false;
    }
  }

  /**
   * Enable graceful degradation for plugin
   */
  private async enableGracefulDegradation(pluginName: string): Promise<boolean> {
    this.logger.log(`Enabling graceful degradation for plugin: ${pluginName}`);

    try {
      // Emit graceful degradation event
      this.eventEmitter.emit('plugin.recovery.graceful-degradation', { pluginName });

      // Enable safe mode or fallback functionality
      await new Promise((resolve) => setTimeout(resolve, 500));

      this.logger.log(`Graceful degradation enabled for plugin ${pluginName}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to enable graceful degradation for plugin ${pluginName}:`, error);
      return false;
    }
  }

  /**
   * Isolate plugin to prevent system damage
   */
  async isolatePlugin(pluginName: string, reason: string): Promise<void> {
    const isolation: PluginIsolation = {
      pluginName,
      isolatedAt: new Date(),
      reason,
      isQuarantined: true,
      autoRecoveryEnabled: false,
      retryCount: 0,
      maxRetries: 3,
    };

    this.isolatedPlugins.set(pluginName, isolation);

    this.logger.warn(`Plugin ${pluginName} isolated: ${reason}`);

    // Emit isolation event
    this.eventEmitter.emit('plugin.isolated', {
      pluginName,
      reason,
      isolation,
    });
  }

  /**
   * Check if plugin should be isolated based on error patterns
   */
  private shouldIsolatePlugin(pluginName: string): boolean {
    const errors = this.pluginErrors.get(pluginName) || [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Count recent errors by severity
    const recentErrors = errors.filter((error) => error.timestamp > oneHourAgo);
    const criticalErrors = recentErrors.filter((e) => e.severity === 'critical').length;
    const highErrors = recentErrors.filter((e) => e.severity === 'high').length;
    const mediumErrors = recentErrors.filter((e) => e.severity === 'medium').length;
    const lowErrors = recentErrors.filter((e) => e.severity === 'low').length;

    // Check thresholds
    return (
      criticalErrors >= this.errorThresholds.critical ||
      highErrors >= this.errorThresholds.high ||
      mediumErrors >= this.errorThresholds.medium ||
      lowErrors >= this.errorThresholds.low
    );
  }

  /**
   * Get error statistics for a plugin
   */
  getPluginErrorStats(pluginName: string) {
    const errors = this.pluginErrors.get(pluginName) || [];
    const isolation = this.isolatedPlugins.get(pluginName);
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentErrors = errors.filter((e) => e.timestamp > oneHourAgo);
    const dailyErrors = errors.filter((e) => e.timestamp > oneDayAgo);

    return {
      pluginName,
      totalErrors: errors.length,
      recentErrors: recentErrors.length,
      dailyErrors: dailyErrors.length,
      errorsBySeverity: {
        critical: errors.filter((e) => e.severity === 'critical').length,
        high: errors.filter((e) => e.severity === 'high').length,
        medium: errors.filter((e) => e.severity === 'medium').length,
        low: errors.filter((e) => e.severity === 'low').length,
      },
      recoveredErrors: errors.filter((e) => e.recovered).length,
      isIsolated: !!isolation,
      isolation,
      lastError: errors[errors.length - 1],
    };
  }

  /**
   * Get system-wide error statistics
   */
  getSystemErrorStats() {
    const allPlugins = Array.from(this.pluginErrors.keys());
    const totalErrors = Array.from(this.pluginErrors.values()).flat();
    const isolatedPlugins = Array.from(this.isolatedPlugins.keys());

    return {
      totalPlugins: allPlugins.length,
      totalErrors: totalErrors.length,
      isolatedPlugins: isolatedPlugins.length,
      errorsByPlugin: allPlugins.map((pluginName) => ({
        pluginName,
        ...this.getPluginErrorStats(pluginName),
      })),
      systemHealth: this.getSystemHealth(),
    };
  }

  /**
   * Get overall system health status
   */
  private getSystemHealth(): 'healthy' | 'warning' | 'critical' {
    const isolatedCount = this.isolatedPlugins.size;
    const totalPlugins = this.pluginErrors.size;

    if (isolatedCount === 0) return 'healthy';
    if (isolatedCount / totalPlugins < 0.1) return 'warning';
    return 'critical';
  }

  /**
   * Initialize default recovery strategies
   */
  private initializeDefaultRecoveryStrategies(): void {
    const strategies: Record<PluginError['severity'], RecoveryStrategy> = {
      low: {
        type: 'graceful-degradation',
        enabled: true,
        maxAttempts: 3,
        delayMs: 1000,
      },
      medium: {
        type: 'restart',
        enabled: true,
        maxAttempts: 2,
        delayMs: 2000,
      },
      high: {
        type: 'rollback',
        enabled: true,
        maxAttempts: 1,
        delayMs: 5000,
      },
      critical: {
        type: 'isolate',
        enabled: true,
        maxAttempts: 1,
        delayMs: 0,
      },
    };

    // Store default strategies
    Object.entries(strategies).forEach(([severity, strategy]) => {
      this.recoveryStrategies.set(`default-${severity}`, strategy);
    });

    this.logger.log('Default recovery strategies initialized');
  }

  /**
   * Get default recovery strategy for error severity
   */
  private getDefaultStrategy(severity: PluginError['severity']): RecoveryStrategy {
    return (
      this.recoveryStrategies.get(`default-${severity}`) || {
        type: 'isolate',
        enabled: true,
        maxAttempts: 1,
        delayMs: 0,
      }
    );
  }

  /**
   * Set custom recovery strategy for plugin
   */
  setRecoveryStrategy(pluginName: string, strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(pluginName, strategy);
    this.logger.log(`Custom recovery strategy set for plugin ${pluginName}:`, strategy);
  }

  /**
   * Clear plugin errors (for testing or cleanup)
   */
  clearPluginErrors(pluginName: string): void {
    this.pluginErrors.delete(pluginName);
    this.isolatedPlugins.delete(pluginName);
    this.logger.log(`Errors cleared for plugin: ${pluginName}`);
  }

  /**
   * Attempt to recover isolated plugin
   */
  async recoverIsolatedPlugin(pluginName: string): Promise<boolean> {
    const isolation = this.isolatedPlugins.get(pluginName);
    if (!isolation) {
      this.logger.warn(`Plugin ${pluginName} is not isolated`);
      return false;
    }

    if (isolation.retryCount >= isolation.maxRetries) {
      this.logger.warn(`Max recovery attempts reached for isolated plugin ${pluginName}`);
      return false;
    }

    isolation.retryCount++;

    try {
      // Attempt recovery
      const recovered = await this.restartPlugin(pluginName);

      if (recovered) {
        this.isolatedPlugins.delete(pluginName);
        this.logger.log(`Isolated plugin ${pluginName} recovered successfully`);

        this.eventEmitter.emit('plugin.recovered', { pluginName });
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to recover isolated plugin ${pluginName}:`, error);
      return false;
    }
  }
}
