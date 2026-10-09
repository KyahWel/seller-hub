import { RpcException } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { CredentialsRepository } from './credentials.repository';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const ada = {
    name: 'Ada',
    email: 'Ada@Example.com',
    password: 'secret-pass',
  };
  let service: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, UsersRepository, CredentialsRepository],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('registers a user without exposing the password', async () => {
    const user = await service.register(ada);

    expect(user).toMatchObject({ name: 'Ada', email: 'ada@example.com' });
    expect(JSON.stringify(user)).not.toContain('secret');
    await expect(service.findOne(user.id)).resolves.toEqual(user);
  });

  it('verifies credentials, ignoring email case', async () => {
    const user = await service.register(ada);

    await expect(
      service.verifyCredentials({
        email: 'ADA@example.com',
        password: 'secret-pass',
      }),
    ).resolves.toEqual(user);
    await expect(
      service.verifyCredentials({
        email: 'ada@example.com',
        password: 'wrong-pass',
      }),
    ).resolves.toBeNull();
    await expect(
      service.verifyCredentials({
        email: 'nobody@example.com',
        password: 'secret-pass',
      }),
    ).resolves.toBeNull();
  });

  it('rejects a duplicate email with 409, ignoring case', async () => {
    await service.register(ada);

    const error = await service
      .register({ ...ada, email: 'ada@EXAMPLE.com' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RpcException);
    expect((error as RpcException).getError()).toMatchObject({
      statusCode: 409,
    });
  });

  it('removes the credentials with the user', async () => {
    const user = await service.register(ada);

    await service.remove(user.id);

    await expect(
      service.verifyCredentials({ email: ada.email, password: ada.password }),
    ).resolves.toBeNull();
  });
});
