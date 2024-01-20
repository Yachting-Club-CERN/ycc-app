import {Page, expect, test} from '@playwright/test';

import {clickFirstVisible, loadPage, openMenuIfMobile} from './test-utils';

const verifyProfilePage = async (page: Page) => {
  const table = page.locator('.ycc-profile-table');
  await table.waitFor({state: 'visible'});

  const tableText = await table.textContent();
  expect(tableText).toContain('Username');
  expect(tableText).toContain('MHUFF');
  expect(tableText).toContain('Email');
  expect(tableText).toContain('Michele.Huff@mailinator.com');
  expect(tableText).toContain('Groups');
  expect(tableText).toContain('ycc-members-all-past-and-present');
  expect(tableText).toContain('Roles');
  expect(tableText).toContain('ycc-helpers-app-admin');
  expect(tableText).toContain('ycc-member-active');
};

test('Profile: Page shows when navigating', async ({page}) => {
  await loadPage(page);

  await openMenuIfMobile(page);
  await clickFirstVisible(await page.getByTestId('AccountCircleIcon').all());

  await verifyProfilePage(page);
});

test('Profile: Page shows when loading directly', async ({page}) => {
  await loadPage(page, '/profile');

  await verifyProfilePage(page);
});
