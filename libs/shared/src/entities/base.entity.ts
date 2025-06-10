import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  Index,
  VersionColumn,
  BaseEntity as TypeOrmBaseEntity,
} from "typeorm";

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    comment: "Creation timestamp",
  })
  @Index("idx_created_at")
  createdAt!: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
    comment: "Last update timestamp",
  })
  @Index("idx_updated_at")
  updatedAt!: Date;

  @DeleteDateColumn({
    type: "timestamptz",
    nullable: true,
    comment: "Soft delete timestamp",
  })
  @Index("idx_deleted_at")
  deletedAt?: Date;

  @VersionColumn({
    type: "int",
    default: 1,
    comment: "Optimistic locking version",
  })
  version!: number;

  @Column({
    type: "varchar",
    length: 100,
    nullable: true,
    comment: "User who created this record",
  })
  createdBy?: string;

  @Column({
    type: "varchar",
    length: 100,
    nullable: true,
    comment: "User who last updated this record",
  })
  updatedBy?: string;

  @Column({
    type: "jsonb",
    nullable: true,
    comment: "Additional metadata for the record",
  })
  metadata?: Record<string, any>;

  @Column({
    type: "boolean",
    default: true,
    comment: "Is record active/enabled",
  })
  @Index("idx_is_active")
  isActive!: boolean;

  // Virtual fields (not stored in database)
  get isDeleted(): boolean {
    return !!this.deletedAt;
  }

  get isNew(): boolean {
    return !this.id;
  }

  get isModified(): boolean {
    return this.createdAt !== this.updatedAt;
  }

  // Helper methods
  softDelete(userId?: string): void {
    this.deletedAt = new Date();
    this.updatedBy = userId;
    this.isActive = false;
  }

  restore(userId?: string): void {
    this.deletedAt = undefined;
    this.updatedBy = userId;
    this.isActive = true;
  }

  markAsUpdated(userId?: string): void {
    this.updatedAt = new Date();
    this.updatedBy = userId;
  }

  // Audit trail methods
  getAuditInfo(): AuditInfo {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      version: this.version,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      isActive: this.isActive,
      isDeleted: this.isDeleted,
      isNew: this.isNew,
      isModified: this.isModified,
    };
  }

  // JSON serialization
  toJSON(): Record<string, any> {
    const { version, ...rest } = this;
    return {
      ...rest,
      isDeleted: this.isDeleted,
      isNew: this.isNew,
      isModified: this.isModified,
    };
  }
}

// Types
export interface AuditInfo {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  version: number;
  createdBy?: string;
  updatedBy?: string;
  isActive: boolean;
  isDeleted: boolean;
  isNew: boolean;
  isModified: boolean;
}

// Decorator for entity metadata
export function EntityMetadata(metadata: Record<string, any>) {
  return function (target: any) {
    target.prototype.entityMetadata = metadata;
  };
}

// Custom decorators
export function Searchable() {
  return function (target: any, propertyKey: string) {
    if (!target.searchableFields) {
      target.searchableFields = [];
    }
    target.searchableFields.push(propertyKey);
  };
}

export function Filterable() {
  return function (target: any, propertyKey: string) {
    if (!target.filterableFields) {
      target.filterableFields = [];
    }
    target.filterableFields.push(propertyKey);
  };
}

export function Sortable() {
  return function (target: any, propertyKey: string) {
    if (!target.sortableFields) {
      target.sortableFields = [];
    }
    target.sortableFields.push(propertyKey);
  };
}
