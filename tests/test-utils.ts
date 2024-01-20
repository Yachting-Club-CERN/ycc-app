import {Locator, Page} from '@playwright/test';

const ADMIN_USER = 'MHUFF';

/**
 * Loads a web page and performs sign-in if needed.
 *
 * @param args - Playwright Page object.
 * @param path - The path to a specific page (optional).
 */
export const loadPage = async (
  page: Page,
  path = '/',
  {user} = {
    user: ADMIN_USER,
  }
) => {
  await page.goto(path);

  // Sign in if needed
  if (await page.locator('#kc-form-login').first()) {
    console.log('Sign in...');
    await page.fill('#username', user);
    await page.fill('#password', user);
    await page.click('#kc-login');
  }

  // Wait for load to complete
  await page.waitForSelector('.ycc-footer');

  console.log('Page loaded', path);
};

export const openMenuIfMobile = async (page: Page) => {
  const menuIcon = page.getByTestId('MenuIcon');
  if (await menuIcon.isVisible()) {
    await menuIcon.click();
  }
};

export const getFirstVisible = async (locators: Locator[]) => {
  for (const locator of locators) {
    if (await locator.isVisible()) {
      return locator;
    }
  }

  throw new Error('No visible locator found');
};

export const clickFirstVisible = async (locators: Locator[]) => {
  const locator = await getFirstVisible(locators);
  await locator.click();
};
