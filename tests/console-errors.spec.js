const { test, expect } = require('@playwright/test');

test('Check console errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/?room=H');
  await page.waitForTimeout(5000);

  console.log('Console Errors:', JSON.stringify(errors, null, 2));

  const finalRoom = await page.evaluate(() => window.context.room);
  console.log('Final Room:', finalRoom);
});
