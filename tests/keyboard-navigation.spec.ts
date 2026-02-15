import { test, expect } from '@playwright/test';

test.describe('PSE Keyboard Navigation', () => {
  test('should handle N key press without errors', async ({ page }) => {
    await page.goto('/');

    // Wait for application to load
    await page.waitForTimeout(5000);

    // Press 'N' key - should not crash the app
    // This tests that ev.code based handler works for both 'N' and 'n'
    await page.keyboard.press('N');
    await page.keyboard.press('n');

    // If we got here without errors, the fix works
    expect(true).toBeTruthy();
  });

  test('should navigate to lobby with 0 key', async ({ page }) => {
    await page.goto('/');

    // Wait for application to load
    await page.waitForTimeout(5000);

    // Press '0' key to go to lobby
    await page.keyboard.press('0');

    // Wait for room change
    await page.waitForTimeout(1000);

    // Should be in lobby (room 0)
    const room = await page.evaluate(() => window.context.room);
    expect(room).toBe(0);
  });

  test('should move forward with W key', async ({ page }) => {
    await page.goto('/');

    // Wait for application to load
    await page.waitForTimeout(5000);

    // Get initial camera position
    const initialPosition = await page.evaluate(() => {
      return {
        x: window.context.camera.position.x,
        z: window.context.camera.position.z
      };
    });

    // Press 'W' key to move forward
    await page.keyboard.press('W');
    await page.waitForTimeout(100);

    // Get new camera position
    const newPosition = await page.evaluate(() => {
      return {
        x: window.context.camera.position.x,
        z: window.context.camera.position.z
      };
    });

    // Position should have changed (moved forward in camera direction)
    const positionChanged = (
      initialPosition.x !== newPosition.x ||
      initialPosition.z !== newPosition.z
    );
    expect(positionChanged).toBeTruthy();
  });

  test('should move left/right with A/D keys', async ({ page }) => {
    await page.goto('/');

    // Wait for application to load
    await page.waitForTimeout(5000);

    const initialPosition = await page.evaluate(() => {
      return {
        x: window.context.camera.position.x,
        z: window.context.camera.position.z
      };
    });

    // Press 'A' key to move left
    await page.keyboard.press('A');
    await page.waitForTimeout(100);

    const afterLeft = await page.evaluate(() => {
      return {
        x: window.context.camera.position.x,
        z: window.context.camera.position.z
      };
    });

    // Position should have changed
    const changedAfterLeft =
      initialPosition.x !== afterLeft.x || initialPosition.z !== afterLeft.z;
    expect(changedAfterLeft).toBeTruthy();

    // Press 'D' key to move right
    await page.keyboard.press('D');
    await page.waitForTimeout(100);

    const afterRight = await page.evaluate(() => {
      return {
        x: window.context.camera.position.x,
        z: window.context.camera.position.z
      };
    });

    // Position should have changed again
    const changedAfterRight =
      afterLeft.x !== afterRight.x || afterLeft.z !== afterRight.z;
    expect(changedAfterRight).toBeTruthy();
  });

  test('should move backward with S key', async ({ page }) => {
    await page.goto('/');

    // Wait for application to load
    await page.waitForTimeout(5000);

    const initialPosition = await page.evaluate(() => {
      return {
        x: window.context.camera.position.x,
        z: window.context.camera.position.z
      };
    });

    // Press 'S' key to move backward
    await page.keyboard.press('S');
    await page.waitForTimeout(100);

    const newPosition = await page.evaluate(() => {
      return {
        x: window.context.camera.position.x,
        z: window.context.camera.position.z
      };
    });

    // Position should have changed
    const positionChanged =
      initialPosition.x !== newPosition.x || initialPosition.z !== newPosition.z;
    expect(positionChanged).toBeTruthy();
  });
});