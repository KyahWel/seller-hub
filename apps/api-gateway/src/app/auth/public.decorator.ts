import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';

/** Lets a route or controller skip `AuthGuard`. Every other route needs a session. */
export const Public = () => SetMetadata(IS_PUBLIC, true);
