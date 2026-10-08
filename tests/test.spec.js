// import { test, expect } from '@playwright/test'
import { test, expect } from 'playwright-test-coverage';
import { ServerMock } from './mocks';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('view about and history', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'About' }).click();
  // await expect(page.getByRole('main', { name: 'The secret sauce' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('The secret sauce');
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByRole('heading', { name: 'Mama Rucci, my my' })).toBeVisible();
});

test('login then logout', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await ServerMock.login(page);
  await ServerMock.logout(page);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await expect(page.getByRole('textbox', { name: 'Password' })).toHaveValue('diner');
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await expect(page.getByRole('textbox', { name: 'Password' })).toHaveValue('diner');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});

test('purchase with register', async ({ page }) => { 
  await page.goto('http://localhost:5173/');
  await ServerMock.basicInit(page);
  await ServerMock.order(page);
  await ServerMock.verify(page);

  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('q');
  await page.getByRole('textbox', { name: 'Full name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Email address' }).fill('q@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('qqq');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('link', { name: 'Order' }).click();
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('1');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByText('Pay now', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pay now' }).click();
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.locator('h3')).toContainText('valid');
  await page.getByRole('button', { name: 'Close' }).click();
});

test('admin add franchise', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await ServerMock.login(page, true);
  await ServerMock.addFranchise(page);
  await ServerMock.getFranchises(page);
  await ServerMock.deleteFranchise(page);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.locator('h2')).toContainText('Mama Ricci\'s kitchen');
  await page.getByRole('textbox', { name: 'Filter franchises' }).click();
  await page.getByRole('textbox', { name: 'Filter franchises' }).fill('pocket');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('cell', { name: 'pizzaPocket' })).toBeVisible();
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('pizzaTest');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('f@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.getByRole('textbox', { name: 'Filter franchises' }).click();
  await page.getByRole('textbox', { name: 'Filter franchises' }).fill('test');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('cell', { name: 'pizzaTest' })).toBeVisible();
  await page.getByRole('row', { name: 'pizzaTest pizza franchisee' }).getByRole('button').click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('textbox', { name: 'Filter franchises' }).click();
  await page.getByRole('textbox', { name: 'Filter franchises' }).fill('test');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('main')).toMatchAriaSnapshot(`
    - heading "Franchises" [level=3]
    - table:
      - rowgroup:
        - row "Franchise Franchisee Store Revenue Action":
          - columnheader "Franchise"
          - columnheader "Franchisee"
          - columnheader "Store"
          - columnheader "Revenue"
          - columnheader "Action"
      - rowgroup:
        - row "test Submit « »":
          - cell "test Submit":
            - textbox "Filter franchises": test
            - button "Submit"
          - cell "« »":
            - button "«" [disabled]
            - button "»" [disabled]
    `);
});

test('franchisee create store', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await ServerMock.login(page, false, true);
  await ServerMock.addStore(page);
  await ServerMock.getFranchises(page);
  await ServerMock.deleteStore(page);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
  await page.getByRole('navigation', { name: 'Global' }).getByRole('link', { name: 'Franchise' }).click();
  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByRole('textbox', { name: 'store name' }).click();
  await page.getByRole('textbox', { name: 'store name' }).fill('vineyard');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.getByRole('row', { name: 'vineyard 0 ₿ Close' }).getByRole('button').click();
  await expect(page.getByRole('heading', { name: 'Sorry to see you go' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('row', { name: /vineyard/ })).toHaveCount(0);
});