const { test } = require('@playwright/test');

test('Check World object in Hydrogen room', async ({ page }) => {
  await page.goto('/?room=H');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const result = await page.evaluate(() => {
    if (!window.context || !window.context.world) {
      return { error: 'context or world not available' };
    }

    const world = window.context.world;
    const worldKeys = Object.keys(world);
    const worldValues = {};
    for (const key of worldKeys) {
      try {
        worldValues[key] = typeof world[key];
      } catch(e) {
        worldValues[key] = 'error: ' + e.message;
      }
    }

    // Check entityManager for entities
    const entityManager = world.entityManager || {};
    const hasEntities = 'entities' in entityManager || 'entityRepository' in entityManager;

    return {
      worldExists: !!world,
      worldKeys,
      worldValues,
      hasEntities,
      entityManagerKeys: entityManager ? Object.keys(entityManager) : 'none'
    };
  });

  console.log('Result:', JSON.stringify(result, null, 2));
});
