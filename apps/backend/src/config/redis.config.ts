import { registerAs } from '@nestjs/config';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  cache: {
    db: number;
    ttl: number;
    max: number;
  };
  session: {
    db: number;
  };
  pubsub: {
    db: number;
  };
}

export default registerAs(
  'redis',
  (): RedisConfig => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    cache: {
      db: parseInt(process.env.REDIS_CACHE_DB || '0', 10),
      ttl: parseInt(process.env.REDIS_TTL || '300', 10), // 5 minutes default
      max: parseInt(process.env.REDIS_MAX_ITEMS || '1000', 10),
    },
    session: {
      db: parseInt(process.env.REDIS_SESSION_DB || '1', 10),
    },
    pubsub: {
      db: parseInt(process.env.REDIS_PUBSUB_DB || '2', 10),
    },
  }),
);
