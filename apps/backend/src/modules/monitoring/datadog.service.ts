import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataDogConfig } from '../../config/datadog.config';

// Import DataDog libraries with proper typing
let StatsD: any;
let tracer: any;

try {
  StatsD = require('dogstatsd-client').StatsD;
  tracer = require('dd-trace');
} catch (error) {
  console.warn('DataDog dependencies not installed. Monitoring features will be disabled.');
}

export interface MetricOptions {
  tags?: string[];
  sampleRate?: number;
}

export interface CustomMetric {
  name: string;
  value: number;
  tags?: string[];
  timestamp?: number;
}

@Injectable()
export class DataDogService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DataDogService.name);
  private config: DataDogConfig;
  private statsClient: any;
  private isEnabled = false;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<DataDogConfig>('datadog')!;
  }

  async onModuleInit() {
    if (!this.config.enabled || !this.config.apiKey) {
      this.logger.warn('DataDog monitoring is disabled (missing API key or disabled in config)');
      return;
    }

    try {
      await this.initializeDataDog();
      this.isEnabled = true;
      this.logger.log('✅ DataDog monitoring initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize DataDog monitoring:', error);
    }
  }

  async onModuleDestroy() {
    if (this.statsClient) {
      this.statsClient.close();
      this.logger.log('DataDog StatsD client closed');
    }
  }

  private async initializeDataDog() {
    // Initialize APM tracer
    if (this.config.apm.enabled && tracer) {
      tracer.init({
        service: this.config.service,
        env: this.config.environment,
        version: this.config.version,
        sampleRate: this.config.apm.sampleRate,
        hostname: this.config.apm.hostname,
        logInjection: true,
        runtimeMetrics: true,
        plugins: {
          http: { enabled: true },
          express: { enabled: true },
          postgres: { enabled: true },
          redis: { enabled: true },
        },
      });

      this.logger.log('DataDog APM tracer initialized');
    }

    // Initialize StatsD client for custom metrics
    if (this.config.metrics.enabled && StatsD) {
      this.statsClient = new StatsD({
        host: process.env.DATADOG_AGENT_HOST || 'localhost',
        port: parseInt(process.env.DATADOG_AGENT_PORT || '8125', 10),
        globalTags: [
          `service:${this.config.service}`,
          `env:${this.config.environment}`,
          `version:${this.config.version}`,
        ],
      });

      this.logger.log('DataDog StatsD client initialized');
    }
  }

  // Metrics Methods
  increment(metric: string, value: number = 1, options: MetricOptions = {}): void {
    if (!this.isEnabled || !this.statsClient) return;

    try {
      this.statsClient.increment(metric, value, options.tags, options.sampleRate);
    } catch (error) {
      this.logger.error(`Failed to send increment metric ${metric}:`, error);
    }
  }

  decrement(metric: string, value: number = 1, options: MetricOptions = {}): void {
    if (!this.isEnabled || !this.statsClient) return;

    try {
      this.statsClient.decrement(metric, value, options.tags, options.sampleRate);
    } catch (error) {
      this.logger.error(`Failed to send decrement metric ${metric}:`, error);
    }
  }

  gauge(metric: string, value: number, options: MetricOptions = {}): void {
    if (!this.isEnabled || !this.statsClient) return;

    try {
      this.statsClient.gauge(metric, value, options.tags, options.sampleRate);
    } catch (error) {
      this.logger.error(`Failed to send gauge metric ${metric}:`, error);
    }
  }

  histogram(metric: string, value: number, options: MetricOptions = {}): void {
    if (!this.isEnabled || !this.statsClient) return;

    try {
      this.statsClient.histogram(metric, value, options.tags, options.sampleRate);
    } catch (error) {
      this.logger.error(`Failed to send histogram metric ${metric}:`, error);
    }
  }

  timing(metric: string, value: number, options: MetricOptions = {}): void {
    if (!this.isEnabled || !this.statsClient) return;

    try {
      this.statsClient.timing(metric, value, options.tags, options.sampleRate);
    } catch (error) {
      this.logger.error(`Failed to send timing metric ${metric}:`, error);
    }
  }

  // Application-specific metrics
  trackApiRequest(endpoint: string, method: string, statusCode: number, duration: number): void {
    const tags = [`endpoint:${endpoint}`, `method:${method}`, `status_code:${statusCode}`];

    this.increment('api.requests.total', 1, { tags });
    this.timing('api.requests.duration', duration, { tags });

    if (statusCode >= 400) {
      this.increment('api.requests.errors', 1, { tags });
    }
  }

  trackUserAction(action: string, userId?: string): void {
    const tags = [`action:${action}`];
    if (userId) {
      tags.push(`user_id:${userId}`);
    }

    this.increment('user.actions.total', 1, { tags });
  }

  trackDatabaseQuery(operation: string, table: string, duration: number): void {
    const tags = [`operation:${operation}`, `table:${table}`];

    this.increment('database.queries.total', 1, { tags });
    this.timing('database.queries.duration', duration, { tags });
  }

  trackCacheOperation(operation: string, hit: boolean, duration: number): void {
    const tags = [`operation:${operation}`, `hit:${hit}`];

    this.increment('cache.operations.total', 1, { tags });
    this.timing('cache.operations.duration', duration, { tags });

    if (hit) {
      this.increment('cache.hits', 1, { tags });
    } else {
      this.increment('cache.misses', 1, { tags });
    }
  }

  trackBusinessMetric(metric: string, value: number, tags: string[] = []): void {
    this.gauge(`business.${metric}`, value, { tags });
  }

  // Error tracking
  trackError(error: Error, context?: Record<string, any>): void {
    const tags = [`error_type:${error.constructor.name}`, `error_message:${error.message}`];

    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        tags.push(`${key}:${value}`);
      });
    }

    this.increment('errors.total', 1, { tags });
  }

  // Performance monitoring
  trackMemoryUsage(): void {
    if (!this.isEnabled) return;

    const memUsage = process.memoryUsage();

    this.gauge('system.memory.heap_used', memUsage.heapUsed);
    this.gauge('system.memory.heap_total', memUsage.heapTotal);
    this.gauge('system.memory.external', memUsage.external);
    this.gauge('system.memory.rss', memUsage.rss);
  }

  trackEventLoopLag(): void {
    if (!this.isEnabled) return;

    const start = process.hrtime.bigint();
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds
      this.histogram('system.event_loop.lag', lag);
    });
  }

  // Custom dashboard metrics
  sendCustomMetrics(metrics: CustomMetric[]): void {
    if (!this.isEnabled) return;

    metrics.forEach((metric) => {
      this.gauge(metric.name, metric.value, { tags: metric.tags });
    });
  }

  // Tracing methods
  createSpan(operationName: string, options?: any): any {
    if (!this.isEnabled || !tracer) return null;

    try {
      return tracer.startSpan(operationName, options);
    } catch (error) {
      this.logger.error(`Failed to create span ${operationName}:`, error);
      return null;
    }
  }

  getCurrentSpan(): any {
    if (!this.isEnabled || !tracer) return null;

    try {
      return tracer.scope().active();
    } catch (error) {
      this.logger.error('Failed to get current span:', error);
      return null;
    }
  }

  // Health check for DataDog connection
  async healthCheck(): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      // Send a test metric
      this.increment('health.check', 1, { tags: ['source:health_check'] });
      return true;
    } catch (error) {
      this.logger.error('DataDog health check failed:', error);
      return false;
    }
  }

  // Get service status
  getStatus(): {
    enabled: boolean;
    apmEnabled: boolean;
    metricsEnabled: boolean;
    service: string;
    environment: string;
  } {
    return {
      enabled: this.isEnabled,
      apmEnabled: this.config.apm.enabled,
      metricsEnabled: this.config.metrics.enabled,
      service: this.config.service,
      environment: this.config.environment,
    };
  }
}
