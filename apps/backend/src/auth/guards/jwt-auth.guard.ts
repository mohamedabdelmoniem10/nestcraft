import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No valid token provided');
    }

    // For now, we'll accept any Bearer token
    // In production, validate the JWT token here
    const token = authHeader.substring(7);
    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    // Mock user data
    request.user = {
      id: '1',
      email: 'admin@nestcraft.com',
      role: 'admin',
    };

    return true;
  }
}
