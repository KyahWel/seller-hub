import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProductForm from './ProductForm.vue';

async function submit(wrapper: VueWrapper) {
  await wrapper.get('form').trigger('submit');
  await flushPromises();
}

describe('ProductForm', () => {
  it('emits prices in centavos', async () => {
    const wrapper = await mountSuspended(ProductForm);

    await wrapper.get('input[name="name"]').setValue('  Cap ');
    await wrapper.get('input[name="price"]').setValue('199.99');
    await wrapper.get('input[name="stock"]').setValue('5');
    await submit(wrapper);

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

  it('shows field errors instead of submitting', async () => {
    const wrapper = await mountSuspended(ProductForm);

    await wrapper.get('input[name="price"]').setValue('12.345');
    await submit(wrapper);

    expect(wrapper.emitted('submit')).toBeUndefined();
    expect(wrapper.text()).toContain('Enter a product name');
    expect(wrapper.text()).toContain('Enter an amount like 199 or 199.50');
  });

  it('prefills from an existing product when editing', async () => {
    const wrapper = await mountSuspended(ProductForm, {
      props: {
        initial: {
          id: 'p1',
          sellerId: 's1',
          name: 'Cap',
          price: 15_000,
          cost: 9_000,
          stock: 3,
          createdAt: '',
          updatedAt: '',
        },
      },
    });

    expect(
      (wrapper.get('input[name="price"]').element as HTMLInputElement).value,
    ).toBe('150');
    expect(wrapper.text()).toContain('40% margin per sale');
  });
});
