import type { BaseEntity, EntityData } from '@org/contracts';
import { randomUUID } from 'node:crypto';
import type {
  FindManyOptions,
  FindManyResult,
  Repository,
} from './repository.js';

/**
 * Map-backed repository for development and tests. Data is lost on restart.
 * Extend it per entity (`class UsersRepository extends InMemoryRepository<User> {}`)
 * so the class can be swapped for a database-backed one without touching services.
 */
export class InMemoryRepository<T extends BaseEntity> implements Repository<T> {
  private readonly records = new Map<string, T>();

  async findMany({ where, skip = 0, take }: FindManyOptions<T> = {}): Promise<
    FindManyResult<T>
  > {
    const matches = [...this.records.values()].filter((record) =>
      matchesWhere(record, where),
    );
    const end = take === undefined ? undefined : skip + take;
    return { items: matches.slice(skip, end), total: matches.length };
  }

  async findById(id: string): Promise<T | null> {
    return this.records.get(id) ?? null;
  }

  async create(data: EntityData<T>): Promise<T> {
    const now = new Date().toISOString();
    const record = {
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as T;
    this.records.set(record.id, record);
    return record;
  }

  async update(id: string, changes: Partial<EntityData<T>>): Promise<T | null> {
    const existing = this.records.get(id);
    if (!existing) return null;
    const updated: T = {
      ...existing,
      ...stripUndefined(changes),
      updatedAt: new Date().toISOString(),
    };
    this.records.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<T | null> {
    const existing = this.records.get(id) ?? null;
    this.records.delete(id);
    return existing;
  }
}

function matchesWhere<T>(record: T, where?: Partial<T>): boolean {
  if (!where) return true;
  return Object.entries(where).every(
    ([key, value]) => value === undefined || record[key as keyof T] === value,
  );
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}
