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
    await expect(page.getByRole('main').getByText('q', { exact: true })).toContainText('q');
    
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('h3')).toContainText('Edit user');
    await page.getByRole('button', { name: 'Update' }).click();

    await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

    await expect(page.getByRole('heading', { name: 'Your pizza kitchen' })).toContainText('Your pizza kitchen');
    await expect(page.getByRole('main').getByText('q', { exact: true })).toContainText('q');

    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('h3')).toContainText('Edit user');
    await page.getByRole('textbox').first().fill('pizza dinerx');
    await page.getByRole('button', { name: 'Update' }).click();

    await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

    await expect(page.getByRole('main')).toContainText('pizza dinerx');
});
