import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    name: '@org/web',
    watch: false,
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
        // Separate build dir so tests can run in parallel with
        // `nuxt typecheck` / `nuxt build` without clobbering `.nuxt`.
        overrides: { buildDir: 'node_modules/.cache/nuxt/.nuxt-vitest' },
      },
    },
    include: ['{app,server}/**/*.{test,spec}.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8',
    },
  },
});
