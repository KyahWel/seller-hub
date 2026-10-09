import {
  defineEventHandler,
  getRequestIP,
  getRequestURL,
  getRouterParam,
  proxyRequest,
} from 'h3';
import { useRuntimeConfig } from 'nitropack/runtime';
import { joinURL } from 'ufo';

/**
 * Proxies `/api/**` to the NestJS API gateway so the browser never talks to
 * it directly (no CORS, one origin). The target is `runtimeConfig.apiBaseUrl`
 * (override with NUXT_API_BASE_URL).
 *
 * X-Forwarded-For is replaced, not appended, with the address that connected
 * to this server, so clients cannot spoof the IP the gateway rate-limits on.
 * Behind a load balancer, set NUXT_TRUST_FORWARDED_FOR=true to use the
 * address it reports instead.
 *
 * Under `nuxt dev` the dev server's own proxy reports the client's
 * X-Forwarded-For as the socket address, so this only holds for builds.
 */
export default defineEventHandler((event) => {
  const { apiBaseUrl, trustForwardedFor } = useRuntimeConfig(event);
  const path = getRouterParam(event, 'path') ?? '';
  const query = getRequestURL(event).search;
  const clientIp = getRequestIP(event, {
    xForwardedFor: Boolean(trustForwardedFor),
  });

  return proxyRequest(event, joinURL(apiBaseUrl, path) + query, {
    headers: clientIp ? { 'x-forwarded-for': clientIp } : {},
  });
});
