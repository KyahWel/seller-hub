import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// The tests run against the production web build on its own port, talking to
// a mock API (mock-api/server.mjs) instead of the gateway and services.
const WEB_PORT = 4300;
const MOCK_API_PORT = 4301;
const baseURL = process.env['BASE_URL'] || `http://localhost:${WEB_PORT}`;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import 'dotenv/config';

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Generated as a .mts file so Node forces ESM regardless of workspace
 * `type`. Playwright routes `.mts` through its ESM loader (dynamic import,
 * bypassing the pirates CJS-compile path), and Nx's native TS strip loads
 * `.mts` directly. Playwright's configLoader auto-discovers
 * `playwright.config.mts` via its extension list
 * (.ts/.js/.mts/.mjs/.cts/.cjs).
 */
export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'node apps/web-e2e/mock-api/server.mjs',
      url: `http://localhost:${MOCK_API_PORT}/api/health`,
      env: { MOCK_API_PORT: String(MOCK_API_PORT) },
      reuseExistingServer: false,
      cwd: workspaceRoot,
    },
    {
      // Built by the e2e target's dependency on @org/web:build.
      command: 'node apps/web/.output/server/index.mjs',
      url: `http://localhost:${WEB_PORT}/login`,
      env: {
        HOST: 'localhost',
        PORT: String(WEB_PORT),
        NUXT_API_BASE_URL: `http://localhost:${MOCK_API_PORT}/api`,
      },
      reuseExistingServer: false,
      cwd: workspaceRoot,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Add firefox / webkit here if you need cross-browser coverage.

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
