import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    // Run tests on the LOCAL instance
    // baseURL: 'http://localhost:3000',
    // Run tests on the DEV instance
    baseURL: "https://ycc-dev.app.cern.ch",
    trace: "on-first-retry",
  },
  // timeout: 120000,
  // High timeout is useful when running tests locally in parallel
  timeout: 300000,
  projects: [
    {
      name: "Desktop: Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Desktop: Chrome - French",
      use: { ...devices["Desktop Chrome"], locale: "fr-FR" },
    },
    // For testing time zone support, e.g., https://github.com/Yachting-Club-CERN/ycc-app/issues/77
    // {
    //   name: 'Desktop: Edge - Japan time zone',
    //   use: {...devices['Desktop Edge'], timezoneId: 'Asia/Tokyo'},
    // },
    {
      name: "Desktop: Firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "Desktop: Safari",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile: Pixel 5 (Android)",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile: Pixel 5 (Android) - French",
      use: { ...devices["Pixel 5"], locale: "fr-FR" },
    },
    {
      name: "Mobile: iPhone 12 (iOS)",
      use: { ...devices["iPhone 12"] },
    },
    {
      name: "Mobile: iPhone 12 (iOS) - French",
      use: { ...devices["iPhone 12"], locale: "fr-FR" },
    },
  ],
});
