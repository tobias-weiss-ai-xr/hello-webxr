const { test, expect } = require('@playwright/test');

test('Check browser console logs', async ({ page }) => {
  const logs = [];
  page.on('console', msg => {
    logs.push(msg.text());
  });

  await page.goto('/?room=H');
  await page.waitForTimeout(5000);

  const relevantLogs = logs.filter(log =>
    log.includes('URL Parameter') ||
    log.includes('Element index') ||
    log.includes('Navigating to element') ||
    log.includes('Exp room index') ||
    log.includes('Navigating to exp room')
  );

  console.log('Relevant Console Logs:', JSON.stringify(relevantLogs, null, 2));
});
