import { RpcException } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import type { CreateOrderPayload } from '@org/contracts';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const payload: CreateOrderPayload = {
    sellerId: 's1',
    channel: 'facebook',
    paymentMethod: 'cod',
    items: [
      { name: 'T-shirt', quantity: 2, unitPrice: 25_000 },
      { name: 'Cap', quantity: 1, unitPrice: 15_000 },
    ],
    shippingFee: 8_000,
  };
  let service: OrdersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [OrdersService, OrdersRepository],
    }).compile();

    service = moduleRef.get(OrdersService);
  });

  it('creates a pending order and computes the total', async () => {
    const order = await service.create(payload);

    expect(order).toMatchObject({ status: 'pending', total: 73_000 });
  });

  it('defaults the shipping fee to zero', async () => {
    const order = await service.create({ ...payload, shippingFee: undefined });

    expect(order).toMatchObject({ shippingFee: 0, total: 65_000 });
  });

  it('filters orders by seller', async () => {
    const mine = await service.create(payload);
    await service.create({ ...payload, sellerId: 's2' });

    await expect(
      service.findAll({ where: { sellerId: 's1' } }),
    ).resolves.toMatchObject({ items: [mine], total: 1 });
  });

  it('allows valid status transitions', async () => {
    const order = await service.create(payload);

    await expect(
      service.update(order.id, { status: 'confirmed' }),
    ).resolves.toMatchObject({ status: 'confirmed' });
  });

  it('rejects invalid status transitions with 400', async () => {
    const order = await service.create(payload);

    const error = await service
      .update(order.id, { status: 'delivered' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RpcException);
    expect((error as RpcException).getError()).toMatchObject({
      statusCode: 400,
    });
  });
});
