const { test, expect } = require('@playwright/test');

test('Navigate to Hydrogen and check for errors', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('=== NAVIGATING TO HYDROGEN ===');
  const navResult = await page.evaluate(() => {
    try {
      window.context.GotoRoom(1, 'H');
      return { success: true, room: window.context.room };
    } catch (e) {
      return { success: false, error: e.message, stack: e.stack };
    }
  });
  console.log('Navigation result:', JSON.stringify(navResult, null, 2));

  await page.waitForTimeout(3000);

  console.log('=== CHECKING FINAL STATE ===');
  const finalState = await page.evaluate(() => {
    return {
      room: window.context.room,
      sceneChildren: window.context.scene.children.length
    };
  });
  console.log('Final state:', JSON.stringify(finalState, null, 2));
});
