import {
  randomBytes,
  scrypt as scryptCallback,
  type ScryptOptions,
  timingSafeEqual,
} from 'node:crypto';

const scrypt = (
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
) =>
  new Promise<Buffer>((resolve, reject) =>
    scryptCallback(password, salt, keyLength, options, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );

/** scrypt cost (N=2^15, r=8, p=1): roughly 50-100 ms and 32 MiB per hash. */
const PARAMS = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Hashes a password as `scrypt$N$r$p$salt$key` (base64), so the cost can be
 * raised later without breaking existing hashes.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await scrypt(password, salt, KEY_LENGTH, PARAMS);
  return [
    'scrypt',
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString('base64'),
    key.toString('base64'),
  ].join('$');
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [algorithm, n, r, p, salt, key] = stored.split('$');
  if (algorithm !== 'scrypt' || !salt || !key) return false;
  const expected = Buffer.from(key, 'base64');
  const actual = await scrypt(
    password,
    Buffer.from(salt, 'base64'),
    expected.length,
    {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: PARAMS.maxmem,
    },
  );
  return timingSafeEqual(actual, expected);
}

/**
 * A real hash of a random password. Verifying against it when an email is
 * unknown makes failed logins take the same time either way, so response
 * times do not reveal which emails are registered.
 */
export const DUMMY_HASH = hashPassword(randomBytes(16).toString('hex'));
