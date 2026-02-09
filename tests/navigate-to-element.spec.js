const { test, expect } = require('@playwright/test');

test('Navigate to Hydrogen room and check text entities', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const result = await page.evaluate(() => {
    return {
      initialRoom: window.context.room,
      gotoRoomAvailable: typeof window.context.GotoRoom === 'function'
    };
  });

  console.log('Initial state:', JSON.stringify(result, null, 2));

  await page.evaluate(() => {
    window.context.GotoRoom(1, 'H');
  });

  await page.waitForTimeout(3000);

  const roomInfo = await page.evaluate(() => {
    const world = window.context.world;
    const textEntities = [];
    world.entities.forEach(entity => {
      if (entity.hasComponent('Text')) {
        textEntities.push({
          id: entity.id,
          text: entity.getComponent('Text').text
        });
      }
    });
    return {
      room: window.context.room,
      textEntityCount: textEntities.length,
      textEntities: textEntities.slice(0, 10)
    };
  });

  console.log('After navigation:', JSON.stringify(roomInfo, null, 2));
});
