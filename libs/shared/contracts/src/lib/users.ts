import { type BaseEntity, crudPatterns } from './common.js';

export const UsersPatterns = {
  ...crudPatterns('users'),
} as const;

/** A seller account. */
export interface User extends BaseEntity {
  name: string;
  email: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;
