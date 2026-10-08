import { canTransitionOrder } from './orders.js';

describe('canTransitionOrder', () => {
  it('allows forward steps and staying put', () => {
    expect(canTransitionOrder('pending', 'confirmed')).toBe(true);
    expect(canTransitionOrder('shipped', 'shipped')).toBe(true);
  });

  it('rejects skipping steps and leaving a final status', () => {
    expect(canTransitionOrder('pending', 'delivered')).toBe(false);
    expect(canTransitionOrder('cancelled', 'pending')).toBe(false);
  });
});
