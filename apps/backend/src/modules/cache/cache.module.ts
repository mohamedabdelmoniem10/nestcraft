import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule],
  providers: [CacheService, RedisService],
  exports: [CacheService, RedisService],
})
export class CacheModule {}
