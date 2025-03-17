import { expect, test } from "@playwright/test";

import { app } from "./test-utils";

test("Home: Page shows", async ({ page }) => {
  await app.loadPage(page, "/", { expectSignIn: true });

  await expect(page).toHaveTitle("YCC App");
  await expect(page.locator("main")).toContainText(
    "Welcome to the new & fancy YCC App!",
  );
});
