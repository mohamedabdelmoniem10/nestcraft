import { Injectable, Logger } from '@nestjs/common';
import { PluginModule, PluginRegistryInterface } from '../interfaces/plugin.interface';

@Injectable()
export class PluginRegistryService implements PluginRegistryInterface {
  private readonly logger = new Logger(PluginRegistryService.name);
  private readonly plugins = new Map<string, PluginModule>();

  async registerPlugin(name: string, plugin: PluginModule): Promise<void> {
    try {
      if (this.plugins.has(name)) {
        throw new Error(`Plugin ${name} is already registered`);
      }

      // Set registration metadata
      plugin.registeredAt = new Date();
      plugin.isActive = true;

      // Register the plugin
      this.plugins.set(name, plugin);

      // Execute onLoad hook if available
      if (plugin.onLoad) {
        await plugin.onLoad();
      }

      this.logger.log(`Plugin ${name} registered successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to register plugin ${name}: ${errorMessage}`);
      throw error;
    }
  }

  async unregisterPlugin(name: string): Promise<void> {
    try {
      const plugin = this.plugins.get(name);
      if (!plugin) {
        throw new Error(`Plugin ${name} is not registered`);
      }

      // Execute onUnload hook if available
      if (plugin.onUnload) {
        await plugin.onUnload();
      }

      // Remove the plugin
      this.plugins.delete(name);

      this.logger.log(`Plugin ${name} unregistered successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to unregister plugin ${name}: ${errorMessage}`);
      throw error;
    }
  }

  getPlugin(name: string): PluginModule | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): Map<string, PluginModule> {
    return new Map(this.plugins);
  }

  isPluginRegistered(name: string): boolean {
    return this.plugins.has(name);
  }

  getActivePlugins(): PluginModule[] {
    return Array.from(this.plugins.values()).filter((plugin) => plugin.isActive);
  }

  getPluginsByHook(hookName: string): PluginModule[] {
    return Array.from(this.plugins.values()).filter(
      (plugin) => plugin.hooks.includes(hookName) && plugin.isActive,
    );
  }

  getPluginStats() {
    const plugins = Array.from(this.plugins.values());
    return {
      total: plugins.length,
      active: plugins.filter((p) => p.isActive).length,
      inactive: plugins.filter((p) => !p.isActive).length,
      totalHooks: plugins.reduce((total, plugin) => total + plugin.hooks.length, 0),
      totalRoutes: plugins.reduce((total, plugin) => total + plugin.routes.length, 0),
    };
  }
}
