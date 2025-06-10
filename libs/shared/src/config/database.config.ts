import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DataSourceOptions } from "typeorm";

export default registerAs(
  "database",
  (): TypeOrmModuleOptions => ({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USERNAME || "nestcraft",
    password: process.env.DB_PASSWORD || "nestcraft_dev_password",
    database: process.env.DB_DATABASE || "nestcraft_dev",

    // Connection Pool Configuration
    extra: {
      max: parseInt(process.env.DB_POOL_MAX || "20", 10),
      min: parseInt(process.env.DB_POOL_MIN || "5", 10),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || "60000", 10),
      idle: parseInt(process.env.DB_POOL_IDLE || "10000", 10),
      evict: parseInt(process.env.DB_POOL_EVICT || "1000", 10),
    },

    // Entity Configuration
    entities: [__dirname + "/../**/*.entity{.ts,.js}"],
    migrations: [__dirname + "/../database/migrations/*{.ts,.js}"],
    subscribers: [__dirname + "/../database/subscribers/*{.ts,.js}"],

    // Development Settings
    synchronize: process.env.NODE_ENV === "development",
    dropSchema: false,
    logging:
      process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
    logger: "advanced-console",

    // Migration Configuration
    migrationsRun: process.env.NODE_ENV !== "development",
    migrationsTableName: "nestcraft_migrations",

    // Schema Configuration
    schema: process.env.DB_SCHEMA || "public",

    // SSL Configuration for Production
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: false,
          }
        : false,

    // Connection Settings
    connectTimeoutMS: 60000,

    // Performance Settings
    cache: {
      type: "redis",
      options: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB_CACHE || "1", 10),
      },
      duration: parseInt(process.env.DB_CACHE_DURATION || "30000", 10), // 30 seconds
    },

    // Query Settings
    maxQueryExecutionTime: parseInt(
      process.env.DB_MAX_QUERY_TIME || "5000",
      10
    ), // 5 seconds

    // Custom Naming Strategy for NestCraft Tables
    // We'll implement this as a separate custom naming strategy class
    // For now, we'll use default naming strategy
  })
);

// DataSource configuration for migrations
export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "nestcraft",
  password: process.env.DB_PASSWORD || "nestcraft_dev_password",
  database: process.env.DB_DATABASE || "nestcraft_dev",
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/../database/migrations/*{.ts,.js}"],
  subscribers: [__dirname + "/../database/subscribers/*{.ts,.js}"],
  synchronize: false,
  logging: ["error"],
  migrationsTableName: "nestcraft_migrations",
  schema: process.env.DB_SCHEMA || "public",
};

// Database Health Check Configuration
export const healthCheckConfig = {
  timeout: 5000,
  retries: 3,
  retryDelay: 1000,
  queries: {
    simple: "SELECT 1",
    connectionCount: "SELECT count(*) FROM pg_stat_activity",
    dbSize: "SELECT pg_size_pretty(pg_database_size(current_database()))",
  },
};
