import { Page, expect, test } from "@playwright/test";

import { app } from "./test-utils";

const verifyMyTasksView = async (page: Page): Promise<void> =>
  await test.step("Verify My Tasks View", async () => {
    await expect(page.locator("h2").nth(0)).toHaveText("My Tasks");
  });

const verifyProfileView = async (page: Page): Promise<void> =>
  await test.step("Verify Profile View", async () => {
    await expect(page.locator("h2").nth(1)).toHaveText("Profile");

    const table = page.locator(".ycc-profile-table");
    await expect(table).toBeVisible();

    const tableText = await table.textContent();
    expect(tableText).toContain("Username");
    expect(tableText).toContain("MHUFF");
    expect(tableText).toContain("Email");
    expect(tableText).toContain("michele.huff@mailinator.com");
    expect(tableText).toContain("Groups");
    expect(tableText).toContain("ycc-members-all-past-and-present");
    expect(tableText).toContain("Roles");
    expect(tableText).toContain("ycc-helpers-app-admin");
    expect(tableText).toContain("ycc-member-active");
  });

test("Home: Page shows", async ({ page }) => {
  await app.loadPage(page, "/", { expectSignIn: true });

  await verifyMyTasksView(page);
  await verifyProfileView(page);
});
