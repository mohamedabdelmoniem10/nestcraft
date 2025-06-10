import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, UserRole } from '../../domain/entities/user.entity';
import {
  UserRepositoryInterface,
  UserFilters,
} from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectRepository(User)
    private readonly ormRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.ormRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.ormRepository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.ormRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'role',
        'isActive',
        'emailVerified',
        'firstName',
        'lastName',
        'createdAt',
        'updatedAt',
        'loginAttempts',
        'lockUntil',
      ],
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.ormRepository.findOne({
      where: {
        resetPasswordToken: token,
        isActive: true,
      },
    });
  }

  async save(user: User): Promise<User> {
    return this.ormRepository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    await this.ormRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.softDelete(id);
  }

  async findMany(filters: UserFilters): Promise<User[]> {
    const queryBuilder = this.ormRepository.createQueryBuilder('user');

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.emailVerified !== undefined) {
      queryBuilder.andWhere('user.emailVerified = :emailVerified', {
        emailVerified: filters.emailVerified,
      });
    }

    if (filters.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder.orderBy('user.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async count(filters: UserFilters): Promise<number> {
    const queryBuilder = this.ormRepository.createQueryBuilder('user');

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.emailVerified !== undefined) {
      queryBuilder.andWhere('user.emailVerified = :emailVerified', {
        emailVerified: filters.emailVerified,
      });
    }

    if (filters.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return queryBuilder.getCount();
  }

  async findActiveUsers(): Promise<User[]> {
    return this.ormRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAdminUsers(): Promise<User[]> {
    return this.ormRepository.find({
      where: [{ role: UserRole.ADMIN }, { role: UserRole.SUPER_ADMIN }],
      order: { createdAt: 'DESC' },
    });
  }
}
