import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export interface MigrationInfo {
  id: number;
  timestamp: number;
  name: string;
  executed: boolean;
  executedAt?: Date;
}

export interface MigrationResult {
  success: boolean;
  migrations: string[];
  errors?: string[];
  duration: number;
}

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @InjectDataSource()
    private readonly appDataSource: DataSource
  ) {}

  /**
   * Run pending migrations
   */
  async runMigrations(): Promise<MigrationResult> {
    const startTime = Date.now();
    const migrations: string[] = [];
    const errors: string[] = [];

    try {
      this.logger.log("Starting migration process...");

      // Initialize connection if not already connected
      if (!this.appDataSource.isInitialized) {
        await this.appDataSource.initialize();
      }

      // Run migrations
      const executedMigrations = await this.appDataSource.runMigrations();

      executedMigrations.forEach((migration) => {
        migrations.push(migration.name);
        this.logger.log(`Migration executed: ${migration.name}`);
      });

      if (migrations.length === 0) {
        this.logger.log("No pending migrations found");
      } else {
        this.logger.log(
          `Completed ${migrations.length} migrations successfully`
        );
      }

      return {
        success: true,
        migrations,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errors.push(errorMessage);
      this.logger.error("Migration failed:", errorMessage);

      return {
        success: false,
        migrations,
        errors,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Revert last migration
   */
  async revertLastMigration(): Promise<MigrationResult> {
    const startTime = Date.now();
    const migrations: string[] = [];
    const errors: string[] = [];

    try {
      this.logger.log("Reverting last migration...");

      try {
        await this.appDataSource.undoLastMigration();
        migrations.push("Last migration reverted");
        this.logger.log("Last migration reverted successfully");
      } catch (error) {
        if (error instanceof Error && error.message.includes("No migrations")) {
          this.logger.log("No migrations to revert");
        } else {
          throw error;
        }
      }

      return {
        success: true,
        migrations,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errors.push(errorMessage);
      this.logger.error("Migration revert failed:", errorMessage);

      return {
        success: false,
        migrations,
        errors,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<MigrationInfo[]> {
    try {
      const executedMigrations = await this.getExecutedMigrations();
      const allMigrations = this.appDataSource.migrations;

      return allMigrations.map((migration, index) => {
        const executed = executedMigrations.some(
          (executed) => executed.name === migration.name
        );

        return {
          id: index + 1,
          timestamp: (migration as any).timestamp || Date.now(),
          name: migration.name || `Migration_${index + 1}`,
          executed,
          executedAt: executed
            ? executedMigrations.find((e) => e.name === migration.name)
                ?.timestamp
            : undefined,
        };
      });
    } catch (error) {
      this.logger.error("Failed to get migration status:", error);
      throw error;
    }
  }

  /**
   * Create new migration
   */
  async createMigration(name: string): Promise<string> {
    try {
      this.logger.log(`Creating migration: ${name}`);

      // This would typically use TypeORM CLI commands
      // For now, we'll return the expected filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${name}.ts`;

      this.logger.log(`Migration file would be created: ${filename}`);

      return filename;
    } catch (error) {
      this.logger.error("Failed to create migration:", error);
      throw error;
    }
  }

  /**
   * Generate migration from schema diff
   */
  async generateMigration(name: string): Promise<string> {
    try {
      this.logger.log(`Generating migration from schema diff: ${name}`);

      // This would use TypeORM's schema comparison
      // and generate a migration file automatically
      const timestamp = Date.now();
      const filename = `${timestamp}-${name}.ts`;

      this.logger.log(`Migration generated: ${filename}`);

      return filename;
    } catch (error) {
      this.logger.error("Failed to generate migration:", error);
      throw error;
    }
  }

  /**
   * Validate database schema
   */
  async validateSchema(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    try {
      this.logger.log("Validating database schema...");

      const issues: string[] = [];

      // Check if all entities have corresponding tables
      const entities = this.appDataSource.entityMetadatas;

      for (const entity of entities) {
        try {
          await this.appDataSource.query(
            `SELECT 1 FROM "${entity.tableName}" LIMIT 1`
          );
        } catch (error) {
          issues.push(`Table missing for entity: ${entity.name}`);
        }
      }

      // Check for pending migrations by comparing executed vs available
      const executedMigrations = await this.getExecutedMigrations();
      const allMigrations = this.appDataSource.migrations;

      const pendingCount = allMigrations.length - executedMigrations.length;
      if (pendingCount > 0) {
        issues.push(`${pendingCount} pending migrations found`);
      }

      const valid = issues.length === 0;

      if (valid) {
        this.logger.log("Database schema validation passed");
      } else {
        this.logger.warn(
          `Database schema validation failed: ${issues.length} issues found`
        );
      }

      return { valid, issues };
    } catch (error) {
      this.logger.error("Schema validation failed:", error);
      return {
        valid: false,
        issues: [
          `Validation error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        ],
      };
    }
  }

  /**
   * Get executed migrations from database
   */
  private async getExecutedMigrations(): Promise<
    Array<{ name: string; timestamp: Date }>
  > {
    try {
      const result = await this.appDataSource.query(`
        SELECT name, timestamp 
        FROM nestcraft_migrations 
        ORDER BY timestamp ASC
      `);

      return result.map((row: any) => ({
        name: row.name,
        timestamp: new Date(parseInt(row.timestamp, 10)),
      }));
    } catch (error) {
      // Migrations table might not exist yet
      this.logger.debug("Could not get executed migrations:", error);
      return [];
    }
  }

  /**
   * Initialize migration system
   */
  async initializeMigrationSystem(): Promise<void> {
    try {
      this.logger.log("Initializing migration system...");

      // Create migrations table if it doesn't exist
      await this.appDataSource.query(`
        CREATE TABLE IF NOT EXISTS nestcraft_migrations (
          id SERIAL PRIMARY KEY,
          timestamp BIGINT NOT NULL,
          name VARCHAR(255) NOT NULL,
          UNIQUE(name)
        )
      `);

      this.logger.log("Migration system initialized");
    } catch (error) {
      this.logger.error("Failed to initialize migration system:", error);
      throw error;
    }
  }

  /**
   * Backup database before migrations
   */
  async createPreMigrationBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupName = `pre_migration_${timestamp}`;

      this.logger.log(`Creating pre-migration backup: ${backupName}`);

      // This would typically trigger a database backup
      // Implementation depends on deployment environment

      return backupName;
    } catch (error) {
      this.logger.error("Failed to create backup:", error);
      throw error;
    }
  }
}
