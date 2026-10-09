import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AuthForm from './AuthForm.vue';

async function submit(wrapper: VueWrapper) {
  await wrapper.get('form').trigger('submit');
  await flushPromises();
}

describe('AuthForm', () => {
  it('signs in with email and password only', async () => {
    const wrapper = await mountSuspended(AuthForm, {
      props: { mode: 'login' },
    });

    expect(wrapper.find('input[name="name"]').exists()).toBe(false);
    await wrapper.get('input[name="email"]').setValue(' ada@example.com ');
    await wrapper.get('input[name="password"]').setValue(' secret ');
    await submit(wrapper);

    expect(wrapper.emitted('submit')).toEqual([
      [{ name: '', email: 'ada@example.com', password: ' secret ' }],
    ]);
  });

  it('requires a name and a long enough password to register', async () => {
    const wrapper = await mountSuspended(AuthForm, {
      props: { mode: 'register' },
    });

    await wrapper.get('input[name="name"]').setValue('Ada Store');
    await wrapper.get('input[name="email"]').setValue('ada@example.com');
    await wrapper.get('input[name="password"]').setValue('short');
    await submit(wrapper);

    expect(wrapper.emitted('submit')).toBeUndefined();
    expect(wrapper.text()).toContain('Use at least 8 characters');

    await wrapper.get('input[name="password"]').setValue('long enough');
    await submit(wrapper);

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          name: 'Ada Store',
          email: 'ada@example.com',
          password: 'long enough',
        },
      ],
    ]);
  });
});
