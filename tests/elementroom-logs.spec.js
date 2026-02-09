const { test } = require('@playwright/test');

test('Capture ElementRoom console logs', async ({ page }) => {
  const logs = [];
  page.on('console', msg => {
    logs.push({
      type: msg.type(),
      text: msg.text(),
      time: Date.now()
    });
  });

  page.on('pageerror', error => {
    logs.push({
      type: 'pageerror',
      text: error.message,
      stack: error.stack,
      time: Date.now()
    });
  });

  await page.goto('/?room=H');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  const elementRoomLogs = logs.filter(log =>
    log.text.includes('[ElementRoom]') ||
    log.text.includes('setup') ||
    log.text.includes('enter') ||
    log.text.includes('createInfoPanel')
  );

  console.log('ElementRoom Logs:', JSON.stringify(elementRoomLogs, null, 2));
  console.log('Total logs:', logs.length);
});
