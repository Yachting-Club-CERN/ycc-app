import { expect, Page, test } from "@playwright/test";

import { app } from "./test-utils";

const navigateToNewTask = async (page: Page): Promise<void> => {
  await app.loadPage(page, "/helpers", { expectSignIn: true });
  await page.getByRole("link", { name: "New Task" }).click();
  await page.waitForURL("/helpers/tasks/new");
};

// Minimal valid 1x1 red pixel PNG
const TEST_PNG_HEX =
  "89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de" +
  "0000000c49444154789c63f8cfc0000003010100c9fe92ef0000000049454e44ae426082";

const createTestPng = (
  name: string,
): { name: string; mimeType: string; buffer: Buffer } => {
  const bytes = new Uint8Array(TEST_PNG_HEX.length / 2);
  for (let i = 0; i < TEST_PNG_HEX.length; i += 2) {
    bytes[i / 2] = Number.parseInt(TEST_PNG_HEX.substring(i, i + 2), 16);
  }
  return { name, mimeType: "image/png", buffer: Buffer.from(bytes) };
};

const uploadPhoto = async (
  page: Page,
  fileName: string,
  caption?: string,
): Promise<void> => {
  await test.step(`Upload photo: ${fileName}`, async () => {
    const fileInput = page.locator('input[type="file"][hidden]');
    const testFile = createTestPng(fileName);

    await fileInput.setInputFiles({
      name: testFile.name,
      mimeType: testFile.mimeType,
      buffer: testFile.buffer,
    });

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Upload Photos")).toBeVisible();
    await expect(dialog.getByAltText(fileName)).toBeVisible();

    if (caption) {
      await dialog.getByPlaceholder("Description (optional)").fill(caption);
    }

    await dialog.getByRole("button", { name: /Upload/ }).click();
    await expect(dialog).toBeHidden();
  });
};

test("Helpers Attachments: Upload, gallery, lightbox, and drag-drop zone", async ({
  page,
}) => {
  await navigateToNewTask(page);
  await app.createHelperTask(page, {
    shortDescription: "Test task for attachment e2e",
  });

  await test.step("Verify Photos section and drop zone", async () => {
    await expect(page.getByRole("heading", { name: "Photos" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Photos" }),
    ).toBeVisible();
    await expect(page.getByText("or drag and drop images here")).toBeVisible();
  });

  await uploadPhoto(page, "test-image.jpg", "My test photo");

  await test.step("Verify photo appears in gallery", async () => {
    await expect(page.getByText("Photos (1)")).toBeVisible();
    await expect(page.getByText("My test photo")).toBeVisible();
  });

  await test.step("Open lightbox and verify Swiper", async () => {
    await page.locator("img[alt='My test photo']").first().click();

    const lightbox = page.locator(".swiper");
    await expect(lightbox).toBeVisible();

    await page.getByTestId("CloseIcon").click();
    await expect(lightbox).toBeHidden();
  });
});

test("Helpers Attachments: Upload multiple photos", async ({ page }) => {
  await navigateToNewTask(page);
  await app.createHelperTask(page, {
    shortDescription: "Test task for attachment e2e",
  });

  await uploadPhoto(page, "photo-1.jpg", "First photo");
  await uploadPhoto(page, "photo-2.jpg", "Second photo");

  await test.step("Verify both photos appear in gallery", async () => {
    await expect(page.getByText("Photos (2)")).toBeVisible();
    await expect(page.getByText("First photo")).toBeVisible();
    await expect(page.getByText("Second photo")).toBeVisible();
  });
});

test("Helpers Attachments: Upload and delete photo", async ({ page }) => {
  await navigateToNewTask(page);
  await app.createHelperTask(page, {
    shortDescription: "Test task for attachment e2e",
  });

  await uploadPhoto(page, "to-delete.jpg", "Delete me");

  await test.step("Delete the photo", async () => {
    await expect(page.getByText("Photos (1)")).toBeVisible();
    await page.getByTestId("DeleteIcon").click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Delete photo?")).toBeVisible();

    await dialog.getByRole("button", { name: /Delete Photo/ }).click();
    await expect(dialog).toBeHidden();
  });

  await test.step("Verify photo is removed", async () => {
    await expect(page.getByText("Photos (1)")).toBeHidden();
    await expect(page.getByText("Delete me")).toBeHidden();
  });
});
