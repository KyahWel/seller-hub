/**
 * Injection tokens for the microservice clients registered in the API gateway.
 * Each token is also the env prefix for the service address
 * (`USERS_SERVICE_HOST` / `USERS_SERVICE_PORT`).
 */
export const USERS_SERVICE = 'USERS_SERVICE';
export const ORDERS_SERVICE = 'ORDERS_SERVICE';
export const PRODUCTS_SERVICE = 'PRODUCTS_SERVICE';
export const BUYERS_SERVICE = 'BUYERS_SERVICE';

/** Default TCP ports, used when the env does not override them. */
export const DEFAULT_SERVICE_PORTS = {
  [USERS_SERVICE]: 3001,
  [ORDERS_SERVICE]: 3002,
  [PRODUCTS_SERVICE]: 3003,
  [BUYERS_SERVICE]: 3004,
} as const;

export type ServiceName = keyof typeof DEFAULT_SERVICE_PORTS;

export interface ServiceAddress {
  host: string;
  port: number;
}

/**
 * Resolves a microservice address from environment variables, falling back
 * to the given defaults. `prefix` is e.g. `USERS_SERVICE` → reads
 * `USERS_SERVICE_HOST` / `USERS_SERVICE_PORT`.
 */
export function resolveServiceAddress(
  prefix: string,
  defaults: ServiceAddress,
  env: Record<string, string | undefined> = process.env,
): ServiceAddress {
  const port = Number(env[`${prefix}_PORT`]);
  return {
    host: env[`${prefix}_HOST`] || defaults.host,
    port: Number.isInteger(port) && port > 0 ? port : defaults.port,
  };
}
