import {
  type ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { isRpcErrorBody } from '../errors/rpc-errors.js';

/**
 * Turns errors returned by microservices (`{ statusCode, message }`, see
 * `rpcError`) into HTTP responses with that status. Anything else falls
 * through to Nest's default handling (500 for unknown errors).
 *
 * Register globally: `app.useGlobalFilters(new RpcToHttpExceptionFilter(httpAdapter))`.
 */
@Catch()
export class RpcToHttpExceptionFilter extends BaseExceptionFilter {
  override catch(exception: unknown, host: ArgumentsHost) {
    if (isRpcErrorBody(exception)) {
      // Server-side failures keep a generic message so internals don't leak.
      const body =
        exception.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR
          ? {
              statusCode: exception.statusCode,
              message: 'Internal server error',
            }
          : { statusCode: exception.statusCode, message: exception.message };
      return super.catch(new HttpException(body, exception.statusCode), host);
    }
    return super.catch(exception, host);
  }
}
