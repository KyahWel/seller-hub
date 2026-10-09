import type { CookieOptions } from 'express';

export const SESSION_COOKIE = 'session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

/** The signed-in seller, attached to the request by `AuthGuard`. */
export interface AuthenticatedRequest {
  auth?: { sellerId: string };
}

export interface SessionClaims {
  /** The seller's user id. */
  sub: string;
}

/**
 * `httpOnly` keeps the token away from page scripts; `SameSite=Lax` keeps
 * other sites from sending it with form posts or fetches.
 */
export function sessionCookieOptions(secure: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS * 1000,
  };
}

/** Reads one cookie from a `Cookie` header. */
export function readCookie(
  header: string | undefined,
  name: string,
): string | undefined {
  for (const part of header?.split(';') ?? []) {
    const index = part.indexOf('=');
    if (index > 0 && part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return undefined;
}

/** The signed-in seller's id. Only call on routes behind `AuthGuard`. */
export function signedInSeller(request: unknown): string {
  const sellerId = (request as AuthenticatedRequest).auth?.sellerId;
  if (!sellerId) throw new Error('signedInSeller() used on a public route');
  return sellerId;
}
