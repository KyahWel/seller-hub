import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CrudHttpController, sendRpc } from '@org/api-core';
import {
  ListQuery,
  Order,
  ORDERS_SERVICE,
  OrdersPatterns,
  Paginated,
  User,
  USERS_SERVICE,
  UsersPatterns,
} from '@org/contracts';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('users')
export class UsersController extends CrudHttpController<
  User,
  CreateUserDto,
  UpdateUserDto
>({
  patterns: UsersPatterns,
  createDto: CreateUserDto,
  updateDto: UpdateUserDto,
}) {
  constructor(
    @Inject(USERS_SERVICE) usersClient: ClientProxy,
    @Inject(ORDERS_SERVICE) private readonly ordersClient: ClientProxy,
  ) {
    super(usersClient);
  }

  /** A seller's orders. */
  @Get(':id/orders')
  findOrders(
    @Param('id', ParseUUIDPipe) sellerId: string,
  ): Promise<Paginated<Order>> {
    return sendRpc<Paginated<Order>, ListQuery<Order>>(
      this.ordersClient,
      OrdersPatterns.FindAll,
      { where: { sellerId } },
    );
  }
}
