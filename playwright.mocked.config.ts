import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E tests with a fully mocked backend.
 *
 * This config starts the Vite dev server in test mode (VITE_TEST_USER=true),
 * which bypasses Keycloak authentication. Individual tests mock the YCC API
 * using page.route().
 *
 * Run with: pnpm test:e2e:mocked
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/page-title.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  webServer: {
    command: "pnpm vite --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
    env: {
      VITE_TEST_USER: "true",
    },
  },
  projects: [
    {
      name: "Desktop: Chrome (Mocked)",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Desktop: Firefox (Mocked)",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
