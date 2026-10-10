import { expect, type Page, test } from '@playwright/test';

// The web app runs against a mock API (mock-api/server.mjs), not the gateway:
// no services are needed, and each test signs up its own seller.

let sellerCount = 0;
const PASSWORD = 'correct horse battery';

/**
 * Fills a form and submits it, retrying until `done` passes: input typed
 * before Vue hydrates the server-rendered form is lost.
 */
async function submitWhenHydrated(
  page: Page,
  fill: () => Promise<void>,
  done: () => Promise<void>,
) {
  await expect(async () => {
    await fill();
    await done();
  }).toPass();
}

async function signUp(page: Page, name = 'Ada Store') {
  const email = `seller${Date.now()}${++sellerCount}@example.com`;
  await page.goto('/register');
  await submitWhenHydrated(
    page,
    async () => {
      await page.getByLabel('Store or seller name').fill(name);
      await page.getByLabel('Email').fill(email);
      await page.getByRole('textbox', { name: /Password/ }).fill(PASSWORD);
      await page.getByRole('button', { name: 'Create account' }).click();
    },
    () => expect(page).toHaveURL('/', { timeout: 2_000 }),
  );
  return email;
}

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

  await submitWhenHydrated(
    page,
    async () => {
      await page.getByLabel('Store or seller name').fill('Ada Store');
      await page.getByLabel('Email').fill('ada@example.com');
      await page.getByRole('textbox', { name: /Password/ }).fill('short');
      await page.getByRole('button', { name: 'Create account' }).click();
    },
    () =>
      expect(page.getByText('Use at least 8 characters')).toBeVisible({
        timeout: 1_000,
      }),
  );
  await expect(page).toHaveURL(/\/register/);
});

test('shows a wrong password inline without leaving the page', async ({
  browser,
}) => {
  const email = await signUp(await browser.newPage());
  const page = await browser.newPage();
  await page.goto('/login');

  await submitWhenHydrated(
    page,
    async () => {
      await page.getByLabel('Email').fill(email);
      await page
        .getByRole('textbox', { name: /Password/ })
        .fill('wrong password');
      await page.getByRole('button', { name: 'Sign in' }).click();
    },
    () =>
      expect(page.getByText('Invalid email or password')).toBeVisible({
        timeout: 2_000,
      }),
  );
  await expect(page).toHaveURL(/\/login/);
});

test('signs up, adds a product, records an order and signs out', async ({
  page,
}) => {
  await signUp(page, "Ada's Closet");
  await expect(
    page.getByRole('heading', { name: /Ada's Closet/ }),
  ).toBeVisible();

  // Add a product
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Products' })
    .click();
  await page.getByRole('button', { name: 'Add product' }).first().click();
  const panel = page.getByRole('dialog');
  await panel.getByLabel('Product name').fill('Canvas tote bag');
  await panel.getByLabel('Price').fill('249');
  await panel.getByLabel('Stock').fill('5');
  await panel.getByRole('button', { name: 'Add product' }).click();
  await expect(
    page.getByRole('table').getByText('Canvas tote bag', { exact: true }),
  ).toBeVisible();

  // Record an order with it
  await page.getByRole('link', { name: 'New order' }).first().click();
  await page.getByText('Add a product').click();
  await page.getByRole('option', { name: /Canvas tote bag/ }).click();
  // The picker keeps focus until its menu has closed.
  await expect(page.getByRole('listbox')).toBeHidden();
  await page.locator('input[name="items.0.quantity"]').fill('2');
  await page.locator('input[name="shippingFee"]').fill('80');
  await expect(page.getByTestId('order-total')).toHaveText('₱578.00');
  await page.getByRole('button', { name: 'Save order' }).click();

  await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}$/);
  await expect(page.getByRole('heading', { name: '₱578.00' })).toBeVisible();
  await page.getByRole('button', { name: 'Mark confirmed' }).click();
  await expect(
    page.getByRole('button', { name: 'Mark shipped' }),
  ).toBeVisible();

  // Sign out
  await page.getByTestId('account-menu').click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login/);
});
