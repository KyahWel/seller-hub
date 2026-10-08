import { Global, Module } from '@nestjs/common';
import { ClientsModule as NestClientsModule } from '@nestjs/microservices';
import { serviceClient } from '@org/api-core';
import {
  BUYERS_SERVICE,
  ORDERS_SERVICE,
  PRODUCTS_SERVICE,
  USERS_SERVICE,
} from '@org/contracts';

/**
 * Registers a TCP client for every downstream microservice.
 * Inject them with `@Inject(USERS_SERVICE) client: ClientProxy`.
 */
@Global()
@Module({
  imports: [
    NestClientsModule.registerAsync([
      serviceClient(USERS_SERVICE),
      serviceClient(ORDERS_SERVICE),
      serviceClient(PRODUCTS_SERVICE),
      serviceClient(BUYERS_SERVICE),
    ]),
  ],
  exports: [NestClientsModule],
})
export class ClientsModule {}
