import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export interface ConnectionPoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  maxConnections: number;
  minConnections: number;
  connectionPoolUtilization: number;
  averageConnectionTime: number;
  lastOptimized: Date;
}

@Injectable()
export class ConnectionPoolService {
  private readonly logger = new Logger(ConnectionPoolService.name);
  private connectionStats: Map<string, number> = new Map();
  private lastOptimized = new Date();

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  /**
   * Get connection pool statistics
   */
  async getStats(): Promise<ConnectionPoolStats> {
    try {
      const poolStats = await this.getPoolInfo();

      return {
        totalConnections: poolStats.total,
        activeConnections: poolStats.active,
        idleConnections: poolStats.idle,
        waitingConnections: poolStats.waiting,
        maxConnections: poolStats.max,
        minConnections: poolStats.min,
        connectionPoolUtilization: (poolStats.active / poolStats.max) * 100,
        averageConnectionTime: this.getAverageConnectionTime(),
        lastOptimized: this.lastOptimized,
      };
    } catch (error) {
      this.logger.error("Failed to get connection pool stats:", error);
      throw error;
    }
  }

  /**
   * Optimize connection pool
   */
  async optimize(): Promise<void> {
    try {
      this.logger.log("Optimizing connection pool...");

      const stats = await this.getPoolInfo();

      // If utilization is low, we might want to reduce connections
      const utilization = (stats.active / stats.max) * 100;

      if (utilization < 20) {
        this.logger.log(
          "Low utilization detected, consider reducing pool size"
        );
      } else if (utilization > 80) {
        this.logger.log(
          "High utilization detected, consider increasing pool size"
        );
      }

      // Clear idle connections if too many
      if (stats.idle > stats.max * 0.5) {
        await this.clearIdleConnections();
      }

      this.lastOptimized = new Date();
      this.logger.log("Connection pool optimization completed");
    } catch (error) {
      this.logger.error("Connection pool optimization failed:", error);
      throw error;
    }
  }

  /**
   * Monitor connection health
   */
  async monitorHealth(): Promise<boolean> {
    try {
      const startTime = Date.now();
      await this.dataSource.query("SELECT 1");
      const responseTime = Date.now() - startTime;

      // Log slow connections
      if (responseTime > 1000) {
        this.logger.warn(`Slow connection detected: ${responseTime}ms`);
      }

      this.recordConnectionTime(responseTime);
      return true;
    } catch (error) {
      this.logger.error("Connection health check failed:", error);
      return false;
    }
  }

  /**
   * Force close idle connections
   */
  async clearIdleConnections(): Promise<void> {
    try {
      await this.dataSource.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE state = 'idle'
        AND state_change < NOW() - INTERVAL '30 minutes'
        AND query NOT LIKE '%pg_stat_activity%'
      `);

      this.logger.log("Cleared idle connections");
    } catch (error) {
      this.logger.error("Failed to clear idle connections:", error);
    }
  }

  /**
   * Get detailed pool information
   */
  private async getPoolInfo(): Promise<{
    total: number;
    active: number;
    idle: number;
    waiting: number;
    max: number;
    min: number;
  }> {
    const poolSize = parseInt(process.env.DB_POOL_MAX || "20", 10);
    const minSize = parseInt(process.env.DB_POOL_MIN || "5", 10);

    const [activeResult, idleResult, totalResult] = await Promise.all([
      this.dataSource.query(`
        SELECT count(*) as count 
        FROM pg_stat_activity 
        WHERE state = 'active' 
        AND application_name LIKE '%nestcraft%'
      `),
      this.dataSource.query(`
        SELECT count(*) as count 
        FROM pg_stat_activity 
        WHERE state = 'idle' 
        AND application_name LIKE '%nestcraft%'
      `),
      this.dataSource.query(`
        SELECT count(*) as count 
        FROM pg_stat_activity 
        WHERE application_name LIKE '%nestcraft%'
      `),
    ]);

    const active = parseInt(activeResult[0].count, 10);
    const idle = parseInt(idleResult[0].count, 10);
    const total = parseInt(totalResult[0].count, 10);

    return {
      total,
      active,
      idle,
      waiting: 0, // Would need more complex query to get waiting connections
      max: poolSize,
      min: minSize,
    };
  }

  /**
   * Record connection time for monitoring
   */
  private recordConnectionTime(time: number): void {
    const minute = Math.floor(Date.now() / 60000);
    const key = `connection_time_${minute}`;

    const currentAvg = this.connectionStats.get(key) || 0;
    const newAvg = (currentAvg + time) / 2;
    this.connectionStats.set(key, newAvg);

    // Keep only last 60 minutes of stats
    const cutoff = minute - 60;
    for (const [statKey] of this.connectionStats) {
      const statMinute = parseInt(statKey.split("_")[2], 10);
      if (statMinute < cutoff) {
        this.connectionStats.delete(statKey);
      }
    }
  }

  /**
   * Get average connection time
   */
  private getAverageConnectionTime(): number {
    const values = Array.from(this.connectionStats.values());
    if (values.length === 0) return 0;

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Get connection pool recommendations
   */
  async getRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];

    try {
      const stats = await this.getStats();

      if (stats.connectionPoolUtilization > 90) {
        recommendations.push("Consider increasing max pool size");
      }

      if (stats.connectionPoolUtilization < 10) {
        recommendations.push("Consider decreasing max pool size");
      }

      if (stats.averageConnectionTime > 500) {
        recommendations.push(
          "Slow connection times detected - check network or database performance"
        );
      }

      if (stats.idleConnections > stats.maxConnections * 0.6) {
        recommendations.push(
          "Too many idle connections - consider connection timeout settings"
        );
      }

      return recommendations;
    } catch (error) {
      this.logger.error("Failed to generate recommendations:", error);
      return ["Unable to generate recommendations due to monitoring error"];
    }
  }
}
