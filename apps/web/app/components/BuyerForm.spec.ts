import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import BuyerForm from './BuyerForm.vue';

describe('BuyerForm', () => {
  it('requires a Philippine mobile number', async () => {
    const wrapper = await mountSuspended(BuyerForm);

    await wrapper.get('input[name="name"]').setValue('Juan');
    await wrapper.get('input[name="phone"]').setValue('12345');

    expect(wrapper.text()).toContain('Use 09XXXXXXXXX');
    expect(
      wrapper.get('button[type="submit"]').attributes('disabled'),
    ).toBeDefined();

    await wrapper.get('input[name="phone"]').setValue('09171234567');
    await wrapper.get('form').trigger('submit');

    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({
      name: 'Juan',
      phone: '09171234567',
    });
  });
});
