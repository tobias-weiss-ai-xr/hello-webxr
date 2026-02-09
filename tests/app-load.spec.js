const { test, expect } = require('@playwright/test');

test('App loads correctly', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  console.log('Page loaded');

  const result = await page.evaluate(() => {
    return {
      contextExists: typeof window.context !== 'undefined',
      room: window.context ? window.context.room : 'no context',
      sceneExists: window.context && typeof window.context.scene !== 'undefined',
      worldExists: window.context && typeof window.context.world !== 'undefined'
    };
  });

  console.log('Test result:', JSON.stringify(result, null, 2));

  expect(result.contextExists).toBe(true);
  expect(result.sceneExists).toBe(true);
  expect(result.worldExists).toBe(true);
});
