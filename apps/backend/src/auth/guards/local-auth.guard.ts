import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { email, password } = request.body;

    // Simple validation - in production, validate against database
    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    // Mock validation - accept any email/password for now
    if (email && password) {
      request.user = {
        id: '1',
        email: email,
        role: 'admin',
      };
      return true;
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
