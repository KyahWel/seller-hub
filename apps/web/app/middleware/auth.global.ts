/** Pages reachable while signed out. Signed-in sellers are sent home from them. */
const GUEST_ONLY = new Set(['/login', '/register']);

/** Sends signed-out visitors to `/login`, then back to where they were going. */
export default defineNuxtRouteMiddleware(async (to) => {
  const { seller, load } = useSession();
  if (seller.value === undefined) await load();

  if (GUEST_ONLY.has(to.path)) {
    if (seller.value) return navigateTo('/');
    return;
  }
  if (!seller.value) {
    return navigateTo({
      path: '/login',
      query: to.fullPath === '/' ? {} : { redirect: to.fullPath },
    });
  }
});
