import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BuyerForm from './BuyerForm.vue';

async function submit(wrapper: VueWrapper) {
  await wrapper.get('form').trigger('submit');
  await flushPromises();
}

describe('BuyerForm', () => {
  it('requires a Philippine mobile number', async () => {
    const wrapper = await mountSuspended(BuyerForm);

    await wrapper.get('input[name="name"]').setValue('Juan');
    await wrapper.get('input[name="phone"]').setValue('12345');
    await submit(wrapper);

    expect(wrapper.text()).toContain('Use 09XXXXXXXXX');
    expect(wrapper.emitted('submit')).toBeUndefined();

    await wrapper.get('input[name="phone"]').setValue('09171234567');
    await submit(wrapper);

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          name: 'Juan',
          phone: '09171234567',
          address: undefined,
          notes: undefined,
        },
      ],
    ]);
  });
});
