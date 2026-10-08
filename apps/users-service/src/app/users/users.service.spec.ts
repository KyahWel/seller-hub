import { RpcException } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, UsersRepository],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('creates and finds a user', async () => {
    const user = await service.create({
      name: 'Ada',
      email: 'ada@example.com',
    });

    expect(user).toMatchObject({ name: 'Ada', email: 'ada@example.com' });
    await expect(service.findOne(user.id)).resolves.toEqual(user);
  });

  it('rejects a duplicate email with 409', async () => {
    await service.create({ name: 'Ada', email: 'ada@example.com' });

    const error = await service
      .create({ name: 'Other', email: 'ada@example.com' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RpcException);
    expect((error as RpcException).getError()).toMatchObject({
      statusCode: 409,
    });
  });
});
