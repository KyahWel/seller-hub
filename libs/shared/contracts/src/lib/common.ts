/** Fields every persisted entity has. Repositories own them. */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/** The writable part of an entity: everything except the `BaseEntity` fields. */
export type EntityData<T extends BaseEntity> = Omit<T, keyof BaseEntity>;

export interface ListQuery<T = unknown> {
  /** 1-based page number. */
  page?: number;
  limit?: number;
  /** Exact-match filters, e.g. `{ sellerId }`. */
  where?: Partial<T>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IdPayload<T = unknown> {
  id: string;
  /**
   * Only match a record whose fields equal these, e.g. `{ sellerId }` so a
   * seller can only reach their own records. A mismatch is reported as 404.
   */
  scope?: Partial<T>;
}

export interface UpdatePayload<U, T = unknown> extends IdPayload<T> {
  changes: U;
}

/**
 * Builds the standard CRUD message patterns for a resource, e.g.
 * `crudPatterns('products').FindAll === 'products.findAll'`.
 * Spread it into a resource's pattern object and add custom patterns next to it.
 */
export function crudPatterns<const P extends string>(resource: P) {
  return {
    FindAll: `${resource}.findAll`,
    FindOne: `${resource}.findOne`,
    Create: `${resource}.create`,
    Update: `${resource}.update`,
    Remove: `${resource}.remove`,
  } as const;
}

export type CrudPatterns = ReturnType<typeof crudPatterns<string>>;

/** Shape of an error that crosses a service boundary (see `@org/api-core`). */
export interface RpcErrorBody {
  statusCode: number;
  message: string;
}
