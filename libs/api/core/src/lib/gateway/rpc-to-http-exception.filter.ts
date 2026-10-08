import { type ArgumentsHost, Catch, HttpException } from '@nestjs/common';
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
      return super.catch(
        new HttpException(exception, exception.statusCode),
        host,
      );
    }
    return super.catch(exception, host);
  }
}
