import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from '@org/api-core';
import type { BaseEntity } from '@org/contracts';

/** Kept apart from `User` so a password hash can never end up in a reply. */
export interface Credential extends BaseEntity {
  userId: string;
  passwordHash: string;
}

/** In-memory for now. Replace the base class with a database-backed repository. */
@Injectable()
export class CredentialsRepository extends InMemoryRepository<Credential> {}
