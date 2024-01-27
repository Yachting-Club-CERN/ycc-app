import {Page, expect, test} from '@playwright/test';
import dayjs from 'dayjs';

import {app, ui} from './test-utils';

const createTask = async (page: Page) => {
  expect(page.url()).toMatch(/\/helpers\/tasks\/new$/);

  const now = dayjs();

  await ui.selectOption(page.getByLabel('Category'), 'Maintenance / General');

  await page.getByLabel('Title').fill('Test Task  @ ' + now.format('HH:mm:ss'));
  await page
    .getByLabel('Short Description')
    .fill('Test task @ ' + now.format());

  await ui.selectOption(page.getByLabel('Contact'), 'PHUGHES'); // Next one in the list

  await ui.selectDateTime(
    page,
    page.locator('.ycc-helper-task-deadline-input * input'),
    now.add(3, 'day').format('DD/MM/YYYY HH:mm')
  );

  await page.getByLabel('Max. Helpers').fill('2');

  await page.getByRole('button', {name: 'Submit'}).click();

  await page.waitForURL(/\/helpers\/tasks\/\d+$/);

  const id = parseInt(page.url().split('/').pop()!);
  return id;
};

test('Helpers: Create task and sign up as captain', async ({page}) => {
  await app.loadPage(page, '/helpers', {expectSignIn: true});

  await page.getByRole('link', {name: 'New Task'}).click();
  await page.waitForURL('/helpers/tasks/new');

  const id = await createTask(page);
  await expect(page.locator('main')).not.toContainText('Captain: MHUFF');

  await page.getByRole('button', {name: 'Sign up as Captain'}).click();
  await page.waitForURL(RegExp(`/helpers/tasks/${id}$`));
  await expect(page.locator('main')).toContainText('Captain: MHUFF');
});

test('Helpers: Create task and sign up as helper', async ({browser}) => {
  let context = await browser.newContext();
  let page = await context.newPage();

  await app.loadPage(page, '/helpers', {expectSignIn: true});

  await page.getByRole('link', {name: 'New Task'}).click();
  await page.waitForURL('/helpers/tasks/new');

  const id = await createTask(page);
  await expect(page.locator('main')).not.toContainText('Helpers: MHUFF');

  await page.getByRole('button', {name: 'Sign up as Helper'}).click();
  await page.waitForURL(RegExp(`/helpers/tasks/${id}$`));
  await expect(page.locator('main')).toContainText('Helpers: MHUFF');

  await app.signOut(page);

  context = await browser.newContext();
  page = await context.newPage();

  await app.loadPage(page, `/helpers/tasks/${id}`, {
    expectSignIn: true,
    user: 'TMCDONAL',
  });
  await page.waitForURL(RegExp(`/helpers/tasks/${id}$`));
  await page.getByRole('button', {name: 'Sign up as Helper'}).click();
  await page.waitForURL(RegExp(`/helpers/tasks/${id}$`));
  await expect(page.locator('main')).toContainText('Helpers: MHUFF TMCDONAL');
});
