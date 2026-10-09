import { expect, test } from '@playwright/test';

// Runs against the web app alone (no API), so every visitor is signed out.
// It covers routing, the auth layout and client-side validation.

test('sends signed-out visitors to sign in, keeping where they were going', async ({
  page,
}) => {
  await page.goto('/orders');

  await expect(page).toHaveURL(/\/login\?redirect=(%2F|\/)orders$/);
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible();
});

test('links between sign-in and sign-up', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('link', { name: 'Create an account' }).click();

  await expect(page).toHaveURL(/\/register/);
  await expect(page.getByLabel('Store or seller name')).toBeVisible();
});

test('validates the sign-up form before calling the API', async ({ page }) => {
  await page.goto('/register');

  // Retried: input typed before Vue hydrates the server-rendered form is lost.
  await expect(async () => {
    await page.getByLabel('Store or seller name').fill('Ada Store');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByRole('textbox', { name: /Password/ }).fill('short');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Use at least 8 characters')).toBeVisible({
      timeout: 1_000,
    });
  }).toPass();
  await expect(page).toHaveURL(/\/register/);
});
