import { Test } from '@nestjs/testing';
import { CredentialsRepository } from './credentials.repository';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, UsersRepository, CredentialsRepository],
    }).compile();

    controller = moduleRef.get(UsersController);
  });

  it('registers, verifies and updates through the service', async () => {
    const created = await controller.register({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret-pass',
    });

    await expect(
      controller.verifyCredentials({
        email: 'ada@example.com',
        password: 'secret-pass',
      }),
    ).resolves.toEqual(created);
    await expect(
      controller.update({
        id: created.id,
        changes: { name: 'Ada L.' },
        scope: { id: created.id },
      }),
    ).resolves.toMatchObject({ name: 'Ada L.' });
  });
});
