import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

import { User, UserRole } from '../modules/auth/domain/entities/user.entity';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const saltRounds = this.configService.get<number>('auth.bcrypt.saltRounds');
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || UserRole.USER,
    });

    return this.usersRepository.save(user);
  }

  async findAll(query: UserListQuery = {}): Promise<PaginatedUsers> {
    const { page = 1, limit = 10, search, role, isActive } = query;

    const options: FindManyOptions<User> = {
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'isActive',
        'emailVerified',
        'createdAt',
        'updatedAt',
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    };

    if (search || role !== undefined || isActive !== undefined) {
      options.where = {};

      if (search) {
        options.where = [
          { firstName: Like(`%${search}%`) },
          { lastName: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
        ];
      }

      if (role !== undefined) {
        options.where = { ...options.where, role };
      }

      if (isActive !== undefined) {
        options.where = { ...options.where, isActive };
      }
    }

    const [users, total] = await this.usersRepository.findAndCount(options);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'isActive',
        'emailVerified',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softDelete(id);
  }

  async restore(id: string): Promise<User> {
    await this.usersRepository.restore(id);
    return this.findOne(id);
  }

  async updateProfile(
    id: string,
    updateData: { firstName?: string; lastName?: string },
  ): Promise<User> {
    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async deactivateAccount(id: string): Promise<void> {
    await this.usersRepository.update(id, { isActive: false });
  }

  async activateAccount(id: string): Promise<void> {
    await this.usersRepository.update(id, { isActive: true });
  }

  async verifyEmail(id: string): Promise<void> {
    await this.usersRepository.update(id, { emailVerified: true });
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
  }> {
    const total = await this.usersRepository.count();
    const active = await this.usersRepository.count({ where: { isActive: true } });
    const inactive = await this.usersRepository.count({ where: { isActive: false } });
    const verified = await this.usersRepository.count({ where: { emailVerified: true } });
    const unverified = await this.usersRepository.count({ where: { emailVerified: false } });

    return {
      total,
      active,
      inactive,
      verified,
      unverified,
    };
  }
}
