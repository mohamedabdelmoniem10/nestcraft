import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class InitialSchema1700000000000 implements MigrationInterface {
  name = "InitialSchema1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create UUID extension if not exists
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create ENUM types
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'moderator', 'editor', 'author', 'contributor', 'subscriber', 'user');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
          CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'suspended', 'banned');
        END IF;
      END
      $$;
    `);

    // Create nc_users table
    await queryRunner.createTable(
      new Table({
        name: "nc_users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
            comment: "Primary key UUID",
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            comment: "Creation timestamp",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            comment: "Last update timestamp",
          },
          {
            name: "deleted_at",
            type: "timestamptz",
            isNullable: true,
            comment: "Soft delete timestamp",
          },
          {
            name: "version",
            type: "int",
            default: 1,
            comment: "Optimistic locking version",
          },
          {
            name: "created_by",
            type: "varchar",
            length: "100",
            isNullable: true,
            comment: "User who created this record",
          },
          {
            name: "updated_by",
            type: "varchar",
            length: "100",
            isNullable: true,
            comment: "User who last updated this record",
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
            comment: "Additional metadata for the record",
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
            comment: "Is record active/enabled",
          },
          // User specific fields
          {
            name: "email",
            type: "varchar",
            length: "100",
            isUnique: true,
            comment: "User email address",
          },
          {
            name: "username",
            type: "varchar",
            length: "50",
            isUnique: true,
            comment: "Username for login",
          },
          {
            name: "password",
            type: "varchar",
            length: "255",
            comment: "Hashed password",
          },
          {
            name: "first_name",
            type: "varchar",
            length: "100",
            comment: "User first name",
          },
          {
            name: "last_name",
            type: "varchar",
            length: "100",
            comment: "User last name",
          },
          {
            name: "phone",
            type: "varchar",
            length: "20",
            isNullable: true,
            comment: "User phone number",
          },
          {
            name: "avatar",
            type: "varchar",
            length: "500",
            isNullable: true,
            comment: "Profile picture URL",
          },
          {
            name: "bio",
            type: "text",
            isNullable: true,
            comment: "User biography",
          },
          {
            name: "role",
            type: "enum",
            enum: [
              "super_admin",
              "admin",
              "moderator",
              "editor",
              "author",
              "contributor",
              "subscriber",
              "user",
            ],
            default: "'user'",
            comment: "User role/permission level",
          },
          {
            name: "status",
            type: "enum",
            enum: ["active", "inactive", "pending", "suspended", "banned"],
            default: "'pending'",
            comment: "User account status",
          },
          {
            name: "email_verified_at",
            type: "timestamptz",
            isNullable: true,
            comment: "Email verification timestamp",
          },
          {
            name: "last_login_at",
            type: "timestamptz",
            isNullable: true,
            comment: "Last login timestamp",
          },
          {
            name: "last_login_ip",
            type: "inet",
            isNullable: true,
            comment: "Last login IP address",
          },
          {
            name: "timezone",
            type: "varchar",
            length: "10",
            isNullable: true,
            comment: "User timezone",
          },
          {
            name: "language",
            type: "varchar",
            length: "10",
            isNullable: true,
            comment: "User language preference",
          },
          {
            name: "preferences",
            type: "jsonb",
            isNullable: true,
            comment: "User preferences and settings",
          },
          {
            name: "social_links",
            type: "jsonb",
            isNullable: true,
            comment: "User social media links",
          },
          {
            name: "two_factor_enabled",
            type: "boolean",
            default: false,
            comment: "Two-factor authentication enabled",
          },
          {
            name: "two_factor_secret",
            type: "varchar",
            length: "255",
            isNullable: true,
            comment: "Two-factor authentication secret",
          },
          {
            name: "backup_codes",
            type: "text",
            isArray: true,
            isNullable: true,
            comment: "Two-factor backup codes",
          },
          {
            name: "password_reset_token",
            type: "varchar",
            length: "255",
            isNullable: true,
            comment: "Password reset token",
          },
          {
            name: "password_reset_expires_at",
            type: "timestamptz",
            isNullable: true,
            comment: "Password reset token expiry",
          },
          {
            name: "email_verification_token",
            type: "varchar",
            length: "255",
            isNullable: true,
            comment: "Email verification token",
          },
          {
            name: "failed_login_attempts",
            type: "int",
            default: 0,
            comment: "Failed login attempts count",
          },
          {
            name: "locked_until",
            type: "timestamptz",
            isNullable: true,
            comment: "Account locked until timestamp",
          },
        ],
        indices: [
          {
            name: "idx_users_email",
            columnNames: ["email"],
            isUnique: true,
          },
          {
            name: "idx_users_username",
            columnNames: ["username"],
            isUnique: true,
          },
          {
            name: "idx_users_created_at",
            columnNames: ["created_at"],
          },
          {
            name: "idx_users_updated_at",
            columnNames: ["updated_at"],
          },
          {
            name: "idx_users_deleted_at",
            columnNames: ["deleted_at"],
          },
          {
            name: "idx_users_is_active",
            columnNames: ["is_active"],
          },
          {
            name: "idx_users_role",
            columnNames: ["role"],
          },
          {
            name: "idx_users_status",
            columnNames: ["status"],
          },
          {
            name: "idx_users_last_login",
            columnNames: ["last_login_at"],
          },
          {
            name: "idx_users_status_active",
            columnNames: ["status", "is_active"],
          },
          {
            name: "idx_users_role_active",
            columnNames: ["role", "is_active"],
          },
        ],
      }),
      true
    );

    // Create triggers for updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_nc_users_updated_at 
      BEFORE UPDATE ON nc_users 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Insert default super admin user
    await queryRunner.query(`
      INSERT INTO nc_users (
        id, email, username, password, first_name, last_name, 
        role, status, email_verified_at, is_active, created_at, updated_at
      ) VALUES (
        uuid_generate_v4(),
        'admin@nestcraft.dev',
        'admin',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiNDjJaEQ9g2', -- password: admin123
        'NestCraft',
        'Admin',
        'super_admin',
        'active',
        CURRENT_TIMESTAMP,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      ) ON CONFLICT (email) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers and functions
    await queryRunner.query(
      "DROP TRIGGER IF EXISTS update_nc_users_updated_at ON nc_users"
    );
    await queryRunner.query(
      "DROP FUNCTION IF EXISTS update_updated_at_column()"
    );

    // Drop tables
    await queryRunner.dropTable("nc_users");

    // Drop ENUM types
    await queryRunner.query("DROP TYPE IF EXISTS user_status");
    await queryRunner.query("DROP TYPE IF EXISTS user_role");
  }
}
