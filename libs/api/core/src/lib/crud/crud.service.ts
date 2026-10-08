import type {
  BaseEntity,
  EntityData,
  ListQuery,
  Paginated,
} from '@org/contracts';
import { notFound } from '../errors/rpc-errors.js';
import type { Repository } from '../persistence/repository.js';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Generic CRUD over a `Repository`. Extend it per resource and override the
 * hooks (`toCreateData`, `toUpdateData`) or any method to add domain rules.
 *
 * @typeParam T entity, @typeParam C create payload, @typeParam U update payload
 */
export abstract class CrudService<
  T extends BaseEntity,
  C = EntityData<T>,
  U = Partial<C>,
> {
  /** Used in error messages, e.g. `'User'`. */
  protected abstract readonly entityName: string;

  constructor(protected readonly repository: Repository<T>) {}

  async findAll({
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    where,
  }: ListQuery<T> = {}): Promise<Paginated<T>> {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(limit)));
    const { items, total } = await this.repository.findMany({
      where,
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });
    return { items, total, page: safePage, limit: safeLimit };
  }

  async findOne(id: string): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity) throw notFound(this.entityName, id);
    return entity;
  }

  async create(payload: C): Promise<T> {
    return this.repository.create(await this.toCreateData(payload));
  }

  async update(id: string, changes: U): Promise<T> {
    const existing = await this.findOne(id);
    const updated = await this.repository.update(
      id,
      await this.toUpdateData(changes, existing),
    );
    if (!updated) throw notFound(this.entityName, id);
    return updated;
  }

  async remove(id: string): Promise<T> {
    const removed = await this.repository.delete(id);
    if (!removed) throw notFound(this.entityName, id);
    return removed;
  }

  /** Maps a create payload to stored data. Override to set defaults or derive fields. */
  protected toCreateData(payload: C): EntityData<T> | Promise<EntityData<T>> {
    return payload as unknown as EntityData<T>;
  }

  /** Maps an update payload to stored changes. Override to validate transitions. */
  protected toUpdateData(
    changes: U,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    existing: T,
  ): Partial<EntityData<T>> | Promise<Partial<EntityData<T>>> {
    return changes as unknown as Partial<EntityData<T>>;
  }
}
