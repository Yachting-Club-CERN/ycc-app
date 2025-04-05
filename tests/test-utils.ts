import { Locator, Page, expect, test } from "@playwright/test";
import dayjs from "dayjs";

import { ADMIN_USER } from "./test-constants";

const waitForAuthPage = async (page: Page) => {
  console.info("[test] waitForAuthPage()");
  await page.waitForURL("**/protocol/openid-connect/auth**");
};

const waitForNonAuthPage = async (page: Page) => {
  console.info("[test] waitForNonAuthPage()");
  await page.waitForFunction(
    () => !window.location.href.includes("/openid-connect/"),
  );
};

export const expectSameElements = (actual: string[], expected: string[]) => {
  expect([...actual].sort((a, b) => a.localeCompare(b))).toEqual(
    [...expected].sort((a, b) => a.localeCompare(b)),
  );
};

export const ui = {
  getFirstVisible: async (locators: Locator[]) => {
    for (const locator of locators) {
      if (await locator.isVisible()) {
        return locator;
      }
    }

    throw new Error("No visible locator found");
  },

  clickFirstVisible: async (locators: Locator[]) => {
    const locator = await ui.getFirstVisible(locators);
    await locator.click();
  },

  selectOption: async (locator: Locator, option: string) => {
    await locator.click();
    await locator.getByText(option).click();
  },

  selectDateTime: async (page: Page, locator: Locator, date: string) => {
    // Date format: DD/MM/YYYY HH:MM
    await locator.click();

    const dialog = page.getByRole("dialog");
    const nextMonthIcon = dialog.getByTestId("ArrowRightIcon");

    if (await nextMonthIcon.isVisible()) {
      // On mobile the field is not editable and a dialog pops up when the field is clicked.

      // Select month
      const year = parseInt(date.substring(6, 10));
      const month = parseInt(date.substring(3, 5));

      // Only future dates, good enough
      const click = 12 * (year - dayjs().year()) + (month - dayjs().month());
      for (let i = 0; i < click; i++) {
        console.info("[test] Clicking next month", month);
        await nextMonthIcon.click();
      }

      // Select day
      const dayStr = parseInt(date.substring(0, 2)).toString(); // Strip leading '0'
      await dialog
        .getByRole("gridcell", { name: dayStr, exact: true })
        .last()
        .click();

      // Select hour
      const hour = parseInt(date.substring(11, 13));
      const hourStr = hour === 0 ? "00" : hour.toString();
      await dialog
        .getByRole("option", { name: `${hourStr} hours`, exact: true })
        .tap({ force: true });

      // Select minute
      const minute = parseInt(date.substring(14, 16));
      const closest5Minute = (Math.round(minute / 5) * 5) % 60; // Round to 5, good enough
      const closest5MinuteStr =
        closest5Minute < 10 ? `0${closest5Minute}` : closest5Minute.toString();

      await dialog
        .getByRole("option", {
          name: `${closest5MinuteStr} minutes`,
          exact: true,
        })
        .tap({ force: true });

      // Select OK
      await dialog.getByRole("button", { name: "OK" }).click();
    } else {
      // On desktop the field is editable and the dialog only pops up when the calendar icon is clicked.
      await locator.fill(date);
    }
  },
} as const;

export const app = {
  /**
   * Opens the menu if the screen is mobile size.
   *
   * @param page - Playwright Page object.
   */
  openMenuIfMobile: async (page: Page) => {
    const menuIcon = page.getByTestId("MenuIcon");
    if (await menuIcon.isVisible()) {
      await menuIcon.click();
      return true;
    } else {
      return false;
    }
  },

  /** Loads a web page and performs sign-in if needed.
   *
   * @param page - Playwright Page object.
   * @param path - The path to a specific page (optional).
   * @param options - Options: expectSignIn (boolean), user (default: an admin user).
   */
  loadPage: async (
    page: Page,
    path: string,
    options: {
      expectSignIn: boolean;
      user?: string;
    },
  ) =>
    await test.step(`Load page: ${path} (expectSignIn: ${options.expectSignIn})`, async () => {
      console.info("[test] loadPage()", path, options);

      await page.goto(path);

      if (options.expectSignIn) {
        console.info("[test] Expecting sign in");
        await waitForAuthPage(page);
        const user = options.user ?? ADMIN_USER;
        console.info("[test] Sign in", user);

        await page.fill("#username", user);
        await page.fill("#password", user);
        await page.click("#kc-login");
      } else {
        console.info("[test] Not expecting sign in");
      }

      await waitForNonAuthPage(page);

      // Wait for load to complete
      await page.waitForSelector("#ycc-page-end", { state: "attached" });

      console.info("[test] Page loaded", path);
    }),

  /**
   * Signs out of the app.
   * @param page - Playwright Page object.
   */
  signOut: async (page: Page) =>
    await test.step("Sign out", async () => {
      console.info("[test] signOut()");

      const sidebar = (await app.openMenuIfMobile(page))
        ? page.locator(".ycc-sidebar-mobile")
        : page.locator(".ycc-sidebar");

      await sidebar.getByTestId("LogoutIcon").click();
      await waitForAuthPage(page);
      expect(page.url()).toContain("/protocol/openid-connect/auth");
    }),
} as const;
