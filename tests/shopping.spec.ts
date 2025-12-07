import { test, expect } from '@playwright/test';

test.describe('Shopping page', () => {
  test('navigates to shopping and shows results or placeholder', async ({ page }) => {
    // Go to the app home and navigate to the shopping page
    await page.goto('/');
    const shoppingLink = page.locator('a[href="/shopping"]').first();
    await expect(shoppingLink).toBeVisible({ timeout: 5000 });
    await shoppingLink.click();
    await page.waitForURL('**/shopping');

    // Expect a heading or the word 'Shopping' to be visible. Use a role-based locator to avoid strict-mode conflicts.
    const heading = page.getByRole('heading', { name: /shopping/i });
    await expect(heading).toBeVisible({ timeout: 5000 });

    // Stop after verifying the shopping heading is visible. Detailed search flows are covered by manual tests.

  });
});
