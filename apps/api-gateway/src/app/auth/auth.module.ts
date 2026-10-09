import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import { AuthController } from './auth.controller';
import { SESSION_TTL_SECONDS } from './session';

/**
 * The signing secret must be set in production. In development a random one
 * is generated at startup, which signs everyone out on restart.
 */
function jwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET');
  if (secret) {
    if (secret.length < 32)
      throw new Error('JWT_SECRET must be at least 32 characters');
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }
  Logger.warn(
    'JWT_SECRET is not set; using a random secret for this run',
    'Auth',
  );
  return randomBytes(48).toString('base64');
}

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: jwtSecret(config),
        signOptions: { expiresIn: SESSION_TTL_SECONDS, algorithm: 'HS256' },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  controllers: [AuthController],
  // AppModule registers AuthGuard globally, which needs JwtService.
  exports: [JwtModule],
})
export class AuthModule {}
