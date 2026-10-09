import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { Throttle } from '@nestjs/throttler';
import { sendRpc } from '@org/api-core';
import {
  CredentialsPayload,
  RegisterPayload,
  User,
  USERS_SERVICE,
  UsersPatterns,
} from '@org/contracts';
import type { Response } from 'express';
import { LoginDto, RegisterDto } from './auth.dto';
import { Public } from './public.decorator';
import {
  SESSION_COOKIE,
  type SessionClaims,
  sessionCookieOptions,
} from './session';

/** Login and sign-up attempts per client IP per minute (slows password guessing). */
const AUTH_ATTEMPTS = { default: { limit: 10, ttl: 60_000 } };

@Public()
@Controller('auth')
export class AuthController {
  private readonly secureCookie: boolean;

  constructor(
    @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy,
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.secureCookie =
      config.get(
        'COOKIE_SECURE',
        String(process.env.NODE_ENV === 'production'),
      ) === 'true';
  }

  @Throttle(AUTH_ATTEMPTS)
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<User> {
    const user = await sendRpc<User, RegisterPayload>(
      this.usersClient,
      UsersPatterns.Register,
      dto,
    );
    await this.startSession(response, user);
    return user;
  }

  @Throttle(AUTH_ATTEMPTS)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<User> {
    const user = await sendRpc<User | null, CredentialsPayload>(
      this.usersClient,
      UsersPatterns.VerifyCredentials,
      dto,
    );
    // Same message for unknown email and wrong password.
    if (!user) throw new UnauthorizedException('Invalid email or password');
    await this.startSession(response, user);
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response): void {
    // Must match the attributes the cookie was set with, minus the lifetime.
    const { httpOnly, secure, sameSite, path } = sessionCookieOptions(
      this.secureCookie,
    );
    response.clearCookie(SESSION_COOKIE, { httpOnly, secure, sameSite, path });
  }

  private async startSession(response: Response, user: User) {
    const token = await this.jwt.signAsync({
      sub: user.id,
    } satisfies SessionClaims);
    response.cookie(
      SESSION_COOKIE,
      token,
      sessionCookieOptions(this.secureCookie),
    );
  }
}
