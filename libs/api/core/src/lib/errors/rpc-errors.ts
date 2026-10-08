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

export function isRpcErrorBody(value: unknown): value is RpcErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as RpcErrorBody).statusCode === 'number' &&
    typeof (value as RpcErrorBody).message === 'string'
  );
}
