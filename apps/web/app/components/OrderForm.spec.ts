import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { Product } from '@org/contracts';
import { flushPromises, type VueWrapper } from '@vue/test-utils';
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

async function submit(wrapper: VueWrapper) {
  await wrapper.get('form').trigger('submit');
  await flushPromises();
}

describe('OrderForm', () => {
  it('fills an item from a product and emits centavos', async () => {
    const wrapper = await mountSuspended(OrderForm, {
      props: { products: [product], buyers: [] },
    });

    (wrapper.vm as unknown as { addProduct(p: Product): void }).addProduct(
      product,
    );
    await flushPromises();
    await wrapper.get('input[name="items.0.quantity"]').setValue('2');
    await wrapper.get('input[name="shippingFee"]').setValue('80');

    expect(wrapper.get('[data-testid="order-total"]').text()).toBe('₱580.00');

    await submit(wrapper);

    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      channel: 'facebook',
      paymentMethod: 'cod',
      buyerId: undefined,
      shippingFee: 8_000,
      notes: undefined,
      items: [
        { productId: 'p1', name: 'T-shirt', quantity: 2, unitPrice: 25_000 },
      ],
    });
  });

  it('adds products as new lines once the first line is used', async () => {
    const wrapper = await mountSuspended(OrderForm, {
      props: { products: [product], buyers: [] },
    });
    const form = wrapper.vm as unknown as { addProduct(p: Product): void };

    form.addProduct(product);
    form.addProduct(product);
    await flushPromises();

    expect(wrapper.findAll('input[name$=".name"]')).toHaveLength(2);
  });

  it('does not submit while an item is incomplete', async () => {
    const wrapper = await mountSuspended(OrderForm, {
      props: { products: [], buyers: [] },
    });

    await wrapper.get('input[name="items.0.name"]').setValue('Cap');
    await submit(wrapper);

    expect(wrapper.emitted('submit')).toBeUndefined();
    expect(wrapper.text()).toContain('Enter an amount like 199 or 199.50');
  });
});
