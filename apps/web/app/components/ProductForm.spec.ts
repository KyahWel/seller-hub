import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import ProductForm from './ProductForm.vue';

describe('ProductForm', () => {
  it('emits prices in centavos', async () => {
    const wrapper = await mountSuspended(ProductForm);

    await wrapper.get('input[name="name"]').setValue('  Cap ');
    await wrapper.get('input[name="price"]').setValue('199.99');
    await wrapper.get('input[name="stock"]').setValue('5');
    await wrapper.get('form').trigger('submit');

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          name: 'Cap',
          sku: undefined,
          price: 19_999,
          cost: undefined,
          stock: 5,
        },
      ],
    ]);
  });

  it('prefills from an existing product when editing', async () => {
    const wrapper = await mountSuspended(ProductForm, {
      props: {
        initial: {
          id: 'p1',
          sellerId: 's1',
          name: 'Cap',
          price: 15_000,
          stock: 3,
          createdAt: '',
          updatedAt: '',
        },
      },
    });

    expect(
      (wrapper.get('input[name="price"]').element as HTMLInputElement).value,
    ).toBe('150');
  });
});
