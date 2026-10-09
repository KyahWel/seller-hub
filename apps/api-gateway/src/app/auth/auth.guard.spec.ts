import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { Public } from './public.decorator';

class Routes {
  @Public()
  open() {
    return 'open';
  }

  closed() {
    return 'closed';
  }
}

describe('AuthGuard', () => {
  const jwt = new JwtService({ secret: 'x'.repeat(32) });
  const guard = new AuthGuard(jwt, new Reflector());

  const contextFor = (
    handler: () => unknown,
    headers: Record<string, string> = {},
  ) => {
    const request: Record<string, unknown> = { headers };
    const context = {
      getHandler: () => handler,
      getClass: () => Routes,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { context, request };
  };

  it('lets public routes through without a session', async () => {
    const { context } = contextFor(Routes.prototype.open);

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('rejects other routes without a session', async () => {
    const { context } = contextFor(Routes.prototype.closed);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('accepts a valid session cookie and attaches the seller', async () => {
    const token = await jwt.signAsync({ sub: 'seller-1' });
    const { context, request } = contextFor(Routes.prototype.closed, {
      cookie: `session=${token}`,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.auth).toEqual({ sellerId: 'seller-1' });
  });

  it('accepts a bearer token', async () => {
    const token = await jwt.signAsync({ sub: 'seller-1' });
    const { context } = contextFor(Routes.prototype.closed, {
      authorization: `Bearer ${token}`,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('rejects a token signed with another secret', async () => {
    const forged = await new JwtService({ secret: 'y'.repeat(32) }).signAsync({
      sub: 'seller-1',
    });
    const { context } = contextFor(Routes.prototype.closed, {
      cookie: `session=${forged}`,
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
