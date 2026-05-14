import { test, expect } from '@playwright/test';

test.describe('Asset Loading', () => {
  test('no 404 errors for asset files', async ({ page }) => {
    const failedAssets: string[] = [];
    page.on('response', res => {
      if (res.url().includes('/assets/') && res.status() === 404) {
        failedAssets.push(res.url());
      }
    });

    await page.goto('/');
    await page.waitForFunction(() => (window as any).context?.engine, { timeout: 30000 });
    await page.waitForTimeout(2000);

    expect(failedAssets).toHaveLength(0);
  });

  test('page title contains PSE', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PSE/);
  });
});
