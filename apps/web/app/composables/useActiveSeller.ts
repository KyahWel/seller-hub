import type { User } from '@org/contracts';

/**
 * The seller whose data the dashboard shows. Stored in a cookie so it
 * survives reloads and works during SSR. Replaced by login later.
 */
export function useActiveSeller() {
  const sellerId = useCookie<string | null>('sellerId', {
    default: () => null,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  const { data: seller } = useAsyncData(
    'active-seller',
    async () => {
      if (!sellerId.value) return null;
      try {
        return await $fetch<User>(`/api/users/${sellerId.value}`);
      } catch (error) {
        // The services keep data in memory, so a restart forgets sellers.
        if ((error as { statusCode?: number }).statusCode === 404) {
          sellerId.value = null;
        }
        return null;
      }
    },
    { watch: [sellerId] },
  );

  function select(id: string | null) {
    sellerId.value = id;
  }

  return { sellerId, seller, select };
}
