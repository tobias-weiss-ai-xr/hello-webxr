const { test, expect } = require('@playwright/test');

test.describe('Camera Position and Rotation Evidence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.waitForFunction(() => {
      return typeof window.context !== 'undefined' && window.context.cameraRig !== undefined;
    }, { timeout: 10000 });
  });

  test('camera position is (0, 1.6, 6.8) after room entry', async ({ page }) => {
    await page.goto('/?room=H');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const browserConsole = await page.evaluate(() => {
      console.log('=== BROWSER CONSOLE LOG ===');
      console.log('window.context exists:', typeof window.context !== 'undefined');
      console.log('cameraRig exists:', typeof window.context !== 'undefined' && window.context.cameraRig !== undefined);
      if (window.context && window.context.cameraRig) {
        console.log('Camera position:', {
          x: window.context.cameraRig.position.x,
          y: window.context.cameraRig.position.y,
          z: window.context.cameraRig.position.z
        });
        console.log('Camera rotation:', {
          x: window.context.cameraRig.rotation.x,
          y: window.context.cameraRig.rotation.y,
          z: window.context.cameraRig.rotation.z
        });
      }
      return {
        x: window.context.cameraRig.position.x,
        y: window.context.cameraRig.position.y,
        z: window.context.cameraRig.position.z
      };
    });

    console.log('Camera position after H room entry:', JSON.stringify(browserConsole, null, 2));

    expect(browserConsole.x).toBeCloseTo(0, 0.01);
    expect(browserConsole.y).toBeCloseTo(1.6, 0.01);
    expect(browserConsole.z).toBeCloseTo(6.8, 0.01);
  });

  test('camera rotation is (0, 0, 0) after room entry', async ({ page }) => {
    await page.goto('/?room=H');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const cameraRotation = await page.evaluate(() => {
      return {
        x: window.context.cameraRig.rotation.x,
        y: window.context.cameraRig.rotation.y,
        z: window.context.cameraRig.rotation.z
      };
    });

    console.log('Camera rotation after H room entry:', JSON.stringify(cameraRotation, null, 2));

    expect(cameraRotation.x).toBeCloseTo(0, 0.01);
    expect(cameraRotation.y).toBeCloseTo(0, 0.01);
    expect(cameraRotation.z).toBeCloseTo(0, 0.01);
  });

  test('position resets on room transition Lobby → H → C', async ({ page }) => {
    await page.goto('/?room=H');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const firstPosition = await page.evaluate(() => {
      return {
        x: window.context.cameraRig.position.x,
        y: window.context.cameraRig.position.y,
        z: window.context.cameraRig.position.z
      };
    });

    await page.goto('/?room=C');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const secondPosition = await page.evaluate(() => {
      return {
        x: window.context.cameraRig.position.x,
        y: window.context.cameraRig.position.y,
        z: window.context.cameraRig.position.z
      };
    });

    console.log('Position after H room:', JSON.stringify(firstPosition, null, 2));
    console.log('Position after C room:', JSON.stringify(secondPosition, null, 2));

    expect(firstPosition.x).toBeCloseTo(0, 0.01);
    expect(firstPosition.y).toBeCloseTo(1.6, 0.01);
    expect(firstPosition.z).toBeCloseTo(6.8, 0.01);
    expect(secondPosition.x).toBeCloseTo(0, 0.01);
    expect(secondPosition.y).toBeCloseTo(1.6, 0.01);
    expect(secondPosition.z).toBeCloseTo(6.8, 0.01);
  });

  test('position resets when re-entering same room H → Lobby → H', async ({ page }) => {
    await page.goto('/?room=H');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const firstPosition = await page.evaluate(() => {
      return {
        x: window.context.cameraRig.position.x,
        y: window.context.cameraRig.position.y,
        z: window.context.cameraRig.position.z
      };
    });

    await page.goto('/?room=0');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.goto('/?room=H');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const secondPosition = await page.evaluate(() => {
      return {
        x: window.context.cameraRig.position.x,
        y: window.context.cameraRig.position.y,
        z: window.context.cameraRig.position.z
      };
    });

    console.log('Position after first H entry:', JSON.stringify(firstPosition, null, 2));
    console.log('Position after re-entering H:', JSON.stringify(secondPosition, null, 2));

    expect(firstPosition.x).toBeCloseTo(0, 0.01);
    expect(firstPosition.y).toBeCloseTo(1.6, 0.01);
    expect(firstPosition.z).toBeCloseTo(6.8, 0.01);
    expect(secondPosition.x).toBeCloseTo(0, 0.01);
    expect(secondPosition.y).toBeCloseTo(1.6, 0.01);
    expect(secondPosition.z).toBeCloseTo(6.8, 0.01);
  });

  test('multiple rooms (H, C, Fe, Au) all use same spawn point', async ({ page }) => {
    const rooms = ['H', 'C', 'Fe', 'Au'];
    const positions = [];

    for (const room of rooms) {
      await page.goto(`/?room=${room}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const position = await page.evaluate(() => {
        return {
          x: window.context.cameraRig.position.x,
          y: window.context.cameraRig.position.y,
          z: window.context.cameraRig.position.z
        };
      });

      positions.push({ room, position });
      console.log(`Position after ${room} room:`, JSON.stringify(position, null, 2));
    }

    positions.forEach(({ room, position }) => {
      expect(position.x).toBeCloseTo(0, 0.01);
      expect(position.y).toBeCloseTo(1.6, 0.01);
      expect(position.z).toBeCloseTo(6.8, 0.01);
    });
  });

  test('Lobby room also uses correct position', async ({ page }) => {
    await page.goto('/?room=0');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const cameraPosition = await page.evaluate(() => {
      return {
        x: window.context.cameraRig.position.x,
        y: window.context.cameraRig.position.y,
        z: window.context.cameraRig.position.z
      };
    });

    console.log('Camera position in Lobby:', JSON.stringify(cameraPosition, null, 2));

    expect(cameraPosition.x).toBeCloseTo(0, 0.01);
    expect(cameraPosition.y).toBeCloseTo(1.6, 0.01);
    expect(cameraPosition.z).toBeCloseTo(6.8, 0.01);
  });

  test('screenshot shows comfortable viewing distance to atom model', async ({ page }) => {
    await page.goto('/?room=H');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: 'test-results/hydrogen-room-view.png',
      fullPage: true 
    });

    console.log('Screenshot saved to test-results/hydrogen-room-view.png');

    const hasAtomModel = await page.evaluate(() => {
      const scene = window.context.scene;
      let hasAtomModel = false;
      const traverse = (obj) => {
        if (obj.userData && obj.userData.elementSymbol === 'H') {
          hasAtomModel = true;
        }
        if (obj.children) {
          obj.children.forEach(traverse);
        }
      };
      traverse(scene);
      return hasAtomModel;
    });

    expect(hasAtomModel).toBe(true);
  });
});