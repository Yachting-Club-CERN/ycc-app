import {Locator, Page} from '@playwright/test';

const ADMIN_USER = 'MHUFF';

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

  selectDateTime: async (locator: Locator, date: string) => {
    await locator.click();
    await locator.fill(date);
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
    await page.goto(path);
    await page.waitForTimeout(500);
    console.log(page.url());
    // Sign in if needed
    if (page.url().includes('/protocol/openid-connect/auth')) {
      if (!options.expectSignIn) {
        throw new Error('Unexpected sign in');
      }

      console.log('Sign in...');
      const user = options.user || ADMIN_USER;
      await page.fill('#username', user);
      await page.fill('#password', user);
      await page.click('#kc-login');
    } else if (options.expectSignIn) {
      throw new Error('Expected sign in');
    }

    // Wait for load to complete
    await page.waitForSelector('.ycc-footer');

    console.log('Page loaded', path);
  },

  /**
   * Signs out of the app.
   * @param page - Playwright Page object.
   */
  signOut: async (page: Page) => {
    await app.openMenuIfMobile(page);

    await page.getByTestId('LogoutIcon').click();
    expect(page.url()).toContain('/protocol/openid-connect/auth');
  },
};
