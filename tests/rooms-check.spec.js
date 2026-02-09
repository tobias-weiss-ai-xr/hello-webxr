const { test, expect } = require('@playwright/test');

test('Check element room registration', async ({ page }) => {
  await page.goto('/?room=H');
  await page.waitForTimeout(5000);

  const roomsInfo = await page.evaluate(() => {
    return {
      roomsLength: window.context.rooms ? window.context.rooms.length : 0,
      room0: window.context.rooms ? typeof window.context.rooms[0] : 'undefined',
      room1: window.context.rooms ? typeof window.context.rooms[1] : 'undefined',
      room2: window.context.rooms ? typeof window.context.rooms[2] : 'undefined',
      room3: window.context.rooms ? typeof window.context.rooms[3] : 'undefined',
      currentRoom: window.context.room
    };
  });

  console.log('Rooms Info:', JSON.stringify(roomsInfo, null, 2));
});
