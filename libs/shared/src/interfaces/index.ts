// Plugin Interface
export interface PluginInterface {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];

  onLoad?(): Promise<void> | void;
  onActivate?(): Promise<void> | void;
  onDeactivate?(): Promise<void> | void;
  onUnload?(): Promise<void> | void;
  onConfig?(config: any): Promise<void> | void;
}

// Theme Interface
export interface ThemeInterface {
  name: string;
  version: string;
  description?: string;
  author?: string;

  layouts: Record<string, string>;
  components: Record<string, string>;
  assets?: Record<string, string>;

  onActivate?(): Promise<void> | void;
  onDeactivate?(): Promise<void> | void;
}

// Repository Interface
export interface BaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(options?: any): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Service Interface
export interface BaseService<T> {
  findById(id: string): Promise<T>;
  findAll(query?: any): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Configuration Interface
export interface AppConfig {
  app: {
    name: string;
    version: string;
    port: number;
    environment: string;
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
}

// Event Interface
export interface BaseEvent {
  name: string;
  payload: any;
  timestamp: Date;
  source?: string;
}
