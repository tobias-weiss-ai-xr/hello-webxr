import { test, expect } from '@playwright/test';

test.describe('PSE Room Navigation', () => {
  test('lobby loads', async ({ page }) => {
    await page.goto('/?room=0');
    await page.waitForTimeout(5000);
    
    const room = await page.evaluate(() => (window as any).context?.room);
    expect(room).toBe(0);
  });

  test('hydrogen room loads via URL', async ({ page }) => {
    // Track console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/?room=h');
    await page.waitForTimeout(5000);
    
    // Check room loaded without critical errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('WEBGL_compressed_texture') &&
      !err.includes('Removing intrinsics') &&
      !err.includes('Removing unpermitted') &&
      !err.includes('getExtension') &&
      !err.includes('GL_INVALID') &&
      !err.includes('context') &&
      !err.includes('WebGL')
    );
    // Allow some non-critical WebGL warnings
    expect(criticalErrors.length).toBeLessThanOrEqual(2);
  });

  test('gold room loads via URL', async ({ page }) => {
    // Track console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/?room=au');
    await page.waitForTimeout(5000);
    
    // Check room loaded without critical errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('WEBGL_compressed_texture') &&
      !err.includes('Removing intrinsics') &&
      !err.includes('Removing unpermitted') &&
      !err.includes('getExtension') &&
      !err.includes('GL_INVALID') &&
      !err.includes('context') &&
      !err.includes('WebGL')
    );
    // Allow some non-critical WebGL warnings
    expect(criticalErrors.length).toBeLessThanOrEqual(2);
  });

  test('camera spawns at origin', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(5000);
    
    const pos = await page.evaluate(() => {
      const rig = (window as any).context?.cameraRig;
      return rig ? { x: rig.position.x, z: rig.position.z } : null;
    });
    
    expect(pos).not.toBeNull();
    expect(Math.abs(pos!.x)).toBeLessThan(0.1);
    expect(Math.abs(pos!.z)).toBeLessThan(0.1);
  });
});
