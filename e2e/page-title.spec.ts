/**
 * E2E tests for dynamic page titles with a fully mocked backend.
 *
 * These tests run against a Vite dev server started in test mode
 * (VITE_TEST_USER=true), which bypasses Keycloak authentication.
 * All YCC API responses are mocked using page.route().
 *
 * See playwright.mocked.config.ts for the test configuration.
 */
import { expect, Page, Route, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_TASK_ID = 42;
const MOCK_TASK_TITLE = "Regatta Safety Boat";

const MOCK_MEMBER = {
  id: 1,
  username: "TUSER",
  firstName: "Test",
  lastName: "User",
  email: "test@ycc-test.ch",
  mobilePhone: null,
  homePhone: null,
  workPhone: null,
};

const MOCK_TASK = {
  id: MOCK_TASK_ID,
  category: {
    id: 1,
    title: "Sailing Events",
    shortDescription: "Tasks related to sailing events",
    longDescription: null,
  },
  title: MOCK_TASK_TITLE,
  shortDescription: "Drive the safety boat during the regatta.",
  longDescription: null,
  contact: MOCK_MEMBER,
  startsAt: "2099-06-15T09:00:00Z",
  endsAt: "2099-06-15T17:00:00Z",
  deadline: null,
  urgent: false,
  captainRequiredLicenceInfo: null,
  helperMinCount: 0,
  helperMaxCount: 2,
  published: true,
  captain: null,
  helpers: [],
  markedAsDoneAt: null,
  markedAsDoneBy: null,
  markedAsDoneComment: null,
  validatedAt: null,
  validatedBy: null,
  validationComment: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sets up route mocks for all YCC API calls.
 * Must be called before navigating to any page.
 */
const mockApi = async (page: Page): Promise<void> => {
  const apiBase = "http://localhost:8000/api/v1";

  // Mock helpers tasks list
  await page.route(`${apiBase}/helpers/tasks**`, (route: Route) => {
    void route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([MOCK_TASK]),
    });
  });

  // Mock single helper task
  await page.route(
    `${apiBase}/helpers/tasks/${MOCK_TASK_ID}`,
    (route: Route) => {
      void route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_TASK),
      });
    },
  );

  // Mock members list
  await page.route(`${apiBase}/members**`, (route: Route) => {
    void route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([MOCK_MEMBER]),
    });
  });
};

/**
 * Navigates to a path and waits for the page to finish loading.
 */
const loadPage = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  // Wait for the page-end marker that signals the app has fully rendered
  await page.waitForSelector("#ycc-page-end", { state: "attached" });
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("Page title: default is 'YCC App'", async ({ page }) => {
  // The initial HTML title before any page renders
  await page.goto("/");
  // Before React mounts the app, the title comes from index.html
  // After mount, the home page updates it via PageTitle components
  // We just verify it's set (not empty)
  await page.waitForSelector("#ycc-page-end", { state: "attached" });
  const title = await page.title();
  expect(title).toContain("YCC App");
});

test("Page title: helper task detail shows task title", async ({ page }) => {
  await loadPage(page, `/helpers/tasks/${MOCK_TASK_ID}`);

  await expect(page.locator("h2")).toContainText(MOCK_TASK_TITLE);
  expect(await page.title()).toBe(`${MOCK_TASK_TITLE} | YCC App`);
});

test("Page title: helper tasks list shows 'Helper Tasks'", async ({ page }) => {
  await loadPage(page, "/helpers");

  await expect(page.locator("h2").first()).toContainText("Helper Tasks");
  expect(await page.title()).toBe("Helper Tasks | YCC App");
});

test("Page title: members page shows active members title", async ({
  page,
}) => {
  await loadPage(page, "/members");

  const title = await page.title();
  expect(title).toMatch(/^Active Members \(\d{4}\) \| YCC App$/);
});

test("Page title: 404 page shows 'Page Not Found'", async ({ page }) => {
  await loadPage(page, "/this-page-does-not-exist");

  await expect(page.locator("h2")).toContainText("Page Not Found");
  expect(await page.title()).toBe("Page Not Found | YCC App");
});

test("Page title: navigating between pages updates title", async ({ page }) => {
  // Start on the tasks list
  await loadPage(page, "/helpers");
  expect(await page.title()).toBe("Helper Tasks | YCC App");

  // Navigate to a specific task
  await page.goto(`/helpers/tasks/${MOCK_TASK_ID}`);
  await page.waitForSelector("#ycc-page-end", { state: "attached" });
  expect(await page.title()).toBe(`${MOCK_TASK_TITLE} | YCC App`);

  // Navigate back to the tasks list
  await page.goBack();
  await page.waitForSelector("#ycc-page-end", { state: "attached" });
  expect(await page.title()).toBe("Helper Tasks | YCC App");
});
