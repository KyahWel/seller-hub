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
});
