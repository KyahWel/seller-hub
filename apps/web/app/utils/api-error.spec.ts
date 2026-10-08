import { describe, expect, it } from 'vitest';
import { apiErrorMessage } from './api-error';

describe('apiErrorMessage', () => {
  it('joins validation messages', () => {
    expect(
      apiErrorMessage({ data: { message: ['name is empty', 'bad phone'] } }),
    ).toBe('name is empty, bad phone');
  });

  it('returns a single message', () => {
    expect(apiErrorMessage({ data: { message: 'Not found' } })).toBe(
      'Not found',
    );
  });

  it('falls back for unknown errors', () => {
    expect(apiErrorMessage(new Error('x'), 'Oops')).toBe('Oops');
  });
});
