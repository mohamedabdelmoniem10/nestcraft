// API Constants
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  PLUGINS: {
    BASE: '/plugins',
    LOAD: (name: string) => `/plugins/${name}/load`,
    UNLOAD: (name: string) => `/plugins/${name}/unload`,
    CONFIG: (name: string) => `/plugins/${name}/config`,
    HOOKS: '/plugins/hooks',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
  },
  THEMES: {
    BASE: '/themes',
    ACTIVE: '/themes/active',
    ACTIVATE: (name: string) => `/themes/${name}/activate`,
  },
} as const;

// Default Values
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const DEFAULT_PLUGIN_CONFIG = {
  AUTO_LOAD: true,
  LOAD_ORDER: 0,
  IS_CORE: false,
} as const;

// Validation Constants
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: false,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  PLUGIN_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-z0-9-]+$/,
  },
} as const;

// Error Codes
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  ACCESS_DENIED: 'ACCESS_DENIED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  NOT_FOUND: 'NOT_FOUND',

  // Plugin
  PLUGIN_NOT_FOUND: 'PLUGIN_NOT_FOUND',
  PLUGIN_LOAD_ERROR: 'PLUGIN_LOAD_ERROR',
  PLUGIN_ALREADY_LOADED: 'PLUGIN_ALREADY_LOADED',
  PLUGIN_DEPENDENCY_ERROR: 'PLUGIN_DEPENDENCY_ERROR',

  // System
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PLUGIN_LOADED: 'Plugin loaded successfully',
  PLUGIN_UNLOADED: 'Plugin unloaded successfully',
  PLUGIN_ACTIVATED: 'Plugin activated successfully',
  PLUGIN_DEACTIVATED: 'Plugin deactivated successfully',
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    ARCHIVES: ['application/zip', 'application/x-tar', 'application/gzip'],
  },
  PATHS: {
    AVATARS: 'uploads/avatars',
    PLUGINS: 'uploads/plugins',
    THEMES: 'uploads/themes',
    TEMP: 'uploads/temp',
  },
} as const;

// Cache Constants
export const CACHE_KEYS = {
  USER_PROFILE: (id: string) => `user:profile:${id}`,
  PLUGIN_LIST: 'plugins:list',
  PLUGIN_CONFIG: (name: string) => `plugin:config:${name}`,
  THEME_ACTIVE: 'theme:active',
  SYSTEM_CONFIG: 'system:config',
} as const;

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;
