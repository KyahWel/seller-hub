import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import StatusBadge from './StatusBadge.vue';

describe('StatusBadge', () => {
  it('shows the status label', async () => {
    const wrapper = await mountSuspended(StatusBadge, {
      props: { status: 'returned' },
    });

    expect(wrapper.text()).toBe('Returned');
  });
});
