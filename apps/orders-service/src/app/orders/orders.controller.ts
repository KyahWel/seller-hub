import { Controller } from '@nestjs/common';
import { CrudMessageController } from '@org/api-core';
import type {
  CreateOrderPayload,
  Order,
  UpdateOrderPayload,
} from '@org/contracts';
import { OrdersPatterns } from '@org/contracts';
import { OrdersService } from './orders.service';

/** Answers `OrdersPatterns` (findAll, findOne, create, update, remove). */
@Controller()
export class OrdersController extends CrudMessageController<
  Order,
  CreateOrderPayload,
  UpdateOrderPayload
>(OrdersPatterns) {
  constructor(service: OrdersService) {
    super(service);
  }
}
