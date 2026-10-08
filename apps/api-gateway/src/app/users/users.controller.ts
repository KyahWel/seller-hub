import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CrudHttpController } from '@org/api-core';
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
import { firstValueFrom } from 'rxjs';
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
    return firstValueFrom(
      this.ordersClient.send<Paginated<Order>, ListQuery<Order>>(
        OrdersPatterns.FindAll,
        { where: { sellerId } },
      ),
    );
  }
}
