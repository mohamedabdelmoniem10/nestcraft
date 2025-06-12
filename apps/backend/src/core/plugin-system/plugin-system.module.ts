import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PluginRegistryService } from './services/plugin-registry.service';
import { PluginPerformanceService } from './services/plugin-performance.service';
import { PluginErrorHandlerService } from './services/plugin-error-handler.service';
import { PluginManagerController } from './controllers/plugin-manager.controller';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [PluginManagerController],
  providers: [PluginRegistryService, PluginPerformanceService, PluginErrorHandlerService],
  exports: [PluginRegistryService, PluginPerformanceService, PluginErrorHandlerService],
})
export class PluginSystemModule {}
