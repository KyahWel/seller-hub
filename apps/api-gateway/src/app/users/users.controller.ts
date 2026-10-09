import { Body, Controller, Get, Inject, Patch } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { sendRpc } from '@org/api-core';
import {
  IdPayload,
  UpdatePayload,
  UpdateUserPayload,
  User,
  USERS_SERVICE,
  UsersPatterns,
} from '@org/contracts';
import { CurrentSeller } from '../auth/current-seller.decorator';
import { UpdateUserDto } from './user.dto';

/**
 * The signed-in seller's own account. Accounts are created through
 * `POST /auth/register`; there is no way to list or read other sellers.
 */
@Controller('users')
export class UsersController {
  constructor(
    @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy,
  ) {}

  @Get('me')
  me(@CurrentSeller() sellerId: string): Promise<User> {
    return sendRpc<User, IdPayload<User>>(
      this.usersClient,
      UsersPatterns.FindOne,
      { id: sellerId },
    );
  }

  @Patch('me')
  updateMe(
    @CurrentSeller() sellerId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return sendRpc<User, UpdatePayload<UpdateUserPayload, User>>(
      this.usersClient,
      UsersPatterns.Update,
      { id: sellerId, changes: dto },
    );
  }
}
