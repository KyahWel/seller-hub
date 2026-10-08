import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import UserForm from './UserForm.vue';

describe('UserForm', () => {
  it('disables submit until the form is valid', async () => {
    const wrapper = await mountSuspended(UserForm);
    const button = wrapper.get('button');

    expect(button.attributes('disabled')).toBeDefined();

    await wrapper.get('input[name="name"]').setValue('Ada');
    await wrapper.get('input[name="email"]').setValue('ada@example.com');

    expect(button.attributes('disabled')).toBeUndefined();
  });

  it('emits the trimmed payload and resets', async () => {
    const wrapper = await mountSuspended(UserForm);

    await wrapper.get('input[name="name"]').setValue('  Ada  ');
    await wrapper.get('input[name="email"]').setValue('ada@example.com');
    await wrapper.get('form').trigger('submit');

    expect(wrapper.emitted('submit')).toEqual([
      [{ name: 'Ada', email: 'ada@example.com' }],
    ]);
    expect(
      (wrapper.get('input[name="name"]').element as HTMLInputElement).value,
    ).toBe('');
  });
});
