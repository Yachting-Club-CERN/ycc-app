import { expect, Page, test } from "@playwright/test";

import { TEST_USERS } from "./test-constants";
import { app, expectSameElements } from "./test-utils";

const signUp = async (
  page: Page,
  id: number,
  role: "Captain" | "Helper",
): Promise<void> => {
  await test.step(`Sign up as ${role}`, async () => {
    await page.getByRole("button", { name: `Sign up as ${role}` }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: `Sign up as ${role}` })
      .click();

    await page.waitForURL(new RegExp(`/helpers/tasks/${id}$`));
    await expect(page.getByRole("dialog")).toBeHidden();
  });
};

const checkCaptain = async (
  page: Page,
  expectedCaptain: string | null,
): Promise<void> => {
  await test.step(`Check captain: ${expectedCaptain}`, async () => {
    const captain = await page
      .locator("//div[contains(text(), 'Captain:')]")
      .locator("..")
      .locator("a")
      .allInnerTexts();

    expectSameElements(captain, expectedCaptain ? [expectedCaptain] : []);
  });
};

const checkHelpers = async (
  page: Page,
  expectedHelpers: string[],
): Promise<void> => {
  await test.step(`Check helpers: ${expectedHelpers.length > 0 ? expectedHelpers.join(", ") : "none"}`, async () => {
    const helpers = await page
      .locator("//div[contains(text(), 'Helpers:')]")
      .locator("..")
      .locator("a")
      .allInnerTexts();

    expectSameElements(helpers, expectedHelpers);
  });
};

test("Helpers: Create task and sign up as captain", async ({ page }) => {
  await app.loadPage(page, "/helpers", { expectSignIn: true });

  await page.getByRole("link", { name: "New Task" }).click();
  await page.waitForURL("/helpers/tasks/new");

  const id = await app.createHelperTask(page);
  await checkCaptain(page, null);

  await signUp(page, id, "Captain");
  await checkCaptain(page, TEST_USERS.ADMIN.display);
});

test("Helpers: Create task and sign up as helper", async ({ browser }) => {
  let context = await browser.newContext();
  let page = await context.newPage();

  await app.loadPage(page, "/helpers", { expectSignIn: true });

  await page.getByRole("link", { name: "New Task" }).click();
  await page.waitForURL("/helpers/tasks/new");

  const id = await app.createHelperTask(page);
  await checkHelpers(page, []);

  await signUp(page, id, "Helper");
  await checkHelpers(page, [TEST_USERS.ADMIN.display]);

  await app.signOut(page);

  context = await browser.newContext();
  page = await context.newPage();

  await app.loadPage(page, `/helpers/tasks/${id}`, {
    expectSignIn: true,
    user: TEST_USERS.MEMBER.username,
  });
  await page.waitForURL(new RegExp(`/helpers/tasks/${id}$`));

  await signUp(page, id, "Helper");
  await checkHelpers(page, [
    TEST_USERS.ADMIN.display,
    TEST_USERS.MEMBER.display,
  ]);
});
