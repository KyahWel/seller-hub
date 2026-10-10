import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { RpcToHttpExceptionFilter } from '@org/api-core';
import helmet from 'helmet';
import { rejectCrossOriginWrites } from './auth/same-origin.middleware';

export const GLOBAL_PREFIX = 'api';

/**
 * HTTP setup shared by `main.ts` and the gateway's tests: security headers,
 * body limit, CSRF check, `/api` prefix, CORS, validation and error mapping.
 * The app must be created with `bodyParser: false`.
 */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get(ConfigService);

  // Which proxies may set X-Forwarded-For. The client IP drives rate
  // limiting, so only trust hops you control (the Nuxt server, a load balancer).
  app.set('trust proxy', config.get<string>('TRUST_PROXY', 'loopback'));
  app.use(helmet());
  app.useBodyParser('json', { limit: config.get('BODY_LIMIT', '100kb') });

  // Origins of the web app (comma-separated). Used for CORS and CSRF checks.
  const webOrigins = config
    .get<string>('CORS_ORIGIN', 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim());
  app.use(rejectCrossOriginWrites(webOrigins));

  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.enableCors({ origin: webOrigins });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(
    new RpcToHttpExceptionFilter(app.get(HttpAdapterHost).httpAdapter),
  );
}
