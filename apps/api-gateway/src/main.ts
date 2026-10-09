import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { RpcToHttpExceptionFilter } from '@org/api-core';
import helmet from 'helmet';
import { AppModule } from './app/app.module';
import { rejectCrossOriginWrites } from './app/auth/same-origin.middleware';

// Load `.env` from the working directory when present (no-op otherwise).
try {
  process.loadEnvFile();
} catch {
  // no .env file
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
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

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
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
  app.enableShutdownHooks();

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  Logger.log(
    `🚀 API gateway is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
