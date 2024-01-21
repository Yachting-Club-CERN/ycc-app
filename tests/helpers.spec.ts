import {Locator, expect, test} from '@playwright/test';
import dayjs from 'dayjs';

import {loadPage, openMenuIfMobile} from './test-utils';

const mui = {
  selectOption: async (locator: Locator, option: string) => {
    await locator.click();
    await locator.getByText(option).click();
  },
  selectDateTime: async (locator: Locator, date: string) => {
    await locator.click();
    await locator.fill(date);
  },
};

test('Helpers: Create task and sign up as captain', async ({page}) => {
  const now = dayjs();

  await loadPage(page, '/helpers');

  await page.getByRole('link', {name: 'New Task'}).click();

  await page.waitForURL('/helpers/tasks/new');
  await mui.selectOption(page.getByLabel('Category'), 'Maintenance / General');

  await page.getByLabel('Title').fill('Test Task  @ ' + now.format('HH:mm:ss'));
  await page
    .getByLabel('Short Description')
    .fill('Test task @ ' + now.format());

  await mui.selectOption(page.getByLabel('Contact'), 'PHUGHES'); // Next one in the list

  await mui.selectDateTime(
    page.getByLabel('Deadline'),
    now.add(3, 'day').format('DD/MM/YYYY HH:mm')
  );

  await page.getByLabel('Max. Helpers').fill('1');

  await page.getByRole('button', {name: 'Submit'}).click();

  await page.waitForURL(/\/helpers\/tasks\/\d+/);
  const id = parseInt(page.url().split('/').pop()!);
  console.log(id);
});
