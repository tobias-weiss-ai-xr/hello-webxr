const { test, expect } = require('@playwright/test');

test('Check URL parameter handling', async ({ page }) => {
  await page.goto('/?room=H');
  await page.waitForTimeout(5000);

  const info = await page.evaluate(() => {
    return {
      urlRoom: new URL(window.location).searchParams.get('room'),
      roomName: window.roomName,
      room: window.context.room,
      hasRoomName: typeof window.roomName !== 'undefined',
      contextHasGoto: typeof window.context.goto !== 'undefined'
    };
  });

  console.log('URL Info:', JSON.stringify(info, null, 2));
  expect(info.urlRoom).toBe('H');
});
