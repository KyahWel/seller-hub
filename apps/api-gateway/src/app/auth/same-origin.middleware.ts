import { ForbiddenException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence on top of `SameSite` cookies: browsers send `Origin` with
 * every cross-site write, so writes whose `Origin` is not one of ours are
 * refused. Requests without `Origin` (server-side calls, curl) are allowed;
 * they cannot carry a victim's cookies.
 */
export function rejectCrossOriginWrites(allowedOrigins: readonly string[]) {
  const allowed = new Set(allowedOrigins);
  return (request: Request, _response: Response, next: NextFunction) => {
    const origin = request.headers.origin;
    if (SAFE_METHODS.has(request.method) || !origin || allowed.has(origin)) {
      return next();
    }
    next(new ForbiddenException('Cross-origin request blocked'));
  };
}
