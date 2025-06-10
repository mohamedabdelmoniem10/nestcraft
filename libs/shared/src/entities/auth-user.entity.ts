import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Index,
} from "typeorm";

@Entity("users")
@Index(["email"], { unique: true })
@Index(["role"])
@Index(["isActive"])
@Index(["emailVerified"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255, select: false })
  password!: string;

  @Column({ type: "varchar", length: 100 })
  firstName!: string;

  @Column({ type: "varchar", length: 100 })
  lastName!: string;

  @Column({ type: "varchar", length: 50, default: "user" })
  role!: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "boolean", default: false })
  emailVerified!: boolean;

  @Column({ type: "varchar", length: 500, nullable: true, select: false })
  refreshToken?: string;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt?: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  resetPasswordToken?: string;

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExpires?: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  emailVerificationToken?: string;

  @Column({ type: "int", default: 0 })
  loginAttempts!: number;

  @Column({ type: "timestamp", nullable: true })
  lockUntil?: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get isLocked(): boolean {
    return !!(this.lockUntil && this.lockUntil > new Date());
  }
}
