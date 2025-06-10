import {
  Entity,
  Column,
  Index,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { BaseEntity, Searchable, Filterable, Sortable } from "./base.entity";
import { Exclude } from "class-transformer";

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MODERATOR = "moderator",
  EDITOR = "editor",
  AUTHOR = "author",
  CONTRIBUTOR = "contributor",
  SUBSCRIBER = "subscriber",
  USER = "user",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended",
  BANNED = "banned",
}

@Entity("nc_users")
@Index(["email"], { unique: true })
@Index(["username"], { unique: true })
@Index(["status", "isActive"])
@Index(["role", "isActive"])
export class User extends BaseEntity {
  @Column({
    type: "varchar",
    length: 100,
    unique: true,
    comment: "User email address",
  })
  @Searchable()
  @Filterable()
  @Index("idx_user_email")
  email!: string;

  @Column({
    type: "varchar",
    length: 50,
    unique: true,
    comment: "Username for login",
  })
  @Searchable()
  @Filterable()
  @Index("idx_user_username")
  username!: string;

  @Column({
    type: "varchar",
    length: 255,
    comment: "Hashed password",
  })
  @Exclude()
  password!: string;

  @Column({
    type: "varchar",
    length: 100,
    comment: "User first name",
  })
  @Searchable()
  @Sortable()
  firstName!: string;

  @Column({
    type: "varchar",
    length: 100,
    comment: "User last name",
  })
  @Searchable()
  @Sortable()
  lastName!: string;

  @Column({
    type: "varchar",
    length: 20,
    nullable: true,
    comment: "User phone number",
  })
  @Filterable()
  phone?: string;

  @Column({
    type: "varchar",
    length: 500,
    nullable: true,
    comment: "Profile picture URL",
  })
  avatar?: string;

  @Column({
    type: "text",
    nullable: true,
    comment: "User biography",
  })
  @Searchable()
  bio?: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
    comment: "User role/permission level",
  })
  @Filterable()
  @Index("idx_user_role")
  role!: UserRole;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.PENDING,
    comment: "User account status",
  })
  @Filterable()
  @Index("idx_user_status")
  status!: UserStatus;

  @Column({
    type: "timestamptz",
    nullable: true,
    comment: "Email verification timestamp",
  })
  emailVerifiedAt?: Date;

  @Column({
    type: "timestamptz",
    nullable: true,
    comment: "Last login timestamp",
  })
  @Index("idx_last_login")
  lastLoginAt?: Date;

  @Column({
    type: "inet",
    nullable: true,
    comment: "Last login IP address",
  })
  lastLoginIp?: string;

  @Column({
    type: "varchar",
    length: 10,
    nullable: true,
    comment: "User timezone",
  })
  timezone?: string;

  @Column({
    type: "varchar",
    length: 10,
    nullable: true,
    comment: "User language preference",
  })
  language?: string;

  @Column({
    type: "jsonb",
    nullable: true,
    comment: "User preferences and settings",
  })
  preferences?: Record<string, any>;

  @Column({
    type: "jsonb",
    nullable: true,
    comment: "User social media links",
  })
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };

  @Column({
    type: "boolean",
    default: false,
    comment: "Two-factor authentication enabled",
  })
  twoFactorEnabled!: boolean;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    comment: "Two-factor authentication secret",
  })
  @Exclude()
  twoFactorSecret?: string;

  @Column({
    type: "text",
    array: true,
    nullable: true,
    comment: "Two-factor backup codes",
  })
  @Exclude()
  backupCodes?: string[];

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    comment: "Password reset token",
  })
  @Exclude()
  passwordResetToken?: string;

  @Column({
    type: "timestamptz",
    nullable: true,
    comment: "Password reset token expiry",
  })
  @Exclude()
  passwordResetExpiresAt?: Date;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    comment: "Email verification token",
  })
  @Exclude()
  emailVerificationToken?: string;

  @Column({
    type: "int",
    default: 0,
    comment: "Failed login attempts count",
  })
  @Exclude()
  failedLoginAttempts!: number;

  @Column({
    type: "timestamptz",
    nullable: true,
    comment: "Account locked until timestamp",
  })
  @Exclude()
  lockedUntil?: Date;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }

  get isLocked(): boolean {
    return !!(this.lockedUntil && this.lockedUntil > new Date());
  }

  get isAdmin(): boolean {
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(this.role);
  }

  get canLogin(): boolean {
    return (
      this.isActive &&
      this.status === UserStatus.ACTIVE &&
      !this.isLocked &&
      !this.isDeleted
    );
  }

  // Helper methods
  updateLastLogin(ip?: string): void {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ip;
    this.failedLoginAttempts = 0;
    this.lockedUntil = undefined;
  }

  incrementFailedLogin(): void {
    this.failedLoginAttempts += 1;

    // Lock account after 5 failed attempts for 30 minutes
    if (this.failedLoginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
  }

  generatePasswordResetToken(): string {
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    this.passwordResetToken = token;
    this.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    return token;
  }

  generateEmailVerificationToken(): string {
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    this.emailVerificationToken = token;
    return token;
  }

  verifyEmail(): void {
    this.emailVerifiedAt = new Date();
    this.emailVerificationToken = undefined;
    if (this.status === UserStatus.PENDING) {
      this.status = UserStatus.ACTIVE;
    }
  }

  // JSON serialization
  toJSON(): Record<string, any> {
    const {
      password,
      twoFactorSecret,
      backupCodes,
      passwordResetToken,
      passwordResetExpiresAt,
      emailVerificationToken,
      failedLoginAttempts,
      lockedUntil,
      ...rest
    } = super.toJSON();

    return {
      ...rest,
      fullName: this.fullName,
      isEmailVerified: this.isEmailVerified,
      isLocked: this.isLocked,
      isAdmin: this.isAdmin,
      canLogin: this.canLogin,
    };
  }
}
