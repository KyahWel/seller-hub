import { type ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { RpcToHttpExceptionFilter } from './rpc-to-http-exception.filter.js';

describe('RpcToHttpExceptionFilter', () => {
  const host = {} as ArgumentsHost;
  let parentCatch: jest.SpyInstance;

  beforeEach(() => {
    parentCatch = jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation(() => undefined);
  });

  afterEach(() => parentCatch.mockRestore());

  it('maps an RPC error body to an HttpException with its status', () => {
    new RpcToHttpExceptionFilter().catch(
      { statusCode: 404, message: 'User x not found' },
      host,
    );

    const [mapped] = parentCatch.mock.calls[0];
    expect(mapped).toBeInstanceOf(HttpException);
    expect((mapped as HttpException).getStatus()).toBe(404);
  });

  it('passes other errors through unchanged', () => {
    const error = new Error('boom');

    new RpcToHttpExceptionFilter().catch(error, host);

    expect(parentCatch).toHaveBeenCalledWith(error, host);
  });
});
