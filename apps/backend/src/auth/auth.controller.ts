import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Request() req) {
    // Mock response for now
    return {
      success: true,
      access_token: 'mock-jwt-token-12345',
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@nestcraft.com',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User',
      },
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() userData: any) {
    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: Math.random().toString(),
        ...userData,
        role: 'user',
      },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req) {
    return {
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@nestcraft.com',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User',
        permissions: ['all'],
      },
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() refreshData: any) {
    return {
      success: true,
      access_token: 'new-mock-jwt-token-67890',
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  async logout() {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() emailData: any) {
    return {
      success: true,
      message: 'Password reset email sent',
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() resetData: any) {
    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}
