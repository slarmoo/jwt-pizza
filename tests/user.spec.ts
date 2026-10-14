import { test, expect } from 'playwright-test-coverage';
import { ServerMock } from './mocks';

test('updateUser', async ({ page }) => {
  await ServerMock.register(page);
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill('q@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('qqq');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'q' }).click();

  await expect(page.getByRole('heading', { name: 'Your pizza kitchen' })).toContainText('Your pizza kitchen');
});
