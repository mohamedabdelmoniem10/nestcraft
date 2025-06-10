export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies?: string[];
  hooks?: string[];
  routes?: string[];
}

export interface PluginLifecycle {
  onLoad?(): Promise<void> | void;
  onActivate?(): Promise<void> | void;
  onDeactivate?(): Promise<void> | void;
  onUnload?(): Promise<void> | void;
}

export interface PluginModule extends PluginLifecycle {
  metadata: PluginMetadata;
  registeredAt: Date;
  hooks: string[];
  routes: string[];
  isActive: boolean;
}

export enum PluginStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  LOADING = 'loading',
}

export interface PluginConfig {
  [key: string]: any;
}

export interface PluginRegistryInterface {
  registerPlugin(name: string, plugin: PluginModule): Promise<void>;
  unregisterPlugin(name: string): Promise<void>;
  getPlugin(name: string): PluginModule | undefined;
  getAllPlugins(): Map<string, PluginModule>;
  isPluginRegistered(name: string): boolean;
}
