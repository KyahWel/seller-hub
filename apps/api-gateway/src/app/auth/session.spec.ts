import { readCookie, signedInSeller } from './session';

describe('readCookie', () => {
  it('finds a cookie among others', () => {
    expect(readCookie('a=1; session=abc%3D; b=2', 'session')).toBe('abc=');
  });

  it('does not match a cookie whose name only ends with the name', () => {
    expect(readCookie('xsession=evil', 'session')).toBeUndefined();
  });

  it('handles a missing header', () => {
    expect(readCookie(undefined, 'session')).toBeUndefined();
  });
});

describe('signedInSeller', () => {
  it('reads the seller set by AuthGuard', () => {
    expect(signedInSeller({ auth: { sellerId: 's1' } })).toBe('s1');
  });

  it('refuses to run without a session', () => {
    expect(() => signedInSeller({})).toThrow();
  });
});
