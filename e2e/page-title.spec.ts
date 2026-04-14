/**
 * E2E tests for dynamic page titles.
 *
 * These tests run against the full integration environment with real
 * Keycloak authentication and the YCC API backend.
 */
import { expect, test } from "@playwright/test";

import { app } from "./test-utils";

test("Page title: home page title contains 'YCC App'", async ({ page }) => {
  await app.loadPage(page, "/", { expectSignIn: true });
  expect(await page.title()).toContain("YCC App");
});

test("Page title: helper tasks list shows 'Helper Tasks'", async ({ page }) => {
  await app.loadPage(page, "/helpers", { expectSignIn: true });
  expect(await page.title()).toBe("Helper Tasks | YCC App");
});

test("Page title: helper task detail shows task title", async ({ page }) => {
  await app.loadPage(page, "/helpers/tasks/new", { expectSignIn: true });
  await app.createHelperTask(page, { title: "Page Title E2E" });
  // createHelperTask navigates to the task detail page and waits for h2
  await page.waitForSelector("#ycc-page-end", { state: "attached" });
  expect(await page.title()).toBe("Page Title E2E | YCC App");
});

test("Page title: members page shows active members title", async ({
  page,
}) => {
  await app.loadPage(page, "/members", { expectSignIn: true });
  const title = await page.title();
  expect(title).toMatch(/^Active Members \(\d{4}\) \| YCC App$/);
});

test("Page title: 404 page shows 'Page Not Found'", async ({ page }) => {
  await app.loadPage(page, "/this-page-does-not-exist", {
    expectSignIn: true,
  });
  await expect(page.locator("h2")).toContainText("Page Not Found");
  expect(await page.title()).toBe("Page Not Found | YCC App");
});

test("Page title: navigating between pages updates title", async ({ page }) => {
  // Start on the helper tasks list
  await app.loadPage(page, "/helpers", { expectSignIn: true });
  expect(await page.title()).toBe("Helper Tasks | YCC App");

  // Navigate to the members page
  await app.loadPage(page, "/members", { expectSignIn: false });
  expect(await page.title()).toMatch(/^Active Members \(\d{4}\) \| YCC App$/);

  // Navigate back to the helper tasks list
  await page.goBack();
  await page.waitForSelector("#ycc-page-end", { state: "attached" });
  expect(await page.title()).toBe("Helper Tasks | YCC App");
});
