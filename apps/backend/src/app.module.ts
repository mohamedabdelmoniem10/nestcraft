import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import datadogConfig from './config/datadog.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { CacheModule } from './modules/cache/cache.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

// Controllers
import { DashboardController } from './dashboard/dashboard.controller';
import { ContentController } from './content/content.controller';
import { PluginsController } from './plugins/plugins.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [authConfig, databaseConfig, redisConfig, datadogConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('database'),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),

    // Core Services
    CacheModule,
    MonitoringModule,
    AnalyticsModule,

    // API Modules
    AuthModule,
    UsersModule,
    HealthModule,
  ],
  controllers: [DashboardController, ContentController, PluginsController],
})
export class AppModule {}
