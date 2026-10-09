import { Test } from '@nestjs/testing';
import { User, USERS_SERVICE, UsersPatterns } from '@org/contracts';
import { of } from 'rxjs';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  const user: User = {
    id: '6f1c1b8e-1f0e-4c1a-9a43-2a4e4a1c0b11',
    name: 'Ada',
    email: 'ada@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const usersClient = { send: jest.fn() };
  let controller: UsersController;

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: USERS_SERVICE, useValue: usersClient }],
    }).compile();

    controller = moduleRef.get(UsersController);
  });

  it('reads the signed-in seller', async () => {
    usersClient.send.mockReturnValue(of(user));

    await expect(controller.me(user.id)).resolves.toEqual(user);
    expect(usersClient.send).toHaveBeenCalledWith(UsersPatterns.FindOne, {
      id: user.id,
    });
  });

  it('only updates the signed-in seller', async () => {
    usersClient.send.mockReturnValue(of(user));

    await controller.updateMe(user.id, { name: 'Ada' });

    expect(usersClient.send).toHaveBeenCalledWith(UsersPatterns.Update, {
      id: user.id,
      changes: { name: 'Ada' },
    });
  });
});
