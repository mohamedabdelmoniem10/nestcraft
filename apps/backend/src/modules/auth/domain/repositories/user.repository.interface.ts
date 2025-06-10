import { User } from '../entities/user.entity';

export interface UserRepositoryInterface {
  // Basic CRUD operations
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(id: string, data: Partial<User>): Promise<void>;
  delete(id: string): Promise<void>;

  // Auth-specific operations
  findByEmailWithPassword(email: string): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;

  // Query operations
  findMany(filters: UserFilters): Promise<User[]>;
  count(filters: UserFilters): Promise<number>;
  findActiveUsers(): Promise<User[]>;
  findAdminUsers(): Promise<User[]>;
}

export interface UserFilters {
  isActive?: boolean;
  emailVerified?: boolean;
  role?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
