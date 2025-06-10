import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import databaseConfig from "../config/database.config";
import { DatabaseService } from "./database.service";
import { ConnectionPoolService } from "./connection-pool.service";
import { MigrationService } from "./migration.service";

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get("database");
        return {
          ...dbConfig,
          autoLoadEntities: true,
          retryAttempts: 3,
          retryDelay: 3000,
          verboseRetryLog: true,
          // Connection Pool Optimization
          poolSize: parseInt(process.env.DB_POOL_SIZE || "10", 10),
          // Monitoring and Performance
          logging:
            process.env.NODE_ENV === "development"
              ? ["query", "error", "warn"]
              : ["error"],
          maxQueryExecutionTime: parseInt(
            process.env.DB_MAX_QUERY_TIME || "5000",
            10
          ),
          // Entity and Migration paths
          entities: [__dirname + "/../**/*.entity{.ts,.js}"],
          migrations: [__dirname + "/migrations/*{.ts,.js}"],
          subscribers: [__dirname + "/subscribers/*{.ts,.js}"],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService, ConnectionPoolService, MigrationService],
  exports: [
    TypeOrmModule,
    DatabaseService,
    ConnectionPoolService,
    MigrationService,
  ],
})
export class DatabaseModule {}
