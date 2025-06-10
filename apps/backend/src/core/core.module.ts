import { Global, Module } from '@nestjs/common';
import { PluginSystemModule } from './plugin-system/plugin-system.module';
import { ThemeEngineModule } from './theme-engine/theme-engine.module';
import { AuditModule } from './audit/audit.module';
import { ConfigurationModule } from './configuration/configuration.module';

@Global()
@Module({
  imports: [PluginSystemModule, ThemeEngineModule, AuditModule, ConfigurationModule],
  exports: [PluginSystemModule, ThemeEngineModule, AuditModule, ConfigurationModule],
})
export class CoreModule {}
