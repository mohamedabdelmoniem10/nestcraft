import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from './redis.service';
import { randomUUID } from 'crypto';

export interface SessionData {
  userId?: string;
  email?: string;
  role?: string;
  lastActivity: number;
  createdAt: number;
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      session?: SessionData;
      sessionId?: string;
    }
  }
}

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SessionMiddleware.name);
  private readonly sessionTtl = 3600; // 1 hour
  private readonly cookieName = 'nestcraft-session';

  constructor(private readonly redisService: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Get session ID from cookie or create new one
      const sessionId = this.getSessionId(req) || this.createSessionId();
      req.sessionId = sessionId;

      // Load session data from Redis
      const sessionData = await this.loadSession(sessionId);
      req.session = sessionData;

      // Set session cookie
      this.setSessionCookie(res, sessionId);

      // Save session on response finish
      const originalSend = res.send;
      const self = this; // Capture the context

      res.send = function (body) {
        // Save session data before sending response
        if (req.session) {
          req.session.lastActivity = Date.now();
          self.saveSession(sessionId, req.session).catch((error) => {
            self.logger.error('Failed to save session:', error);
          });
        }
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      this.logger.error('Session middleware error:', error);
      next();
    }
  }

  private getSessionId(req: Request): string | null {
    // Try to get from cookie first
    const fromCookie = req.cookies?.[this.cookieName];
    if (fromCookie) {
      return fromCookie;
    }

    // Try to get from Authorization header (for API clients)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Session ')) {
      return authHeader.substring(8);
    }

    return null;
  }

  private createSessionId(): string {
    return randomUUID();
  }

  private async loadSession(sessionId: string): Promise<SessionData> {
    try {
      const sessionData = await this.redisService.getSession<SessionData>(sessionId);

      if (sessionData) {
        // Check if session is still valid
        const now = Date.now();
        const lastActivity = sessionData.lastActivity || sessionData.createdAt;
        const sessionAge = now - lastActivity;

        if (sessionAge > this.sessionTtl * 1000) {
          // Session expired, delete it
          await this.redisService.deleteSession(sessionId);
          return this.createNewSession();
        }

        return sessionData;
      }

      return this.createNewSession();
    } catch (error) {
      this.logger.error(`Failed to load session ${sessionId}:`, error);
      return this.createNewSession();
    }
  }

  private async saveSession(sessionId: string, sessionData: SessionData): Promise<void> {
    try {
      await this.redisService.setSession(sessionId, sessionData, this.sessionTtl);
    } catch (error) {
      this.logger.error(`Failed to save session ${sessionId}:`, error);
    }
  }

  private createNewSession(): SessionData {
    const now = Date.now();
    return {
      lastActivity: now,
      createdAt: now,
    };
  }

  private setSessionCookie(res: Response, sessionId: string): void {
    res.cookie(this.cookieName, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.sessionTtl * 1000,
    });
  }

  // Static methods for session management
  static async createSession(
    redisService: RedisService,
    userId: string,
    userData: any,
  ): Promise<string> {
    const sessionId = randomUUID();
    const now = Date.now();

    const sessionData: SessionData = {
      userId,
      ...userData,
      lastActivity: now,
      createdAt: now,
    };

    await redisService.setSession(sessionId, sessionData, 3600);
    return sessionId;
  }

  static async destroySession(redisService: RedisService, sessionId: string): Promise<void> {
    await redisService.deleteSession(sessionId);
  }

  static async extendSession(redisService: RedisService, sessionId: string): Promise<boolean> {
    // Note: Need to fix the return type issue in RedisService first
    try {
      const sessionData = await redisService.getSession(sessionId);
      if (sessionData) {
        await redisService.setSession(sessionId, sessionData, 3600);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
