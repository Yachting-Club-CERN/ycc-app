import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'Desktop: Chrome',
      use: {...devices['Desktop Chrome']},
    },
    {
      name: 'Desktop: Edge',
      use: {...devices['Desktop Edge']},
    },
    {
      name: 'Desktop: Firefox',
      use: {...devices['Desktop Firefox']},
    },
    {
      name: 'Desktop: Safari',
      use: {...devices['Desktop Safari']},
    },
    {
      name: 'Mobile: Pixel 5 (Android)',
      use: {...devices['Pixel 5']},
    },
    {
      name: 'Mobile: iPhone 12 (iOS)',
      use: {...devices['iPhone 12']},
    },
  ],
});
