import { test, expect } from '@playwright/test';

const NON_CRITICAL_ERRORS = [
  'WEBGL_compressed_texture',
  'Removing intrinsics',
  'Removing unpermitted',
  'getExtension',
  'GL_INVALID',
  'DepthTest',
  'Content Security Policy',
  'google-analytics',
  'SSL certificate error',
  'Refused to connect',
];

function filterCriticalErrors(errors: string[]): string[] {
  return errors.filter(err => !NON_CRITICAL_ERRORS.some(pattern => err.includes(pattern)));
}

test.describe('Application Loading', () => {
  test('loading screen disappears after assets load', async ({ page }) => {
    await page.goto('/');

    // Loading may already be hidden by the time we check (headless is fast).
    // Wait for the app to fully initialize instead.
    await page.waitForFunction(
      () => (window as any).context?.engine && (window as any).context?.room !== undefined,
      { timeout: 30000 }
    );

    const loading = page.locator('#loading');
    await expect(loading).toHaveCSS('display', 'none', { timeout: 5000 });
  });

  test('canvas appears after loading completes', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });
  });

  test('window.context is initialized after loading', async ({ page }) => {
    await page.goto('/');

    await page.waitForFunction(() => {
      const ctx = (window as any).context;
      return ctx && ctx.engine && ctx.scene && ctx.camera && ctx.room !== undefined;
    }, { timeout: 30000 });

    const context = await page.evaluate(() => {
      const ctx = (window as any).context;
      return {
        hasEngine: !!ctx.engine,
        hasScene: !!ctx.scene,
        hasCamera: !!ctx.camera,
        room: ctx.room,
      };
    });

    expect(context.hasEngine).toBe(true);
    expect(context.hasScene).toBe(true);
    expect(context.hasCamera).toBe(true);
    expect(context.room).toBe(0);
  });

  test('no critical errors during loading', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForFunction(() => (window as any).context?.engine, { timeout: 30000 });
    await page.waitForTimeout(2000);

    const critical = filterCriticalErrors(errors);
    expect(critical).toHaveLength(0);
  });

  test('WebGL context is valid after loading', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });

    const isValid = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return gl ? !gl.isContextLost() : false;
    });

    expect(isValid).toBe(true);
  });
});
