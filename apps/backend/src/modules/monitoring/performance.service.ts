import { Injectable, Logger } from '@nestjs/common';
import { DataDogService } from './datadog.service';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);
  private readonly startTime = Date.now();
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor(private readonly dataDogService: DataDogService) {
    // Start collecting metrics every minute
    this.startMetricsCollection();
  }

  private startMetricsCollection() {
    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 60000); // Every minute
  }

  collectSystemMetrics() {
    try {
      this.collectMemoryMetrics();
      this.collectCpuMetrics();
      this.collectEventLoopMetrics();
      this.collectUptimeMetrics();
    } catch (error) {
      this.logger.error('Failed to collect system metrics:', error);
    }
  }

  private collectMemoryMetrics() {
    const memUsage = process.memoryUsage();

    this.dataDogService.gauge('system.memory.heap_used', memUsage.heapUsed / 1024 / 1024); // MB
    this.dataDogService.gauge('system.memory.heap_total', memUsage.heapTotal / 1024 / 1024); // MB
    this.dataDogService.gauge('system.memory.external', memUsage.external / 1024 / 1024); // MB
    this.dataDogService.gauge('system.memory.rss', memUsage.rss / 1024 / 1024); // MB
  }

  private collectCpuMetrics() {
    const cpuUsage = process.cpuUsage();

    this.dataDogService.gauge('system.cpu.user', cpuUsage.user / 1000); // milliseconds to seconds
    this.dataDogService.gauge('system.cpu.system', cpuUsage.system / 1000); // milliseconds to seconds
  }

  private collectEventLoopMetrics() {
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds
      this.dataDogService.histogram('system.event_loop.lag', lag);
    });
  }

  private collectUptimeMetrics() {
    const uptimeSeconds = process.uptime();
    this.dataDogService.gauge('system.uptime', uptimeSeconds);
  }

  // Method to track custom performance metrics
  trackCustomMetric(name: string, value: number, tags: string[] = []) {
    this.dataDogService.gauge(`custom.${name}`, value, { tags });
  }

  // Get current performance snapshot
  getPerformanceSnapshot(): {
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
    uptime: number;
    eventLoopUtilization?: any;
  } {
    return {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      eventLoopUtilization: (process as any).eventLoopUtilization?.(),
    };
  }

  // Cleanup on destroy
  onModuleDestroy() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }
}
