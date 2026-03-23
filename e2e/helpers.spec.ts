import { expect, Page, test } from "@playwright/test";
import dayjs from "dayjs";

import { TEST_USERS } from "./test-constants";
import { app, expectSameElements, ui } from "./test-utils";

const createTask = async (page: Page): Promise<number> =>
  await test.step("Create task", async () => {
    expect(page.url()).toMatch(/\/helpers\/tasks\/new$/);
    await expect(page.locator("h2")).toContainText("New Helper Task");

    const now = dayjs();
    const taskTime = now.format("HH:mm");
    const title = `Test Task @ ${taskTime}`;
    const deadline = now.add(3, "day").format("DD/MM/YYYY HH:mm");

    await ui.selectOption(page.getByLabel("Category"), "Maintenance / General");

    await page.getByLabel("Title").fill(title);
    await page
      .getByLabel("Short Description")
      .fill(`Test task @ ${taskTime} description`);

    await ui.selectOption(
      page.getByLabel("Contact"),
      TEST_USERS.CONTACT.username,
    );

    await page.getByRole("button", { name: "Deadline" }).click();
    await ui.selectDateTime(
      page,
      page.locator(".ycc-helper-task-deadline-input * input"),
      deadline,
    );

    await page.getByLabel("Max. Helpers").fill("2");

    await page.getByRole("button", { name: "Submit" }).click();

    await page.waitForURL(/\/helpers\/tasks\/\d+$/);
    await expect(page.locator("h2")).toContainText(title);

    const id = Number.parseInt(page.url().split("/").pop()!);
    return id;
  });

const signUp = async (
  page: Page,
  id: number,
  role: "Captain" | "Helper",
): Promise<void> =>
  await test.step(`Sign up as ${role}`, async () => {
    await page.getByRole("button", { name: `Sign up as ${role}` }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: `Sign up as ${role}` })
      .click();

    await page.waitForURL(new RegExp(`/helpers/tasks/${id}$`));
    await expect(page.getByRole("dialog")).toBeHidden();
  });

const checkCaptain = async (
  page: Page,
  expectedCaptain: string | null,
): Promise<void> =>
  await test.step(`Check captain: ${expectedCaptain}`, async () => {
    const captain = await page
      .locator("//div[contains(text(), 'Captain:')]")
      .locator("..")
      .locator("a")
      .allInnerTexts();

    expectSameElements(captain, expectedCaptain ? [expectedCaptain] : []);
  });

const checkHelpers = async (
  page: Page,
  expectedHelpers: string[],
): Promise<void> =>
  await test.step(`Check helpers: ${expectedHelpers || "none"}`, async () => {
    const helpers = await page
      .locator("//div[contains(text(), 'Helpers:')]")
      .locator("..")
      .locator("a")
      .allInnerTexts();

    expectSameElements(helpers, expectedHelpers);
  });

test("Helpers: Create task and sign up as captain", async ({ page }) => {
  await app.loadPage(page, "/helpers", { expectSignIn: true });

  await page.getByRole("link", { name: "New Task" }).click();
  await page.waitForURL("/helpers/tasks/new");

  const id = await createTask(page);
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

  const id = await createTask(page);
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
