import {
  defineEventHandler,
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
 */
export default defineEventHandler((event) => {
  const { apiBaseUrl } = useRuntimeConfig(event);
  const path = getRouterParam(event, 'path') ?? '';
  const query = getRequestURL(event).search;

  return proxyRequest(event, joinURL(apiBaseUrl, path) + query);
});
