import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { Product } from '@org/contracts';
import { describe, expect, it } from 'vitest';
import OrderForm from './OrderForm.vue';

const product: Product = {
  id: 'p1',
  sellerId: 's1',
  name: 'T-shirt',
  price: 25_000,
  stock: 10,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('OrderForm', () => {
  it('fills an item from a product and emits centavos', async () => {
    const wrapper = await mountSuspended(OrderForm, {
      props: { products: [product], buyers: [] },
    });

    await wrapper.get('select[name="items.0.productId"]').setValue('p1');
    await wrapper.get('input[name="items.0.quantity"]').setValue('2');
    await wrapper.get('input[name="shippingFee"]').setValue('80');

    expect(wrapper.get('[data-testid="order-total"]').text()).toBe('₱580.00');

    await wrapper.get('form').trigger('submit');

    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({
      channel: 'facebook',
      paymentMethod: 'cod',
      shippingFee: 8_000,
      items: [
        { productId: 'p1', name: 'T-shirt', quantity: 2, unitPrice: 25_000 },
      ],
    });
  });

  it('does not submit while an item is incomplete', async () => {
    const wrapper = await mountSuspended(OrderForm, {
      props: { products: [], buyers: [] },
    });

    await wrapper.get('input[name="items.0.name"]').setValue('Cap');
    await wrapper.get('form').trigger('submit');

    expect(wrapper.emitted('submit')).toBeUndefined();
    expect(
      wrapper.get('button[type="submit"]').attributes('disabled'),
    ).toBeDefined();
  });
});
