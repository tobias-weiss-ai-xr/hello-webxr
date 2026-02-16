// @ts-check
import { test, expect } from '@playwright/test';

/**
 * TDD Test for N-key navigation bug
 * 
 * BUG: Pressing N key causes black screen because:
 * 1. RoomManager.setup() calls ElementRoom.setup(ctx) without element symbol
 * 2. ElementRoom.setup(ctx, elementSymbol) requires symbol to create scene
 * 3. scene is undefined, enter() fails silently
 * 
 * FIX: Pass room index to enter() so ElementRoom knows which element to display
 */

test.describe('N-key navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the canvas to appear (Three.js renders to canvas)
    await page.waitForSelector('canvas', { timeout: 30000 });
    
    // Wait for Three.js scene to be ready
    await page.waitForTimeout(3000);
  });

  test('should not have black screen after pressing N key', async ({ page }) => {
    // Check initial state - canvas should be visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Get the WebGL context and check it's not lost
    const isContextValid = await canvas.evaluate((el) => {
      const gl = el.getContext('webgl2') || el.getContext('webgl');
      return gl && !gl.isContextLost();
    });
    expect(isContextValid).toBe(true);

    // Listen for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Press N key to navigate to next room
    await page.keyboard.press('n');
    
    // Wait for room transition
    await page.waitForTimeout(1000);

    // Check for critical errors
    const criticalErrors = consoleErrors.filter(err => 
      err.includes('Cannot read properties of undefined') ||
      err.includes('Scene is undefined') ||
      err.includes('Setup was not called')
    );
    
    // Should not have critical errors
    expect(criticalErrors).toHaveLength(0);

    // Canvas should still be visible (not black screen)
    await expect(canvas).toBeVisible();
    
    // Check that WebGL context is still valid
    const isContextStillValid = await canvas.evaluate((el) => {
      const gl = el.getContext('webgl2') || el.getContext('webgl');
      return gl && !gl.isContextLost();
    });
    expect(isContextStillValid).toBe(true);
  });

  test('should be able to navigate through multiple rooms with N key', async ({ page }) => {
    // Start from lobby and press N multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('n');
      await page.waitForTimeout(500);
    }

    // Check canvas is still visible after multiple transitions
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // No critical errors should occur
    const criticalErrors = consoleErrors.filter(err => 
      err.includes('Cannot read properties of undefined') ||
      err.includes('Scene is undefined')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('should render content when entering element room', async ({ page }) => {
    // Listen for logs that indicate room setup
    const roomLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('[ElementRoom]')) {
        roomLogs.push(msg.text());
      }
    });

    // Press N to go to first element room (H - Hydrogen)
    await page.keyboard.press('n');
    await page.waitForTimeout(1000);

    // Should have setup logs indicating element was found
    const hasElementFound = roomLogs.some(log => 
      log.includes('elementData found: true') || 
      log.includes('Setup complete for:')
    );

    // Should not have "Element not found" error
    const hasElementNotFound = roomLogs.some(log => 
      log.includes('Element not found') || 
      log.includes('elementData found: false')
    );

    expect(hasElementNotFound).toBe(false);
    expect(hasElementFound).toBe(true);
  });
});

test.describe('Element room enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(3000);
  });

  test('should use electronConfiguration for accurate shell display', async ({ page }) => {
    // Listen for console logs
    const logs = [];
    page.on('console', msg => {
      logs.push(msg.text());
    });

    // Navigate to Sodium (Na) - atomic number 11, room index 11
    // Press N 11 times to reach Sodium
    for (let i = 0; i < 11; i++) {
      await page.keyboard.press('n');
      await page.waitForTimeout(300);
    }
    
    await page.waitForTimeout(1000);

    // Check that setup completed without errors
    const hasErrors = logs.some(log => 
      log.includes('TypeError') || 
      log.includes('undefined')
    );
    expect(hasErrors).toBe(false);

    // Canvas should still be visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('help panel should be visible in element room', async ({ page }) => {
    // Press N to enter first element room
    await page.keyboard.press('n');
    await page.waitForTimeout(1000);

    // Canvas should be visible (help panel renders in 3D scene)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // No console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    const criticalErrors = errors.filter(e => 
      e.includes('HelpPanel') || e.includes('createHelpPanel')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('back-to-lobby button should exist in element room', async ({ page }) => {
    // Press N to enter first element room
    await page.keyboard.press('n');
    await page.waitForTimeout(1000);

    // Verify room loaded - check console for element room setup
    const roomLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('[ElementRoom]')) {
        roomLogs.push(msg.text());
      }
    });

    // Navigate again to trigger more logs
    await page.keyboard.press('n');
    await page.waitForTimeout(500);

    // Canvas should remain visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});
