const { test, expect } = require('@playwright/test');

test.describe('Element Attributes Debug - Fixed', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
  });

  test('Navigate to Hydrogen and check for text entities', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('=== NAVIGATING TO HYDROGEN ===');
    const navResult = await page.evaluate(() => {
      try {
        window.context.GotoRoom(1, 'H');
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    });
    console.log('Navigation result:', navResult);

    await page.waitForTimeout(3000);

    console.log('=== CHECKING STATE ===');
    const state = await page.evaluate(() => {
      const world = window.context.world;
      const scene = window.context.scene;

      // Get text entities - try different methods
      let textEntities = [];
      try {
        const allEntities = world.entities;
        for (let i = 0; i < allEntities.length; i++) {
          const entity = allEntities[i];
          if (entity && typeof entity.hasComponent === 'function' && entity.hasComponent('Text')) {
            textEntities.push({
              id: entity.id,
              text: entity.getComponent('Text').text
            });
          }
        }
      } catch (e) {
        console.log('Error getting entities:', e.message);
      }

      // Get scene objects looking for text
      const textMeshes = [];
      scene.traverse((obj) => {
        if (obj.name === 'textMesh') {
          textMeshes.push({
            name: obj.name,
            visible: obj.visible,
            parent: obj.parent ? obj.parent.name : 'none',
            position: obj.position.toArray()
          });
        }
      });

      return {
        room: window.context.room,
        textEntityCount: textEntities.length,
        textMeshCount: textMeshes.length,
        textMeshes: textMeshes.slice(0, 10),
        sceneChildren: scene.children.length
      };
    });
    console.log(JSON.stringify(state, null, 2));
  });

  test('Take screenshot after navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Navigate to Hydrogen
    await page.evaluate(() => window.context.GotoRoom(1, 'H'));
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/hydrogen-room-screenshot.png', fullPage: true });
    console.log('Screenshot saved');
  });
});
