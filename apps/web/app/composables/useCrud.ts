import type { BaseEntity, Paginated } from '@org/contracts';

export type CrudQuery = Record<string, string | number | undefined>;

/**
 * Client for a resource exposed by the gateway's `CrudHttpController`
 * (`/api/<resource>`). The list refetches whenever `query` changes. The
 * gateway scopes every request to the signed-in seller.
 *
 * ```ts
 * const products = useCrud<Product, ProductFormValue, UpdateProductPayload>(
 *   'products', () => ({ sku: sku.value }),
 * );
 * ```
 */
export function useCrud<T extends BaseEntity, C, U>(
  resource: string,
  query: MaybeRefOrGetter<CrudQuery> = {},
) {
  const url = `/api/${resource}`;
  const { data, status, error, refresh } = useFetch<Paginated<T>>(url, {
    query: computed(() => toValue(query)),
    default: () => ({ items: [], total: 0, page: 1, limit: 0 }),
  });

  const items = computed(() => data.value.items);

  async function create(payload: C): Promise<T> {
    const created = await $fetch<T>(url, {
      method: 'POST',
      body: payload as object,
    });
    await refresh();
    return created;
  }

  async function update(id: string, changes: U): Promise<T> {
    const updated = await $fetch<T>(`${url}/${id}`, {
      method: 'PATCH',
      body: changes as object,
    });
    await refresh();
    return updated;
  }

  async function remove(id: string): Promise<T> {
    const removed = await $fetch<T>(`${url}/${id}`, { method: 'DELETE' });
    await refresh();
    return removed;
  }

  return { page: data, items, status, error, refresh, create, update, remove };
}
