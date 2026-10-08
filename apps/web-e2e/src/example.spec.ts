import { expect, test } from '@playwright/test';

// Runs against the web app alone (no API), so it covers routing and layout.

test('sends visitors without an active seller to the sellers page', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/sellers\/?$/);
  await expect(page.locator('h1')).toHaveText('Sellers');
});

test('shows the main navigation', async ({ page }) => {
  await page.goto('/sellers');

  const nav = page.getByRole('navigation', { name: 'Main' });
  for (const label of [
    'Dashboard',
    'Orders',
    'Products',
    'Buyers',
    'Sellers',
  ]) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
});
