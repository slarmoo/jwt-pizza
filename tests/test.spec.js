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
  await expect(page.getByRole('main')).toContainText('The secret sauce');
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
});

test('login', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await ServerMock.login(page);

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
});

test('purchase with register', async ({ page }) => { 
  await page.goto('http://localhost:5173/');
  await ServerMock.basicInit(page);
  await ServerMock.order(page);

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
  // await ServerMock.verify(page);
  // await page.getByRole('button', { name: 'Verify' }).click();
  // await expect(page.locator('h3')).toContainText('valid');
  // await page.getByRole('button', { name: 'Close' }).click();
  // await page.getByRole('link', { name: 'Logout' }).click();
  // await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
});
