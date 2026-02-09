const { test, expect } = require('@playwright/test');

test.describe('Text Entity Debug', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?room=H');
    await page.waitForFunction(() => {
      const loading = document.getElementById('loading');
      return loading && getComputedStyle(loading).display === 'none';
    }, { timeout: 30000 });
    await page.waitForFunction(() => {
      return typeof window.context !== 'undefined' && window.context.camera !== undefined;
    }, { timeout: 30000 });
    await page.waitForTimeout(2000);
  });

  test('check current room', async ({ page }) => {
    const roomInfo = await page.evaluate(() => {
      return {
        room: window.context.room,
        sceneChildren: window.context.scene.children.length,
        hasElementRoom: typeof window.context.currentElementRoom !== 'undefined'
      };
    });
    console.log('Room Info:', JSON.stringify(roomInfo, null, 2));
    expect(roomInfo.room).toBeGreaterThan(0);
  });

  test('check ECS entities with Text components', async ({ page }) => {
    const textEntities = await page.evaluate(() => {
      const world = window.context.world;
      const entities = [];
      
      world.entities.forEach(entity => {
        if (entity.hasComponent('Text')) {
          entities.push({
            id: entity.id,
            text: entity.getComponent('Text').text,
            hasObject3D: entity.hasComponent('Object3D'),
            hasParentObject3D: entity.hasComponent('ParentObject3D'),
            hasPosition: entity.hasComponent('Position')
          });
        }
      });
      
      return entities;
    });
    console.log('Text Entities:', JSON.stringify(textEntities, null, 2));
  });

  test('check Three.js objects in scene', async ({ page }) => {
    const sceneObjects = await page.evaluate(() => {
      const scene = window.context.scene;
      const objects = [];
      
      scene.traverse((obj) => {
        if (obj.isMesh) {
          objects.push({
            name: obj.name,
            type: obj.type,
            visible: obj.visible,
            hasParent: obj.parent !== null,
            parentName: obj.parent ? obj.parent.name : 'none',
            position: obj.position.toArray(),
            childrenCount: obj.children.length
          });
        }
      });
      
      return { count: objects.length, objects: objects.slice(0, 20) };
    });
    console.log('Scene Objects (first 20):', JSON.stringify(sceneObjects, null, 2));
  });

  test('check systems execution', async ({ page }) => {
    const systemsInfo = await page.evaluate(() => {
      const world = window.context.world;
      return {
        systemCount: Object.keys(world.systems).length,
        systemNames: Object.keys(world.systems)
      };
    });
    console.log('Systems:', JSON.stringify(systemsInfo, null, 2));
  });
});
