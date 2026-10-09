import { describe, expect, it } from 'vitest';
import { safeRedirect } from './redirect';

describe('safeRedirect', () => {
  it('keeps paths on this site', () => {
    expect(safeRedirect('/orders?status=pending')).toBe(
      '/orders?status=pending',
    );
  });

  it.each([
    undefined,
    ['/orders'],
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'orders',
  ])('falls back to the dashboard for %j', (value) => {
    expect(safeRedirect(value)).toBe('/');
  });
});
