import {
  type ClientsProviderAsyncOptions,
  Transport,
} from '@nestjs/microservices';
import {
  DEFAULT_SERVICE_PORTS,
  resolveServiceAddress,
  type ServiceName,
} from '@org/contracts';

/**
 * TCP client registration for `ClientsModule.registerAsync`, injectable with
 * `@Inject(<SERVICE>) client: ClientProxy`.
 */
export function serviceClient(
  service: ServiceName,
): ClientsProviderAsyncOptions {
  return {
    name: service,
    useFactory: () => ({
      transport: Transport.TCP,
      options: resolveServiceAddress(service, {
        host: 'localhost',
        port: DEFAULT_SERVICE_PORTS[service],
      }),
    }),
  };
}
