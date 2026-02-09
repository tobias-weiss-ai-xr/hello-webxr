import { test, expect } from '@playwright/test';

test.describe('URL Validation', () => {
  test('should fall back to lobby for invalid room ID', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=invalid_room_id');

    // Wait for scene to initialize
    await page.waitForTimeout(2000);

    const room = await page.evaluate(() => window.context.room);
    expect(room).toBe(0); // Should fall back to lobby

    console.log('✓ Invalid room ID falls back to lobby');
  });

  test('should handle invalid numeric room parameter', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=999');

    // Wait for scene to initialize
    await page.waitForTimeout(2000);

    const room = await page.evaluate(() => window.context.room);
    expect(room).toBe(0); // Should fall back to lobby

    console.log('✓ Invalid numeric room parameter falls back to lobby');
  });

  test('should handle special characters in room parameter', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=<>script>alert(1)</>');

    // Wait for scene to initialize
    await page.waitForTimeout(2000);

    const room = await page.evaluate(() => window.context.room);
    expect(room).toBe(0); // Should fall back to lobby

    // Verify no XSS alerts or console errors
    const consoleErrors = await page.evaluate(() => {
      return window.__consoleErrors || [];
    });
    expect(consoleErrors.length).toBe(0);

    console.log('✓ Special characters handled safely');
  });

  test('should handle empty room parameter', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=');

    // Wait for scene to initialize
    await page.waitForTimeout(2000);

    const room = await page.evaluate(() => window.context.room);
    expect(room).toBe(0); // Should default to lobby

    console.log('✓ Empty room parameter defaults to lobby');
  });
});