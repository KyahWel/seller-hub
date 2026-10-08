import { resolveServiceAddress } from './transport.js';

describe('resolveServiceAddress', () => {
  const defaults = { host: 'localhost', port: 3001 };

  it('falls back to defaults when env is empty', () => {
    expect(resolveServiceAddress('USERS_SERVICE', defaults, {})).toEqual(
      defaults,
    );
  });

  it('reads host and port from env', () => {
    expect(
      resolveServiceAddress('USERS_SERVICE', defaults, {
        USERS_SERVICE_HOST: 'users',
        USERS_SERVICE_PORT: '4001',
      }),
    ).toEqual({ host: 'users', port: 4001 });
  });

  it('ignores an invalid port', () => {
    expect(
      resolveServiceAddress('USERS_SERVICE', defaults, {
        USERS_SERVICE_PORT: 'abc',
      }),
    ).toEqual(defaults);
  });
});
