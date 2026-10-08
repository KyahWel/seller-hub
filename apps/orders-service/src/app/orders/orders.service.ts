import { Injectable } from '@nestjs/common';
import { badRequest, CrudService } from '@org/api-core';
import type {
  CreateOrderPayload,
  EntityData,
  Order,
  UpdateOrderPayload,
} from '@org/contracts';
import { canTransitionOrder } from '@org/contracts';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService extends CrudService<
  Order,
  CreateOrderPayload,
  UpdateOrderPayload
> {
  protected readonly entityName = 'Order';

  constructor(repository: OrdersRepository) {
    super(repository);
  }

  protected override toCreateData({
    shippingFee = 0,
    ...payload
  }: CreateOrderPayload): EntityData<Order> {
    const subtotal = payload.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    return {
      ...payload,
      shippingFee,
      status: 'pending',
      total: subtotal + shippingFee,
    };
  }

  protected override toUpdateData(
    changes: UpdateOrderPayload,
    existing: Order,
  ): Partial<EntityData<Order>> {
    const { status } = changes;
    if (status && !canTransitionOrder(existing.status, status)) {
      throw badRequest(
        `Order cannot move from ${existing.status} to ${status}`,
      );
    }
    return changes;
  }
}
