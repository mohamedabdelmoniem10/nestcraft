import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataDogService } from './datadog.service';
import { PerformanceService } from './performance.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DataDogService, PerformanceService],
  exports: [DataDogService, PerformanceService],
})
export class MonitoringModule {}
