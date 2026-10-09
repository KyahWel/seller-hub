import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  workspaceDir: '../../',
  devtools: { enabled: true },
  devServer: {
    host: 'localhost',
    port: 4200,
  },
  runtimeConfig: {
    // Server-only. Override at runtime with NUXT_API_BASE_URL.
    apiBaseUrl: 'http://localhost:3000/api',
    // Set to true (NUXT_TRUST_FORWARDED_FOR) only behind a trusted proxy.
    trustForwardedFor: false,
  },
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        // Forbid embedding the app in frames (clickjacking).
        'Content-Security-Policy':
          "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
        'X-Frame-Options': 'DENY',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
  },
  typescript: {
    // Type-checking runs as its own Nx target (`nx typecheck @org/web`).
    typeCheck: false,
    tsConfig: {
      compilerOptions: {
        // Resolve workspace libs (e.g. @org/contracts) to their TS sources.
        customConditions: ['@org/source'],
      },
    },
  },
  css: ['~/assets/css/styles.css'],
  $production: {
    routeRules: {
      // Browsers only honour this over HTTPS; production must be served over HTTPS.
      '/**': {
        headers: {
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        },
      },
    },
  },
});
