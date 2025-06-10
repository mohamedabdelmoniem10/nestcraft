import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { RedisConfig } from '../../config/redis.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private cacheClient: RedisClientType;
  private sessionClient: RedisClientType;
  private pubsubClient: RedisClientType;
  private subscriberClient: RedisClientType;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = this.configService.get<RedisConfig>('redis');

    if (!redisConfig) {
      throw new Error('Redis configuration not found');
    }

    // Cache Client
    this.cacheClient = createClient({
      url: `redis://${redisConfig.password ? `:${redisConfig.password}@` : ''}${redisConfig.host}:${
        redisConfig.port
      }/${redisConfig.cache.db}`,
    });

    // Session Client
    this.sessionClient = createClient({
      url: `redis://${redisConfig.password ? `:${redisConfig.password}@` : ''}${redisConfig.host}:${
        redisConfig.port
      }/${redisConfig.session.db}`,
    });

    // Pub/Sub Clients
    this.pubsubClient = createClient({
      url: `redis://${redisConfig.password ? `:${redisConfig.password}@` : ''}${redisConfig.host}:${
        redisConfig.port
      }/${redisConfig.pubsub.db}`,
    });

    this.subscriberClient = createClient({
      url: `redis://${redisConfig.password ? `:${redisConfig.password}@` : ''}${redisConfig.host}:${
        redisConfig.port
      }/${redisConfig.pubsub.db}`,
    });

    // Connect all clients
    try {
      await Promise.all([
        this.cacheClient.connect(),
        this.sessionClient.connect(),
        this.pubsubClient.connect(),
        this.subscriberClient.connect(),
      ]);

      this.logger.log('✅ Redis clients connected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await Promise.all([
        this.cacheClient?.quit(),
        this.sessionClient?.quit(),
        this.pubsubClient?.quit(),
        this.subscriberClient?.quit(),
      ]);
      this.logger.log('✅ Redis clients disconnected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to disconnect Redis clients:', error);
    }
  }

  // Cache Methods
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.cacheClient.setEx(key, ttl, serialized);
    } else {
      await this.cacheClient.set(key, serialized);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.cacheClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string): Promise<number> {
    return await this.cacheClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.cacheClient.exists(key)) === 1;
  }

  async ttl(key: string): Promise<number> {
    return await this.cacheClient.ttl(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.cacheClient.keys(pattern);
  }

  // Session Methods
  async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    const serialized = JSON.stringify(data);
    await this.sessionClient.setEx(`session:${sessionId}`, ttl, serialized);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    const value = await this.sessionClient.get(`session:${sessionId}`);
    return value ? JSON.parse(value) : null;
  }

  async deleteSession(sessionId: string): Promise<number> {
    return await this.sessionClient.del(`session:${sessionId}`);
  }

  async extendSession(sessionId: string, ttl: number = 3600): Promise<boolean> {
    const result = await this.sessionClient.expire(`session:${sessionId}`, ttl);
    return result === true;
  }

  // Pub/Sub Methods
  async publish(channel: string, message: any): Promise<number> {
    const serialized = JSON.stringify(message);
    return await this.pubsubClient.publish(channel, serialized);
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    await this.subscriberClient.subscribe(channel, (message) => {
      try {
        const parsed = JSON.parse(message);
        callback(parsed);
      } catch (error) {
        this.logger.error(`Failed to parse message from channel ${channel}:`, error);
        callback(message);
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriberClient.unsubscribe(channel);
  }

  // Pattern Subscribe
  async pSubscribe(
    pattern: string,
    callback: (channel: string, message: any) => void,
  ): Promise<void> {
    await this.subscriberClient.pSubscribe(pattern, (message, channel) => {
      try {
        const parsed = JSON.parse(message);
        callback(channel, parsed);
      } catch (error) {
        this.logger.error(`Failed to parse message from pattern ${pattern}:`, error);
        callback(channel, message);
      }
    });
  }

  async pUnsubscribe(pattern: string): Promise<void> {
    await this.subscriberClient.pUnsubscribe(pattern);
  }

  // Health Check
  async ping(): Promise<string> {
    return await this.cacheClient.ping();
  }

  // Get Redis Clients (for advanced operations)
  getCacheClient(): RedisClientType {
    return this.cacheClient;
  }

  getSessionClient(): RedisClientType {
    return this.sessionClient;
  }

  getPubSubClient(): RedisClientType {
    return this.pubsubClient;
  }

  getSubscriberClient(): RedisClientType {
    return this.subscriberClient;
  }
}
