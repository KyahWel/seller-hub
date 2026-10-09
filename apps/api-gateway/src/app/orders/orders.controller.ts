import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CrudHttpController } from '@org/api-core';
import { Order, ORDERS_SERVICE, OrdersPatterns } from '@org/contracts';
import { signedInSeller } from '../auth/session';
import { CreateOrderDto, UpdateOrderDto } from './order.dto';

@Controller('orders')
export class OrdersController extends CrudHttpController<
  Order,
  CreateOrderDto,
  UpdateOrderDto
>({
  patterns: OrdersPatterns,
  createDto: CreateOrderDto,
  updateDto: UpdateOrderDto,
  filterBy: ['buyerId', 'status', 'channel'],
  scope: (request) => ({ sellerId: signedInSeller(request) }),
}) {
  constructor(@Inject(ORDERS_SERVICE) client: ClientProxy) {
    super(client);
  }
}
