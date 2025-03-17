import { Page, expect, test } from "@playwright/test";

import { app, ui } from "./test-utils";

const verifyProfilePage = async (page: Page) => {
  const table = page.locator(".ycc-profile-table");
  await table.waitFor({ state: "visible" });

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
};

test("Profile: Page shows when navigating", async ({ page }) => {
  await app.loadPage(page, "/", { expectSignIn: true });

  await app.openMenuIfMobile(page);
  await ui.clickFirstVisible(await page.getByTestId("AccountCircleIcon").all());

  await verifyProfilePage(page);
});

test("Profile: Page shows when loading directly", async ({ page }) => {
  await app.loadPage(page, "/profile", { expectSignIn: true });

  await verifyProfilePage(page);
});
