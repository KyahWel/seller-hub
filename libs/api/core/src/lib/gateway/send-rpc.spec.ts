import {
  GatewayTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { NEVER, of, throwError } from 'rxjs';
import { sendRpc } from './send-rpc.js';

const clientReturning = (reply: ReturnType<ClientProxy['send']>) =>
  ({ send: jest.fn().mockReturnValue(reply) }) as unknown as ClientProxy;

describe('sendRpc', () => {
  it('resolves with the reply', async () => {
    const client = clientReturning(of({ id: '1' }));

    await expect(sendRpc(client, 'x.findOne', { id: '1' })).resolves.toEqual({
      id: '1',
    });
  });

  it('fails with 504 when the service does not answer in time', async () => {
    const client = clientReturning(NEVER);

    await expect(sendRpc(client, 'x.findOne', {}, 10)).rejects.toBeInstanceOf(
      GatewayTimeoutException,
    );
  });

  it('fails with 503 when the service is unreachable', async () => {
    const client = clientReturning(
      throwError(() =>
        Object.assign(new Error('refused'), { code: 'ECONNREFUSED' }),
      ),
    );

    await expect(sendRpc(client, 'x.findOne', {})).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('passes service errors through', async () => {
    const body = { statusCode: 404, message: 'X 1 not found' };
    const client = clientReturning(throwError(() => body));

    await expect(sendRpc(client, 'x.findOne', {})).rejects.toBe(body);
  });
});
