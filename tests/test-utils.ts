import {Locator, Page, expect} from '@playwright/test';

const ADMIN_USER = 'MHUFF';

const waitForAuthPage = async (page: Page) => {
  console.log('[test] waitForAuthPage()');
  await page.waitForURL('**/protocol/openid-connect/auth**');
};

const waitForNonAuthPage = async (page: Page) => {
  console.log('[test] waitForNonAuthPage()');
  await page.waitForFunction(
    () => !window.location.href.includes('/openid-connect/')
  );
};

export const ui = {
  getFirstVisible: async (locators: Locator[]) => {
    for (const locator of locators) {
      if (await locator.isVisible()) {
        return locator;
      }
    }

    throw new Error('No visible locator found');
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
    await locator.click();

    const dialog = page.getByRole('dialog');
    const penIcon = dialog.getByTestId('PenIcon');

    if (await penIcon.isVisible()) {
      // On mobile the field is not editable and a dialog pops up when the field is clicked.
      await penIcon.click();
      await dialog.locator('input').fill(date);
      await dialog.getByRole('button', {name: 'OK'}).click();
    } else {
      // On desktop the field is editable and a calendar only pops up when the icon is clicked.
      await locator.fill(date);
    }
  },
};

export const app = {
  /**
   * Opens the menu if the screen is mobile size.
   *
   * @param page - Playwright Page object.
   */
  openMenuIfMobile: async (page: Page) => {
    const menuIcon = page.getByTestId('MenuIcon');
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
    }
  ) => {
    console.log('[test] loadPage()', path, options);

    await page.goto(path);

    if (options.expectSignIn) {
      console.log('[test] Expecting sign in');
      await waitForAuthPage(page);
      const user = options.user || ADMIN_USER;
      console.log('[test] Sign in', user);

      await page.fill('#username', user);
      await page.fill('#password', user);
      await page.click('#kc-login');
    } else {
      console.log('[test] Not expecting sign in');
    }

    await waitForNonAuthPage(page);

    // Wait for load to complete
    await page.waitForSelector('.ycc-footer');

    console.log('[test] Page loaded', path);
  },

  /**
   * Signs out of the app.
   * @param page - Playwright Page object.
   */
  signOut: async (page: Page) => {
    console.log('[test] signOut()');

    const sidebar = (await app.openMenuIfMobile(page))
      ? page.locator('.ycc-sidebar-mobile')
      : page.locator('.ycc-sidebar');

    await sidebar.getByTestId('LogoutIcon').click();
    await waitForAuthPage(page);
    await expect(page.url()).toContain('/protocol/openid-connect/auth');
  },
};
