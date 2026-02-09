const { test, expect } = require('@playwright/test');

test('Check rooms array initialization', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const roomsCheck = await page.evaluate(() => {
    const rooms = [];
    for (let i = 0; i < 25; i++) {
      if (window.context.rooms && window.context.rooms[i]) {
        rooms.push({
          index: i,
          type: typeof window.context.rooms[i]
        });
      }
    }
    return {
      roomsDefined: typeof window.context.rooms !== 'undefined',
      roomsLength: window.context.rooms ? window.context.rooms.length : 0,
      sampleRooms: rooms
    };
  });

  console.log('Rooms Check:', JSON.stringify(roomsCheck, null, 2));
});
