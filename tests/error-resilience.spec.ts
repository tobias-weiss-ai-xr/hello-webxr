import { test, expect } from '@playwright/test';

test.describe('Error Resilience', () => {
  test('console errors are logged for failed assets', async ({ page }) => {
    await page.route('**/assets/generic_controller.glb', route => route.abort());

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForFunction(() => (window as any).context?.renderer, { timeout: 30000 });

    expect(errors.some(err => err.includes('Error loading asset'))).toBe(true);
  });

  test('app still initializes with partial asset failures', async ({ page }) => {
    await page.route('**/assets/beamfx.png', route => route.abort());

    await page.goto('/');
    await page.waitForFunction(() => (window as any).context?.renderer, { timeout: 30000 });

    const context = await page.evaluate(() => {
      const ctx = (window as any).context;
      return { hasRenderer: !!ctx?.renderer, hasScene: !!ctx?.scene };
    });
    expect(context.hasRenderer).toBe(true);
    expect(context.hasScene).toBe(true);
  });
});
