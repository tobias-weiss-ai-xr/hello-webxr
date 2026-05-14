import { test, expect } from '@playwright/test';

test.describe('Error Resilience', () => {
  test('app initializes even with asset loading issues', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => (window as any).context?.engine, { timeout: 30000 });

    const context = await page.evaluate(() => {
      const ctx = (window as any).context;
      return { hasEngine: !!ctx?.engine, hasScene: !!ctx?.scene };
    });
    expect(context.hasEngine).toBe(true);
    expect(context.hasScene).toBe(true);
  });
});
