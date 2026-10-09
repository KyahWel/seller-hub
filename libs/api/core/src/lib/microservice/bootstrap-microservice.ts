import { Logger, type Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  DEFAULT_SERVICE_PORTS,
  resolveServiceAddress,
  type ServiceName,
} from '@org/contracts';

/**
 * Starts a TCP microservice for `service`, reading its host/port from
 * `<SERVICE>_HOST` / `<SERVICE>_PORT` and loading `.env` when present.
 *
 * Binds to localhost unless `<SERVICE>_HOST` says otherwise: the TCP
 * transport has no authentication, so services must only be reachable from
 * the gateway (e.g. a private Docker network with `<SERVICE>_HOST=0.0.0.0`
 * and no published ports).
 */
export async function bootstrapMicroservice(
  appModule: Type,
  service: ServiceName,
) {
  try {
    process.loadEnvFile();
  } catch {
    // no .env file
  }

  const { host, port } = resolveServiceAddress(service, {
    host: '127.0.0.1',
    port: DEFAULT_SERVICE_PORTS[service],
  });

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    appModule,
    { transport: Transport.TCP, options: { host, port } },
  );
  app.enableShutdownHooks();
  await app.listen();
  Logger.log(`${service} is listening on tcp://${host}:${port}`);
  return app;
}
