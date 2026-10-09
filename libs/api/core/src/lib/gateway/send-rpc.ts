import {
  GatewayTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import {
  catchError,
  firstValueFrom,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';

export const DEFAULT_RPC_TIMEOUT_MS = 5_000;

/**
 * Sends a message to a microservice and resolves with its reply. Fails with
 * 504 when the service does not answer in time (so a stuck service cannot
 * pile up open requests) and 503 when it cannot be reached. Errors thrown by
 * the service (`rpcError`) pass through unchanged.
 */
export function sendRpc<R, P = unknown>(
  client: ClientProxy,
  pattern: string,
  payload: P,
  timeoutMs = DEFAULT_RPC_TIMEOUT_MS,
): Promise<R> {
  return firstValueFrom(
    client.send<R, P>(pattern, payload).pipe(
      timeout(timeoutMs),
      catchError((error: unknown) =>
        throwError(() => toGatewayError(error, pattern)),
      ),
    ),
  );
}

function toGatewayError(error: unknown, pattern: string): unknown {
  if (error instanceof TimeoutError) {
    return new GatewayTimeoutException(`No reply for ${pattern}`);
  }
  const code = (error as { code?: unknown } | null)?.code;
  if (code === 'ECONNREFUSED' || code === 'ECONNRESET') {
    return new ServiceUnavailableException('Service unavailable');
  }
  return error;
}
