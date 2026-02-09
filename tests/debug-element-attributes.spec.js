const { test, expect } = require('@playwright/test');

test.describe('Element Attributes Debug - Full Investigation', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for all console messages
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', error => {
      console.log(`[PAGE ERROR] ${error.message}`);
    });
  });

  test('Navigate to Hydrogen room and check everything', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('=== INITIAL STATE ===');
    const initialState = await page.evaluate(() => {
      return {
        room: window.context.room,
        hasRooms: typeof window.context.rooms !== 'undefined',
        roomsLength: window.context.rooms ? window.context.rooms.length : 0,
        sceneChildren: window.context.scene.children.length,
        worldEntities: window.context.world ? window.context.world.entities.length : 0
      };
    });
    console.log(JSON.stringify(initialState, null, 2));

    console.log('=== NAVIGATING TO HYDROGEN ===');
    // Navigate using gotoRoom function
    const navResult = await page.evaluate(() => {
      try {
        window.context.GotoRoom(1, 'H');
        return { success: true, error: null };
      } catch (e) {
        return { success: false, error: e.message, stack: e.stack };
      }
    });
    console.log('Navigation result:', JSON.stringify(navResult, null, 2));

    await page.waitForTimeout(3000);

    console.log('=== POST-NAVIGATION STATE ===');
    const postNavState = await page.evaluate(() => {
      const world = window.context.world;
      const scene = window.context.scene;

      // Get all text entities
      const textEntities = [];
      world.entities.forEach(entity => {
        if (entity.hasComponent('Text')) {
          const textComp = entity.getComponent('Text');
          const hasObject3D = entity.hasComponent('Object3D');
          const hasParentObject3D = entity.hasComponent('ParentObject3D');
          const hasPosition = entity.hasComponent('Position');

          textEntities.push({
            id: entity.id,
            text: textComp.text,
            fontSize: textComp.fontSize,
            hasObject3D,
            hasParentObject3D,
            hasPosition,
            textCompKeys: Object.keys(textComp)
          });
        }
      });

      // Get scene objects
      const sceneObjects = [];
      scene.traverse((obj) => {
        if (obj.isMesh || obj.isGroup) {
          sceneObjects.push({
            name: obj.name || '(unnamed)',
            type: obj.type,
            visible: obj.visible,
            hasParent: obj.parent !== null,
            parentName: obj.parent ? obj.parent.name : 'none',
            childrenCount: obj.children.length,
            isTextMesh: obj.name === 'textMesh'
          });
        }
      });

      return {
        room: window.context.room,
        currentElementRoom: window.context.currentElementRoom,
        textEntityCount: textEntities.length,
        textEntities: textEntities.slice(0, 5),
        sceneObjectCount: sceneObjects.length,
        sceneObjects: sceneObjects.slice(0, 10)
      };
    });
    console.log(JSON.stringify(postNavState, null, 2));

    console.log('=== CHECKING THREE.JS SCENE ===');
    const sceneInfo = await page.evaluate(() => {
      const scene = window.context.scene;
      const roomScene = window.context.scene.children.find(child =>
        child.userData && (child.userData.atomModel || child.userData.elementData)
      );

      return {
        hasRoomScene: !!roomScene,
        roomSceneName: roomScene ? roomScene.name : 'none',
        roomSceneChildren: roomScene ? roomScene.children.length : 0,
        mainSceneChildren: scene.children.length
      };
    });
    console.log(JSON.stringify(sceneInfo, null, 2));

    console.log('=== FINAL CHECK ===');
    const finalCheck = await page.evaluate(() => {
      return {
        room: window.context.room,
        shouldNotBeZero: window.context.room > 0
      };
    });
    console.log(JSON.stringify(finalCheck, null, 2));
  });

  test('Check spawn/teleport position', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const spawnInfo = await page.evaluate(() => {
      return {
        cameraPosition: {
          x: window.context.camera.position.x,
          y: window.context.camera.position.y,
          z: window.context.camera.position.z
        },
        cameraRigPosition: {
          x: window.context.cameraRig.position.x,
          y: window.context.cameraRig.position.y,
          z: window.context.cameraRig.position.z
        },
        room: window.context.room
      };
    });
    console.log('Spawn position:', JSON.stringify(spawnInfo, null, 2));
  });
});
