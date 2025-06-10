import { registerAs } from '@nestjs/config';

export interface DataDogConfig {
  apiKey: string;
  appKey?: string;
  environment: string;
  service: string;
  version: string;
  enabled: boolean;
  apm: {
    enabled: boolean;
    sampleRate: number;
    hostname?: string;
  };
  logs: {
    enabled: boolean;
    level: string;
  };
  metrics: {
    enabled: boolean;
    flushInterval: number;
  };
  dashboards: {
    enabled: boolean;
  };
}

export default registerAs(
  'datadog',
  (): DataDogConfig => ({
    apiKey: process.env.DATADOG_API_KEY || '',
    appKey: process.env.DATADOG_APP_KEY,
    environment: process.env.NODE_ENV || 'development',
    service: process.env.DATADOG_SERVICE || 'nestcraft-backend',
    version: process.env.npm_package_version || '1.0.0',
    enabled: process.env.DATADOG_ENABLED === 'true' && !!process.env.DATADOG_API_KEY,
    apm: {
      enabled: process.env.DATADOG_APM_ENABLED !== 'false',
      sampleRate: parseFloat(process.env.DATADOG_SAMPLE_RATE || '1.0'),
      hostname: process.env.DATADOG_HOSTNAME,
    },
    logs: {
      enabled: process.env.DATADOG_LOGS_ENABLED !== 'false',
      level: process.env.DATADOG_LOG_LEVEL || 'info',
    },
    metrics: {
      enabled: process.env.DATADOG_METRICS_ENABLED !== 'false',
      flushInterval: parseInt(process.env.DATADOG_FLUSH_INTERVAL || '10000', 10),
    },
    dashboards: {
      enabled: process.env.DATADOG_DASHBOARDS_ENABLED !== 'false',
    },
  }),
);
