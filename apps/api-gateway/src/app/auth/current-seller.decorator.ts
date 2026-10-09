import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { signedInSeller } from './session';

/** Injects the signed-in seller's id: `me(@CurrentSeller() sellerId: string)`. */
export const CurrentSeller = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    signedInSeller(context.switchToHttp().getRequest()),
);
