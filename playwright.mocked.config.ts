import { defineConfig, devices } from "@playwright/test";

const IS_CI = !!process.env["CI"];

/**
 * Playwright configuration for E2E tests with a fully mocked backend.
 *
 * This config starts the Vite dev server in test mode (VITE_TEST_USER=true),
 * which bypasses Keycloak authentication. Individual tests mock the YCC API
 * using page.route().
 *
 * Run with: pnpm e2e:mocked
 */
export default defineConfig({
  testDir: "e2e",
  testMatch: "**/page-title.spec.ts",
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 1 : "75%",
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
    reuseExistingServer: !IS_CI,
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
