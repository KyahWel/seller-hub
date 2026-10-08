/** Sends the user to pick a seller first. Add with `definePageMeta({ middleware: 'seller' })`. */
export default defineNuxtRouteMiddleware(() => {
  const sellerId = useCookie<string | null>('sellerId');
  if (!sellerId.value) return navigateTo('/sellers');
});
