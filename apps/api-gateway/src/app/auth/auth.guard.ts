import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC } from './public.decorator';
import {
  type AuthenticatedRequest,
  readCookie,
  SESSION_COOKIE,
  type SessionClaims,
} from './session';

/**
 * Requires a valid session on every route not marked `@Public()`. The token
 * comes from the `session` cookie (browsers) or `Authorization: Bearer`
 * (other clients).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & AuthenticatedRequest>();
    const token =
      bearerToken(request) ??
      readCookie(request.headers.cookie, SESSION_COOKIE);
    if (!token) throw new UnauthorizedException('Sign in required');

    try {
      const { sub } = await this.jwt.verifyAsync<SessionClaims>(token);
      request.auth = { sellerId: sub };
      return true;
    } catch {
      throw new UnauthorizedException('Session expired, sign in again');
    }
  }
}

function bearerToken(request: Request): string | undefined {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' && token ? token : undefined;
}
