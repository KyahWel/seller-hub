import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import UserCard from './UserCard.vue';

describe('UserCard', () => {
  it('renders the user with initials', async () => {
    const wrapper = await mountSuspended(UserCard, {
      props: {
        user: {
          id: '1',
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    });

    expect(wrapper.text()).toContain('Ada Lovelace');
    expect(wrapper.text()).toContain('ada@example.com');
    expect(wrapper.get('.avatar').text()).toBe('AL');
  });
});
