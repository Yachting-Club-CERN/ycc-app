import { expect, Page, test } from "@playwright/test";
import dayjs from "dayjs";

import { TEST_USERS } from "./test-constants";
import { app, ui } from "./test-utils";

/**
 * Creates a minimal test task and returns its ID.
 * Navigates to the task detail page after creation.
 */
const createTask = async (page: Page): Promise<number> =>
  await test.step("Create task", async () => {
    await app.loadPage(page, "/helpers", { expectSignIn: true });
    await page.getByRole("link", { name: "New Task" }).click();
    await page.waitForURL("/helpers/tasks/new");

    const now = dayjs();
    const title = `Attachment Test @ ${now.format("HH:mm:ss")}`;
    const deadline = now.add(3, "day").format("DD/MM/YYYY HH:mm");

    await ui.selectOption(page.getByLabel("Category"), "Maintenance / General");
    await page.getByLabel("Title").fill(title);
    await page
      .getByLabel("Short Description")
      .fill("Test task for attachment e2e");

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

/**
 * Creates a minimal valid PNG buffer for upload testing.
 * Uses a pre-encoded 1x1 red pixel PNG as a Uint8Array.
 */
const createTestPng = (
  name: string,
): { name: string; mimeType: string; buffer: Uint8Array } => {
  // Minimal valid 1x1 red pixel PNG
  const hex =
    "89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de" +
    "0000000c49444154789c63f8cfc0000003010100c9fe92ef0000000049454e44ae426082";
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16);
  }
  return { name, mimeType: "image/png", buffer: bytes };
};

/**
 * Uploads a file via the Add Photos button and upload dialog.
 */
const uploadPhoto = async (
  page: Page,
  fileName: string,
  caption?: string,
): Promise<void> => {
  await test.step(`Upload photo: ${fileName}`, async () => {
    const fileInput = page.locator('input[type="file"]');
    const testFile = createTestPng(fileName);

    await fileInput.setInputFiles({
      name: testFile.name,
      mimeType: testFile.mimeType,
      buffer: testFile.buffer,
    });

    // Upload dialog should appear
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Upload Photos")).toBeVisible();

    // Verify file preview is shown (filename is the alt text on the preview image)
    await expect(dialog.getByAltText(fileName)).toBeVisible();

    // Fill caption if provided
    if (caption) {
      await dialog.getByPlaceholder("Description (optional)").fill(caption);
    }

    // Click Upload button — dialog auto-closes on success
    await dialog.getByRole("button", { name: /Upload/ }).click();
    await expect(dialog).toBeHidden();
  });
};

test("Helpers Attachments: Upload photo and view in gallery", async ({
  page,
}) => {
  await createTask(page);

  await test.step("Verify Photos section exists", async () => {
    await expect(page.getByRole("heading", { name: "Photos" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Photos" }),
    ).toBeVisible();
  });

  await uploadPhoto(page, "test-image.jpg", "My test photo");

  await test.step("Verify photo appears in gallery", async () => {
    // Photo count should update
    await expect(page.getByText("Photos (1)")).toBeVisible();

    // Caption should be visible (prefix stripped)
    await expect(page.getByText("My test photo")).toBeVisible();
  });

  await test.step("Open lightbox and verify Swiper", async () => {
    // Click the thumbnail to open lightbox
    await page.locator("img[alt='My test photo']").first().click();

    // Fullscreen dialog should open with swiper
    const lightbox = page.locator(".swiper");
    await expect(lightbox).toBeVisible();

    // Close the lightbox
    await page.getByTestId("CloseIcon").click();
    await expect(lightbox).toBeHidden();
  });
});

test("Helpers Attachments: Upload multiple photos", async ({ page }) => {
  await createTask(page);

  await uploadPhoto(page, "photo-1.jpg", "First photo");
  await uploadPhoto(page, "photo-2.jpg", "Second photo");

  await test.step("Verify both photos appear in gallery", async () => {
    await expect(page.getByText("Photos (2)")).toBeVisible();
    await expect(page.getByText("First photo")).toBeVisible();
    await expect(page.getByText("Second photo")).toBeVisible();
  });
});

test("Helpers Attachments: Delete photo", async ({ page }) => {
  await createTask(page);

  await uploadPhoto(page, "to-delete.jpg", "Delete me");

  await test.step("Verify photo exists", async () => {
    await expect(page.getByText("Photos (1)")).toBeVisible();
    await expect(page.getByText("Delete me")).toBeVisible();
  });

  await test.step("Delete the photo", async () => {
    // Click the delete button on the thumbnail
    await page.getByTestId("DeleteIcon").click();

    // Confirmation dialog should appear
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Delete photo?")).toBeVisible();

    // Confirm deletion
    await dialog.getByRole("button", { name: "Delete" }).click();
    await expect(dialog).toBeHidden();
  });

  await test.step("Verify photo is removed", async () => {
    // Count should reset (no count shown when 0)
    await expect(page.getByText("Photos (1)")).toBeHidden();
    await expect(page.getByText("Delete me")).toBeHidden();
  });
});

test("Helpers Attachments: Upload with drag-and-drop zone visible", async ({
  page,
}) => {
  await createTask(page);

  await test.step("Verify drag-and-drop zone is present", async () => {
    await expect(page.getByText("or drag and drop images here")).toBeVisible();
  });
});
