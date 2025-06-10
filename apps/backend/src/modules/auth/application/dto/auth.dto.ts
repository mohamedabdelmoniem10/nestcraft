import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@nestcraft.dev',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'AdminPassword123!',
    description: 'User password',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}

export class RegisterDto {
  @ApiProperty({
    example: 'user@nestcraft.dev',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'UserPassword123!',
    description: 'User password',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsNotEmpty()
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsNotEmpty()
  @MaxLength(50)
  lastName!: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token',
  })
  @IsNotEmpty()
  refreshToken!: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
  })
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({
    description: 'New password',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@nestcraft.dev',
    description: 'Email address for password reset',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token received via email',
  })
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    description: 'New password',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}

// Response DTOs
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  access_token: string;
  user: UserResponse;
  currentToken: string;
}

export interface UserProfile extends UserResponse {
  currentToken: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}
