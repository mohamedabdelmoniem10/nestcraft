import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { RedisConfig } from '../../config/redis.config';

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTtl: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    const redisConfig = this.configService.get<RedisConfig>('redis');
    this.defaultTtl = redisConfig?.cache.ttl || 300;
  }

  // Basic Cache Operations
  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.redisService.get<T>(key);
    } catch (error) {
      this.logger.error(`Failed to get cache for key: ${key}`, error);
      return null;
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || this.defaultTtl;
      await this.redisService.set(key, value, ttl);

      // Handle tags for cache invalidation
      if (options.tags && options.tags.length > 0) {
        await this.addToTags(key, options.tags);
      }
    } catch (error) {
      this.logger.error(`Failed to set cache for key: ${key}`, error);
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redisService.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to delete cache for key: ${key}`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return await this.redisService.exists(key);
    } catch (error) {
      this.logger.error(`Failed to check existence for key: ${key}`, error);
      return false;
    }
  }

  async getTtl(key: string): Promise<number> {
    try {
      return await this.redisService.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get TTL for key: ${key}`, error);
      return -1;
    }
  }

  // Advanced Operations
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, compute value
    try {
      const value = await factory();
      await this.set(key, value, options);
      return value;
    } catch (error) {
      this.logger.error(`Failed to compute value for key: ${key}`, error);
      throw error;
    }
  }

  async remember<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    return this.getOrSet(key, factory, { ttl });
  }

  // Cache Invalidation by Tags
  private async addToTags(key: string, tags: string[]): Promise<void> {
    const operations = tags.map((tag) => {
      const tagKey = `tag:${tag}`;
      return this.redisService.getCacheClient().sAdd(tagKey, key);
    });

    await Promise.all(operations);
  }

  async invalidateByTag(tag: string): Promise<number> {
    try {
      const tagKey = `tag:${tag}`;
      const keys = await this.redisService.getCacheClient().sMembers(tagKey);

      if (keys.length === 0) {
        return 0;
      }

      // Delete all keys associated with this tag
      const deleteOperations = keys.map((key) => this.redisService.del(key));
      await Promise.all(deleteOperations);

      // Delete the tag set itself
      await this.redisService.del(tagKey);

      this.logger.log(`Invalidated ${keys.length} cache entries for tag: ${tag}`);
      return keys.length;
    } catch (error) {
      this.logger.error(`Failed to invalidate cache by tag: ${tag}`, error);
      return 0;
    }
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    const operations = tags.map((tag) => this.invalidateByTag(tag));
    const results = await Promise.all(operations);
    return results.reduce((total, count) => total + count, 0);
  }

  // Pattern-based operations
  async deleteByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redisService.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      const deleteOperations = keys.map((key) => this.redisService.del(key));
      await Promise.all(deleteOperations);

      this.logger.log(`Deleted ${keys.length} cache entries matching pattern: ${pattern}`);
      return keys.length;
    } catch (error) {
      this.logger.error(`Failed to delete cache by pattern: ${pattern}`, error);
      return 0;
    }
  }

  // Cache Statistics
  async getStats(): Promise<{
    totalKeys: number;
    keysByPattern: Record<string, number>;
    memory: string;
  }> {
    try {
      const cacheClient = this.redisService.getCacheClient();

      // Get all keys
      const allKeys = await this.redisService.keys('*');

      // Group by patterns
      const patterns = {
        'user:*': await this.redisService.keys('user:*'),
        'session:*': await this.redisService.keys('session:*'),
        'api:*': await this.redisService.keys('api:*'),
        'tag:*': await this.redisService.keys('tag:*'),
      };

      const keysByPattern = Object.entries(patterns).reduce((acc, [pattern, keys]) => {
        acc[pattern] = keys.length;
        return acc;
      }, {} as Record<string, number>);

      // Get memory info
      const info = await cacheClient.info('memory');
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const memory = memoryMatch ? memoryMatch[1].trim() : 'unknown';

      return {
        totalKeys: allKeys.length,
        keysByPattern,
        memory,
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats', error);
      return {
        totalKeys: 0,
        keysByPattern: {},
        memory: 'unknown',
      };
    }
  }

  // Cache Health Check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redisService.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Cache health check failed', error);
      return false;
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    try {
      await this.redisService.getCacheClient().flushDb();
      this.logger.log('Cache cleared successfully');
    } catch (error) {
      this.logger.error('Failed to clear cache', error);
    }
  }
}
