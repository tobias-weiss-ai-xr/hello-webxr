import { test, expect } from '@playwright/test';

test.describe('Asset Loading', () => {
  test('3D model assets are requested', async ({ page }) => {
    const assetRequests: string[] = [];
    page.on('request', req => {
      const url = req.url();
      if (url.includes('/assets/') && (url.includes('.glb') || url.includes('.basis'))) {
        assetRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForFunction(() => (window as any).context?.renderer, { timeout: 30000 });

    const hasControllerModel = assetRequests.some(r => r.includes('generic_controller'));
    const hasTeleportModel = assetRequests.some(r => r.includes('teleport'));
    expect(hasControllerModel).toBe(true);
    expect(hasTeleportModel).toBe(true);
  });

  test('no 404 errors for asset files', async ({ page }) => {
    const failedAssets: string[] = [];
    page.on('response', res => {
      if (res.url().includes('/assets/') && res.status() === 404) {
        failedAssets.push(res.url());
      }
    });

    await page.goto('/');
    await page.waitForFunction(() => (window as any).context?.renderer, { timeout: 30000 });
    await page.waitForTimeout(2000);

    expect(failedAssets).toHaveLength(0);
  });

  test('no 404 errors for vendor files', async ({ page }) => {
    const failedVendor: string[] = [];
    page.on('response', res => {
      if (res.url().includes('/src/vendor/') && res.status() === 404) {
        failedVendor.push(res.url());
      }
    });

    await page.goto('/');
    await page.waitForFunction(() => (window as any).context?.renderer, { timeout: 30000 });
    await page.waitForTimeout(2000);

    expect(failedVendor).toHaveLength(0);
  });

  test('page title contains PSE', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PSE/);
  });
});
