import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityManager, QueryRunner } from "typeorm";
import { healthCheckConfig } from "../config/database.config";

export interface DatabaseHealth {
  status: "healthy" | "unhealthy";
  responseTime: number;
  connectionCount: number;
  databaseSize: string;
  uptime: number;
  lastChecked: Date;
  details?: {
    error?: string;
    connections?: any;
    stats?: any;
  };
}

export interface DatabaseStats {
  totalQueries: number;
  slowQueries: number;
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  cacheHitRatio: number;
  databaseSize: string;
  tableCount: number;
  indexCount: number;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private startTime = Date.now();

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  async onModuleInit() {
    await this.validateConnection();
  }

  /**
   * Validate database connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.dataSource.query("SELECT 1");
      this.logger.log("Database connection validated successfully");
      return true;
    } catch (error) {
      this.logger.error("Database connection validation failed:", error);
      return false;
    }
  }

  /**
   * Get database health status
   */
  async getHealth(): Promise<DatabaseHealth> {
    const startTime = Date.now();

    try {
      // Test basic connectivity
      await this.dataSource.query(healthCheckConfig.queries.simple);

      // Get connection count
      const connectionResult = await this.dataSource.query(
        healthCheckConfig.queries.connectionCount
      );
      const connectionCount = parseInt(connectionResult[0].count, 10);

      // Get database size
      const sizeResult = await this.dataSource.query(
        healthCheckConfig.queries.dbSize
      );
      const databaseSize = sizeResult[0].pg_size_pretty;

      const responseTime = Date.now() - startTime;
      const uptime = Date.now() - this.startTime;

      return {
        status: "healthy",
        responseTime,
        connectionCount,
        databaseSize,
        uptime,
        lastChecked: new Date(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        status: "unhealthy",
        responseTime,
        connectionCount: 0,
        databaseSize: "unknown",
        uptime: Date.now() - this.startTime,
        lastChecked: new Date(),
        details: {
          error: (error as Error).message,
        },
      };
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<DatabaseStats> {
    try {
      const queries = await Promise.all([
        // Active connections
        this.dataSource.query(`
          SELECT count(*) as active_connections 
          FROM pg_stat_activity 
          WHERE state = 'active'
        `),
        // Idle connections
        this.dataSource.query(`
          SELECT count(*) as idle_connections 
          FROM pg_stat_activity 
          WHERE state = 'idle'
        `),
        // Total connections
        this.dataSource.query(`
          SELECT count(*) as total_connections 
          FROM pg_stat_activity
        `),
        // Database size
        this.dataSource.query(`
          SELECT pg_size_pretty(pg_database_size(current_database())) as size
        `),
        // Table count
        this.dataSource.query(`
          SELECT count(*) as table_count 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `),
        // Index count
        this.dataSource.query(`
          SELECT count(*) as index_count 
          FROM pg_indexes 
          WHERE schemaname = 'public'
        `),
      ]);

      return {
        totalQueries: 0, // Will be implemented with query monitoring
        slowQueries: 0, // Will be implemented with query monitoring
        activeConnections: parseInt(queries[0][0].active_connections, 10),
        idleConnections: parseInt(queries[1][0].idle_connections, 10),
        totalConnections: parseInt(queries[2][0].total_connections, 10),
        cacheHitRatio: 0, // Will be implemented with cache monitoring
        databaseSize: queries[3][0].size,
        tableCount: parseInt(queries[4][0].table_count, 10),
        indexCount: parseInt(queries[5][0].index_count, 10),
      };
    } catch (error) {
      this.logger.error("Failed to get database stats:", error);
      throw error;
    }
  }

  /**
   * Execute query with retry logic
   */
  async executeQuery<T = any>(
    query: string,
    parameters?: any[],
    retries = healthCheckConfig.retries
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await this.dataSource.query(query, parameters);
        return result;
      } catch (error) {
        this.logger.warn(
          `Query attempt ${attempt} failed:`,
          (error as Error).message
        );

        if (attempt === retries) {
          throw error;
        }

        await this.delay(healthCheckConfig.retryDelay * attempt);
      }
    }

    // This should never be reached due to the throw above, but TypeScript requires it
    throw new Error("Maximum retry attempts exceeded");
  }

  /**
   * Get a query runner for transactions
   */
  getQueryRunner(): QueryRunner {
    return this.dataSource.createQueryRunner();
  }

  /**
   * Get entity manager
   */
  getEntityManager(): EntityManager {
    return this.dataSource.manager;
  }

  /**
   * Execute in transaction
   */
  async executeInTransaction<T>(
    operation: (manager: EntityManager) => Promise<T>
  ): Promise<T> {
    const queryRunner = this.getQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Backup database
   */
  async createBackup(backupName?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const name = backupName || `nestcraft_backup_${timestamp}`;

    // This would typically use pg_dump or similar utility
    // Implementation depends on deployment environment
    this.logger.log(`Creating database backup: ${name}`);

    return name;
  }

  /**
   * Optimize database
   */
  async optimize(): Promise<void> {
    try {
      this.logger.log("Starting database optimization...");

      // Analyze tables for better query planning
      await this.dataSource.query("ANALYZE");

      // Vacuum to reclaim storage
      await this.dataSource.query("VACUUM (ANALYZE, VERBOSE)");

      // Reindex to improve performance
      await this.dataSource.query("REINDEX DATABASE CONCURRENTLY");

      this.logger.log("Database optimization completed");
    } catch (error) {
      this.logger.error("Database optimization failed:", error);
      throw error;
    }
  }

  /**
   * Get slow queries
   */
  async getSlowQueries(limit = 10): Promise<any[]> {
    try {
      return await this.dataSource.query(
        `
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements 
        ORDER BY mean_time DESC 
        LIMIT $1
      `,
        [limit]
      );
    } catch (error) {
      // pg_stat_statements extension might not be enabled
      this.logger.warn(
        "Could not retrieve slow queries:",
        (error as Error).message
      );
      return [];
    }
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
