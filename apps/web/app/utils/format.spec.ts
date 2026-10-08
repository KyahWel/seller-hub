import { describe, expect, it } from 'vitest';
import { formatCurrency, formatPeso, initials, toCentavos } from './format';

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });
});

describe('formatPeso', () => {
  it('formats centavos as pesos', () => {
    expect(formatPeso(123_450)).toBe('₱1,234.50');
  });
});

describe('toCentavos', () => {
  it('rounds away floating point noise', () => {
    expect(toCentavos(0.1 + 0.2)).toBe(30);
    expect(toCentavos(199.99)).toBe(19_999);
  });
});

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('ada  lovelace byron')).toBe('AL');
  });

  it('handles an empty name', () => {
    expect(initials('')).toBe('');
  });
});
