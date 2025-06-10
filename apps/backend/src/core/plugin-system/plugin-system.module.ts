import { Module } from '@nestjs/common';
import { PluginRegistryService } from './services/plugin-registry.service';

@Module({
  providers: [PluginRegistryService],
  exports: [PluginRegistryService],
})
export class PluginSystemModule {}
