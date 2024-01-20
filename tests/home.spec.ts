import {expect, test} from '@playwright/test';

import {loadPage} from './test-utils';

test('Home: Page shows', async ({page}) => {
  await loadPage(page);

  await expect(page).toHaveTitle('YCC App');
  await expect(page.locator('main')).toContainText(
    'Welcome to the new & fancy YCC App!'
  );
});
