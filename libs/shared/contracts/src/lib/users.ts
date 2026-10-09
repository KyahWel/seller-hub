import { type BaseEntity, crudPatterns } from './common.js';

export const UsersPatterns = {
  ...crudPatterns('users'),
  /** Create a user with a password. Replies with the `User`. */
  Register: 'users.register',
  /** Check an email/password pair. Replies with the `User`, or `null`. */
  VerifyCredentials: 'users.verifyCredentials',
} as const;

/** A seller account. Credentials are stored separately and never returned. */
export interface User extends BaseEntity {
  name: string;
  email: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

export interface RegisterPayload extends CreateUserPayload {
  password: string;
}

export interface CredentialsPayload {
  email: string;
  password: string;
}

export const PASSWORD_MIN_LENGTH = 8;
/** Caps hashing work per request. */
export const PASSWORD_MAX_LENGTH = 128;
