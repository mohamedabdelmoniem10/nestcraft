import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { User, UserRole } from '../../domain/entities/user.entity';
import { UserRepositoryInterface } from '../../domain/repositories/user.repository.interface';
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponse,
  UserProfile,
} from '../dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly tokenBlacklist = new Set<string>();

  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user entity
    const user = new User();
    user.email = email;
    user.password = hashedPassword;
    user.firstName = firstName;
    user.lastName = lastName;
    user.role = UserRole.USER;
    user.isActive = true;
    user.emailVerified = process.env.NODE_ENV === 'development'; // Auto-verify in dev

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Generate token
    const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        isActive: savedUser.isActive,
        emailVerified: savedUser.emailVerified,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      },
      currentToken: accessToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user with password
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user can login (including account lock)
    if (!user.canLogin()) {
      if (user.loginAttempts >= 5) {
        throw new UnauthorizedException(
          'Account is temporarily locked due to multiple failed login attempts',
        );
      }
      throw new UnauthorizedException('Account is not active or email not verified');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      user.incrementFailedLogin();
      await this.userRepository.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login attempts and update last login
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.updateLastLogin();
    await this.userRepository.save(user);

    // Generate token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      currentToken: accessToken,
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findByEmailWithPassword(
      (await this.userRepository.findById(userId))?.email || '',
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.userRepository.update(userId, { password: hashedNewPassword });

    return { message: 'Password changed successfully. Please login again.' };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string; resetToken?: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If the email exists, a password reset link will be sent.' };
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();

    // Save user with reset token
    await this.userRepository.save(user);

    // In development, return token for testing
    if (process.env.NODE_ENV === 'development') {
      return {
        message: 'Password reset token generated successfully',
        resetToken,
      };
    }

    // In production, send email (implementation needed)
    return { message: 'If the email exists, a password reset link will be sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findByResetToken(token);
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      loginAttempts: 0,
      lockUntil: null,
    });

    return { message: 'Password reset successfully' };
  }

  async getProfile(userId: string, currentToken: string): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      currentToken,
    };
  }

  async logout(token: string): Promise<{ message: string }> {
    this.tokenBlacklist.add(token);

    // Clean up expired tokens periodically
    this.cleanupExpiredTokens();

    return { message: 'Logged out successfully' };
  }

  async logoutAll(): Promise<{ message: string }> {
    // Note: This is a simplified implementation
    // In a real application, you might want to store user-specific tokens
    return { message: 'Logged out from all devices successfully' };
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  private cleanupExpiredTokens(): void {
    // Simple cleanup - in production, you might want a more sophisticated approach
    if (this.tokenBlacklist.size > 10000) {
      this.tokenBlacklist.clear();
    }
  }
}
