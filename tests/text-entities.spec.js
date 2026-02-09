const { test, expect } = require('@playwright/test');

test('Check for text entities in Hydrogen room', async ({ page }) => {
  await page.goto('/?room=H');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const result = await page.evaluate(() => {
    if (!window.context || !window.context.world || !window.context.world.entityManager) {
      return {
        error: 'context or world not available',
        totalEntities: 0,
        textEntitiesCount: 0,
        textEntities: []
      };
    }

    const entityManager = window.context.world.entityManager;
    const entities = entityManager._entities || entityManager.entityRepository || [];
    const textEntities = [];
    
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity && entity.hasComponent && entity.hasComponent('Text')) {
        const textComp = entity.getComponent('Text');
        const hasObject3D = entity.hasComponent('Object3D');
        textEntities.push({
          id: entity.id,
          text: textComp.text,
          hasObject3D
        });
      }
    }
    
    return {
      totalEntities: entities.length,
      textEntitiesCount: textEntities.length,
      textEntities: textEntities
    };
  });

  console.log('Result:', JSON.stringify(result, null, 2));
  expect(result.error || result.textEntitiesCount).toBeGreaterThan(0);
});
