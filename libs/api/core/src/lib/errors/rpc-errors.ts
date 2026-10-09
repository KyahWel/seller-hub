import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import type { RpcErrorBody } from '@org/contracts';

/**
 * Errors thrown inside a microservice reach the gateway as plain objects.
 * Throw these so the gateway can turn them back into the right HTTP status
 * (see `RpcToHttpExceptionFilter`).
 */
export function rpcError(statusCode: number, message: string): RpcException {
  return new RpcException({ statusCode, message } satisfies RpcErrorBody);
}

export const notFound = (entity: string, id: string) =>
  rpcError(HttpStatus.NOT_FOUND, `${entity} ${id} not found`);

export const badRequest = (message: string) =>
  rpcError(HttpStatus.BAD_REQUEST, message);

export const conflict = (message: string) =>
  rpcError(HttpStatus.CONFLICT, message);

/**
 * True for `{ statusCode, message }` with a 4xx/5xx status. Anything else
 * coming back from a service is treated as an unknown error (500), so a
 * malformed reply cannot pick an arbitrary status such as a redirect.
 */
export function isRpcErrorBody(value: unknown): value is RpcErrorBody {
  if (typeof value !== 'object' || value === null) return false;
  const { statusCode, message } = value as Partial<RpcErrorBody>;
  return (
    Number.isInteger(statusCode) &&
    (statusCode as number) >= 400 &&
    (statusCode as number) <= 599 &&
    typeof message === 'string'
  );
}
