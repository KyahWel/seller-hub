import type { BaseEntity, EntityData } from '@org/contracts';

export interface FindManyOptions<T> {
  where?: Partial<T>;
  skip?: number;
  take?: number;
}

export interface FindManyResult<T> {
  items: T[];
  total: number;
}

/**
 * Storage port used by `CrudService`. Implement it once per storage engine
 * (in-memory now, a database later) and the services stay unchanged.
 */
export interface Repository<T extends BaseEntity> {
  findMany(options?: FindManyOptions<T>): Promise<FindManyResult<T>>;
  findById(id: string): Promise<T | null>;
  create(data: EntityData<T>): Promise<T>;
  /** Returns `null` when no entity has this id. */
  update(id: string, changes: Partial<EntityData<T>>): Promise<T | null>;
  /** Returns the removed entity, or `null` when no entity has this id. */
  delete(id: string): Promise<T | null>;
}
