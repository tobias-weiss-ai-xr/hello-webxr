const { test, expect } = require('@playwright/test');

test.describe('Browser Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => {
      const loading = document.getElementById('loading');
      return loading && getComputedStyle(loading).display === 'none';
    }, { timeout: 30000 });
    await page.waitForFunction(() => {
      return typeof window.context !== 'undefined' && window.context.camera !== undefined;
    }, { timeout: 30000 });
  });

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Hello WebXR!/);
    const canvas = page.locator('canvas');
    await expect(canvas).toHaveCount(1);
  });

  test('browser help overlay is visible', async ({ page }) => {
    const helpOverlay = page.locator('#browser-help');
    await expect(helpOverlay).toBeVisible();
    const helpText = await helpOverlay.textContent();
    expect(helpText).toContain('Browser Navigation');
    expect(helpText).toContain('W/↑');
    expect(helpText).toContain('S/↓');
    expect(helpText).toContain('A/←');
    expect(helpText).toContain('D/→');
  });

  test('browserControls object exists in context', async ({ page }) => {
    const hasBrowserControls = await page.evaluate(() => {
      return window.context && window.context.browserControls !== undefined;
    });
    expect(hasBrowserControls).toBeTruthy();
  });

  test('verify vrMode flag', async ({ page }) => {
    const vrModeInfo = await page.evaluate(() => {
      return {
        hasContext: typeof window.context !== 'undefined',
        hasVrMode: window.context ? typeof window.context.vrMode !== 'undefined' : false,
        vrModeValue: window.context ? window.context.vrMode : null
      };
    });
    expect(vrModeInfo.hasContext).toBeTruthy();
    expect(vrModeInfo.hasVrMode).toBeTruthy();
    expect(vrModeInfo.vrModeValue).toBe(false);
  });
});
