import type { CredentialsPayload, RegisterPayload, User } from '@org/contracts';

/**
 * The signed-in seller. The gateway keeps the session in an `httpOnly`
 * cookie, so the app learns who is signed in by asking `/api/users/me`.
 * `undefined` means not checked yet; `null` means signed out.
 */
export function useSession() {
  const seller = useState<User | null | undefined>('session', () => undefined);
  // Forwards the browser's cookie when called during SSR.
  const requestFetch = useRequestFetch();

  async function load() {
    try {
      seller.value = await requestFetch<User>('/api/users/me');
    } catch {
      seller.value = null;
    }
  }

  async function login(credentials: CredentialsPayload) {
    seller.value = await $fetch<User>('/api/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async function register(payload: RegisterPayload) {
    seller.value = await $fetch<User>('/api/auth/register', {
      method: 'POST',
      body: payload,
    });
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' });
    seller.value = null;
    // Drop cached responses so the next seller sees none of this data.
    clearNuxtData();
    await navigateTo('/login');
  }

  return { seller, load, login, register, logout };
}
