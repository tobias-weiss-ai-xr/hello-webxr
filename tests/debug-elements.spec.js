const { test, expect } = require('@playwright/test');

test.describe('Element Attributes Debug', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => {
      const loading = document.getElementById('loading');
      return loading && getComputedStyle(loading).display === 'none';
    }, { timeout: 30000 });
    await page.waitForFunction(() => {
      return typeof window.context !== 'undefined' && window.context.camera !== undefined;
    }, { timeout: 30000 });
  });

  test('check all HTML elements on page', async ({ page }) => {
    const bodyContent = await page.evaluate(() => {
      const allElements = Array.from(document.body.children);
      return allElements.map(el => ({
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        styles: el.getAttribute('style'),
        display: getComputedStyle(el).display,
        visibility: getComputedStyle(el).visibility,
        opacity: getComputedStyle(el).opacity
      }));
    });
    console.log('HTML Elements:', JSON.stringify(bodyContent, null, 2));
  });

  test('check context object structure', async ({ page }) => {
    const contextInfo = await page.evaluate(() => {
      return Object.keys(window.context).reduce((acc, key) => {
        const value = window.context[key];
        acc[key] = typeof value === 'object' ? 
          (Array.isArray(value) ? `Array[${value.length}]` : 'Object') :
          typeof value;
        return acc;
      }, {});
    });
    console.log('Context object:', JSON.stringify(contextInfo, null, 2));
  });

  test('check Three.js scene objects', async ({ page }) => {
    const sceneInfo = await page.evaluate(() => {
      const scene = window.context.scene;
      const objects = [];
      
      scene.traverse((obj) => {
        if (obj.isMesh || obj.isGroup || obj.isSprite || obj.isText) {
          objects.push({
            type: obj.type,
            name: obj.name || '(unnamed)',
            id: obj.id,
            visible: obj.visible,
            position: obj.position.toArray(),
            userData: obj.userData || {}
          });
        }
      });
      
      return { count: objects.length, objects };
    });
    console.log('Three.js Scene Objects:', JSON.stringify(sceneInfo, null, 2));
  });

  test('check for text elements', async ({ page }) => {
    const textInfo = await page.evaluate(() => {
      const scene = window.context.scene;
      const textObjects = [];
      
      scene.traverse((obj) => {
        if (obj.userData && obj.userData.type === 'text') {
          textObjects.push({
            name: obj.name,
            text: obj.userData.text,
            position: obj.position.toArray(),
            visible: obj.visible
          });
        }
      });
      
      return textObjects;
    });
    console.log('Text Objects:', JSON.stringify(textInfo, null, 2));
  });

  test('check room state', async ({ page }) => {
    const roomInfo = await page.evaluate(() => {
      return {
        currentRoom: window.context.room,
        roomName: window.context.roomName,
        sceneChildren: window.context.scene.children.length
      };
    });
    console.log('Room State:', JSON.stringify(roomInfo, null, 2));
  });

  test('check ECS entities', async ({ page }) => {
    const ecsInfo = await page.evaluate(() => {
      const world = window.context.world;
      const entities = [];
      
      world.entities.forEach(entity => {
        entities.push({
          id: entity.id,
          components: Object.keys(entity._components || {})
        });
      });
      
      return { count: entities.length, entities };
    });
    console.log('ECS Entities:', JSON.stringify(ecsInfo, null, 2));
  });
});
