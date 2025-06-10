// Types
export * from "./types";
export * from "./interfaces";
export * from "./enums";

// DTOs
export * from "./dto";

// Utils
export * from "./utils";

// Constants
export * from "./constants";

// Configuration
export * from "./config/database.config";

// Database
export * from "./database/database.module";
export * from "./database/database.service";
export * from "./database/connection-pool.service";
export * from "./database/data-source";
// Note: migration.service is available but not exported to avoid potential conflicts

// Entities
export * from "./entities/base.entity";
export { User } from "./entities/auth-user.entity";

// Types and Interfaces
export interface DatabaseConnectionInfo {
  host: string;
  port: number;
  database: string;
  username: string;
  // password excluded for security
}

export interface QueryResult<T = any> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}
