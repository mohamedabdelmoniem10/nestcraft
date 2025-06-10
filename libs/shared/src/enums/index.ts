// Re-export from types
export { UserRole, PluginStatus } from '../types';

// Additional Enums
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export enum EventType {
  PLUGIN_LOADED = 'plugin.loaded',
  PLUGIN_UNLOADED = 'plugin.unloaded',
  PLUGIN_ACTIVATED = 'plugin.activated',
  PLUGIN_DEACTIVATED = 'plugin.deactivated',
  PLUGIN_ERROR = 'plugin.error',
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum PermissionResource {
  USER = 'user',
  PLUGIN = 'plugin',
  THEME = 'theme',
  SYSTEM = 'system',
  ALL = '*',
}
