import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, UsersRepository],
    }).compile();

    controller = moduleRef.get(UsersController);
  });

  it('handles the CRUD patterns through the service', async () => {
    const created = await controller.create({
      name: 'Ada',
      email: 'ada@example.com',
    });

    await expect(controller.findOne({ id: created.id })).resolves.toEqual(
      created,
    );
    await expect(controller.findAll()).resolves.toMatchObject({
      items: [created],
      total: 1,
    });
    await expect(
      controller.update({ id: created.id, changes: { name: 'Ada L.' } }),
    ).resolves.toMatchObject({ name: 'Ada L.' });
  });
});
