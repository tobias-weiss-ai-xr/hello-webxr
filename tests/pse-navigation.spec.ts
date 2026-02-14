import { test, expect } from '@playwright/test';

test.describe('PSE Room Navigation', () => {
  test('lobby loads', async ({ page }) => {
    await page.goto('/?room=0');
    await page.waitForLoadState('networkidle');
    
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

    await page.goto('/?room=H');
    await page.waitForLoadState('networkidle');
    
    // Check room loaded without critical errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('WEBGL_compressed_texture') &&
      !err.includes('Removing intrinsics') &&
      !err.includes('Removing unpermitted')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('gold room loads via URL', async ({ page }) => {
    // Track console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/?room=Au');
    await page.waitForLoadState('networkidle');
    
    // Check room loaded without critical errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('WEBGL_compressed_texture') &&
      !err.includes('Removing intrinsics') &&
      !err.includes('Removing unpermitted')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('camera spawns at origin', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const pos = await page.evaluate(() => {
      const rig = (window as any).context?.cameraRig;
      return rig ? { x: rig.position.x, z: rig.position.z } : null;
    });
    
    expect(pos).not.toBeNull();
    expect(pos!.x).toBe(0);
    expect(pos!.z).toBe(0);
  });
});
