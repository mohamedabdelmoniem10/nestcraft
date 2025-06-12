import { Injectable, Logger } from '@nestjs/common';
import { PluginModule } from '../interfaces/plugin.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface PluginMemoryInfo {
  pluginName: string;
  memoryUsage: NodeJS.MemoryUsage;
  loadTime: number;
  lastAccessed: Date;
  accessCount: number;
  isLazyLoaded: boolean;
}

interface PluginLoadOptions {
  lazy?: boolean;
  priority?: number;
  memoryLimit?: number;
  preload?: boolean;
}

@Injectable()
export class PluginPerformanceService {
  private readonly logger = new Logger(PluginPerformanceService.name);
  private readonly pluginMemory = new Map<string, PluginMemoryInfo>();
  private readonly loadQueue = new Map<string, PluginLoadOptions>();
  private readonly lazyLoadedPlugins = new Set<string>();
  private readonly memoryThreshold = 100 * 1024 * 1024; // 100MB default

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Register plugin for performance monitoring
   */
  registerPluginPerformance(pluginName: string, plugin: PluginModule): void {
    const startTime = Date.now();
    const memoryBefore = process.memoryUsage();

    // Simulate plugin loading time measurement
    setTimeout(() => {
      const loadTime = Date.now() - startTime;
      const memoryAfter = process.memoryUsage();

      const memoryInfo: PluginMemoryInfo = {
        pluginName,
        memoryUsage: {
          rss: memoryAfter.rss - memoryBefore.rss,
          heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
          heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
          external: memoryAfter.external - memoryBefore.external,
          arrayBuffers: memoryAfter.arrayBuffers - memoryBefore.arrayBuffers,
        },
        loadTime,
        lastAccessed: new Date(),
        accessCount: 1,
        isLazyLoaded: this.lazyLoadedPlugins.has(pluginName),
      };

      this.pluginMemory.set(pluginName, memoryInfo);
      this.logger.log(`Plugin ${pluginName} performance registered: ${loadTime}ms load time`);

      // Emit performance event
      this.eventEmitter.emit('plugin.performance.registered', {
        pluginName,
        performance: memoryInfo,
      });
    }, 10);
  }

  /**
   * Lazy load plugin when needed
   */
  async lazyLoadPlugin(
    pluginName: string,
    loadCallback: () => Promise<PluginModule>,
  ): Promise<PluginModule> {
    this.logger.log(`Lazy loading plugin: ${pluginName}`);

    const startTime = Date.now();
    this.lazyLoadedPlugins.add(pluginName);

    try {
      const plugin = await loadCallback();
      const loadTime = Date.now() - startTime;

      this.logger.log(`Plugin ${pluginName} lazy loaded in ${loadTime}ms`);
      this.registerPluginPerformance(pluginName, plugin);

      return plugin;
    } catch (error) {
      this.logger.error(`Failed to lazy load plugin ${pluginName}:`, error);
      this.lazyLoadedPlugins.delete(pluginName);
      throw error;
    }
  }

  /**
   * Track plugin access for optimization
   */
  trackPluginAccess(pluginName: string): void {
    const memoryInfo = this.pluginMemory.get(pluginName);
    if (memoryInfo) {
      memoryInfo.lastAccessed = new Date();
      memoryInfo.accessCount++;
      this.pluginMemory.set(pluginName, memoryInfo);
    }
  }

  /**
   * Optimize memory usage by unloading least used plugins
   */
  async optimizeMemoryUsage(): Promise<void> {
    const totalMemory = this.getTotalPluginMemoryUsage();

    if (totalMemory > this.memoryThreshold) {
      this.logger.warn(
        `Plugin memory usage (${Math.round(totalMemory / 1024 / 1024)}MB) exceeds threshold`,
      );

      // Get plugins sorted by last access time (least recently used first)
      const pluginsByUsage = Array.from(this.pluginMemory.entries())
        .sort(([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime())
        .filter(([, info]) => info.isLazyLoaded); // Only unload lazy-loaded plugins

      // Unload least used plugins until memory is acceptable
      for (const [pluginName] of pluginsByUsage) {
        if (this.getTotalPluginMemoryUsage() <= this.memoryThreshold * 0.8) break;

        await this.unloadPlugin(pluginName);
      }
    }
  }

  /**
   * Unload plugin from memory
   */
  private async unloadPlugin(pluginName: string): Promise<void> {
    this.logger.log(`Unloading plugin ${pluginName} to free memory`);

    // Emit unload event
    this.eventEmitter.emit('plugin.performance.unload', { pluginName });

    // Remove from memory tracking
    this.pluginMemory.delete(pluginName);
    this.lazyLoadedPlugins.delete(pluginName);

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Get total memory usage by all plugins
   */
  getTotalPluginMemoryUsage(): number {
    return Array.from(this.pluginMemory.values()).reduce(
      (total, info) => total + info.memoryUsage.heapUsed,
      0,
    );
  }

  /**
   * Get performance statistics for all plugins
   */
  getPerformanceStats() {
    const plugins = Array.from(this.pluginMemory.entries());

    return {
      totalPlugins: plugins.length,
      lazyLoadedPlugins: this.lazyLoadedPlugins.size,
      totalMemoryUsage: this.getTotalPluginMemoryUsage(),
      averageLoadTime:
        plugins.reduce((sum, [, info]) => sum + info.loadTime, 0) / plugins.length || 0,
      mostUsedPlugin: plugins.sort(([, a], [, b]) => b.accessCount - a.accessCount)[0]?.[0],
      memoryByPlugin: plugins.map(([name, info]) => ({
        name,
        memoryMB: Math.round((info.memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        loadTime: info.loadTime,
        accessCount: info.accessCount,
        lastAccessed: info.lastAccessed,
        isLazyLoaded: info.isLazyLoaded,
      })),
    };
  }

  /**
   * Set plugin load options for optimization
   */
  setPluginLoadOptions(pluginName: string, options: PluginLoadOptions): void {
    this.loadQueue.set(pluginName, options);
    this.logger.log(`Load options set for plugin ${pluginName}:`, options);
  }

  /**
   * Get plugin load options
   */
  getPluginLoadOptions(pluginName: string): PluginLoadOptions | undefined {
    return this.loadQueue.get(pluginName);
  }

  /**
   * Schedule performance optimization task
   */
  scheduleOptimization(): void {
    // Run optimization every 5 minutes
    setInterval(async () => {
      await this.optimizeMemoryUsage();
    }, 5 * 60 * 1000);

    this.logger.log('Performance optimization scheduled every 5 minutes');
  }

  /**
   * Get memory health status
   */
  getMemoryHealthStatus() {
    const totalMemory = this.getTotalPluginMemoryUsage();
    const percentage = (totalMemory / this.memoryThreshold) * 100;

    let status: 'healthy' | 'warning' | 'critical';
    if (percentage < 60) status = 'healthy';
    else if (percentage < 85) status = 'warning';
    else status = 'critical';

    return {
      status,
      percentage: Math.round(percentage),
      totalMemoryMB: Math.round(totalMemory / 1024 / 1024),
      thresholdMB: Math.round(this.memoryThreshold / 1024 / 1024),
      activePlugins: this.pluginMemory.size,
      lazyLoadedPlugins: this.lazyLoadedPlugins.size,
    };
  }
}
