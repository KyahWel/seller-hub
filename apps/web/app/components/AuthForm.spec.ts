import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import AuthForm from './AuthForm.vue';

describe('AuthForm', () => {
  it('signs in with email and password only', async () => {
    const wrapper = await mountSuspended(AuthForm, {
      props: { mode: 'login' },
    });

    expect(wrapper.find('input[name="name"]').exists()).toBe(false);
    await wrapper.get('input[name="email"]').setValue(' ada@example.com ');
    await wrapper.get('input[name="password"]').setValue(' secret ');
    await wrapper.get('form').trigger('submit');

    expect(wrapper.emitted('submit')).toEqual([
      [{ name: '', email: 'ada@example.com', password: ' secret ' }],
    ]);
  });

  it('requires a name and a long enough password to register', async () => {
    const wrapper = await mountSuspended(AuthForm, {
      props: { mode: 'register' },
    });
    const button = wrapper.get('button');

    await wrapper.get('input[name="name"]').setValue('Ada Store');
    await wrapper.get('input[name="email"]').setValue('ada@example.com');
    await wrapper.get('input[name="password"]').setValue('short');
    expect(button.attributes('disabled')).toBeDefined();

    await wrapper.get('input[name="password"]').setValue('long enough');
    expect(button.attributes('disabled')).toBeUndefined();
  });

  it('disables submit while a request is pending', async () => {
    const wrapper = await mountSuspended(AuthForm, {
      props: { mode: 'login', pending: true },
    });

    await wrapper.get('input[name="email"]').setValue('ada@example.com');
    await wrapper.get('input[name="password"]').setValue('secret');

    expect(wrapper.get('button').attributes('disabled')).toBeDefined();
  });
});
