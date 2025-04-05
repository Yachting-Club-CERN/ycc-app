import { Locator, expect, test } from "@playwright/test";

import { app } from "./test-utils";

const getDisplayedRows = async (displayedRows: Locator) => {
  const displayedRowsText = await displayedRows.textContent();
  return parseInt(displayedRowsText!.split("of")[1].trim());
};

test("Member List: Find member & info dialog & filter", async ({ page }) => {
  await app.loadPage(page, "/", { expectSignIn: true });

  // Navigate to the member list
  await app.openMenuIfMobile(page);
  await page.getByRole("link", { name: "Member List" }).click();

  // Wait for the grid to load
  const grid = page.locator(".ycc-members-data-grid");
  await expect(grid).toBeVisible();

  // Get the total number of rows
  const displayedRows = grid.locator(".MuiTablePagination-displayedRows");
  const totalRows = await getDisplayedRows(displayedRows);

  // Get the next page of the grid
  await grid.getByTestId("KeyboardArrowRightIcon").click();
  await expect(displayedRows).toContainText(
    // That's an En Dash (U+2013)
    "101–200 of",
  );

  // Get the popup info for a member
  await grid.locator('[data-rowindex="103"] [data-field="firstName"]').click();

  const dialog = page.locator(".ycc-member-info-dialog");
  await expect(dialog).toBeVisible();
  const dialogClose = dialog.locator('button:has-text("Close")');
  await expect(dialogClose).toBeVisible();

  await dialogClose.click();
  await expect(dialog).not.toBeVisible();

  // Filter
  await page.fill(".ycc-members-search-input * input", "+33");

  // Wait for the grid to filter
  await page.waitForTimeout(500);

  const filteredRows = await getDisplayedRows(displayedRows);
  expect(filteredRows).toBeLessThan(totalRows);
});
