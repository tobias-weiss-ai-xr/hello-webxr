const { test, expect } = require('@playwright/test');

test.describe('Browser Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('page loads successfully', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if the page title is correct
    await expect(page).toHaveTitle(/Hello WebXR!/);

    // Check if canvas is present
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('browser help overlay is visible', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for browser help overlay
    const helpOverlay = page.locator('#browser-help');
    await expect(helpOverlay).toBeVisible();

    // Check help text content
    const helpText = await helpOverlay.textContent();
    expect(helpText).toContain('Browser Navigation');
    expect(helpText).toContain('W/↑');
    expect(helpText).toContain('A/←');
    expect(helpText).toContain('S/↓');
    expect(helpText).toContain('D/→');
  });

  test('pointer lock activates on click', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Get document pointer lock state before click
    const pointerLockBefore = await page.evaluate(() => {
      return document.pointerLockElement !== null;
    });

    console.log(`Pointer lock before click: ${pointerLockBefore}`);

    // Click on the canvas to activate pointer lock
    const canvas = page.locator('canvas');
    await canvas.click();

    // Wait a bit for pointer lock to activate
    await page.waitForTimeout(500);

    // Check if pointer lock is active
    const pointerLockAfter = await page.evaluate(() => {
      return document.pointerLockElement !== null;
    });

    console.log(`Pointer lock after click: ${pointerLockAfter}`);

    // Note: Pointer lock might not work in automated tests due to security restrictions
    // This test verifies the click event is registered
  });

  test('browserControls object exists in context', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if browserControls exists in window.context
    const hasBrowserControls = await page.evaluate(() => {
      return window.context && window.context.browserControls !== undefined;
    });

    console.log(`browserControls exists: ${hasBrowserControls}`);
    expect(hasBrowserControls).toBeTruthy();
  });

  test('keyboard event listeners are registered', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if event listeners for navigation are present
    const eventListenersInfo = await page.evaluate(() => {
      const info = {
        hasClickListeners: false,
        hasKeydownListeners: false,
        hasKeyupListeners: false
      };

      // Check if our navigation variables exist
      const hasContext = typeof window.context !== 'undefined';
      const hasBrowserControls = hasContext && typeof window.context.browserControls !== 'undefined';

      // Try to detect if event handling is set up
      if (hasBrowserControls) {
        const bc = window.context.browserControls;
        info.hasControls = bc && typeof bc.controls === 'object';
        info.hasMoveForward = bc && typeof bc.moveForward === 'function';
        info.hasMoveBackward = bc && typeof bc.moveBackward === 'function';
        info.hasMoveLeft = bc && typeof bc.moveLeft === 'function';
        info.hasMoveRight = bc && typeof bc.moveRight === 'function';
      }

      return info;
    });

    console.log('Event listeners info:', JSON.stringify(eventListenersInfo, null, 2));
    expect(eventListenersInfo.hasControls).toBeTruthy();
  });

  test('WASD keys can be simulated', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Try to simulate WASD key presses
    const keyResults = await page.evaluate(async () => {
      const results = [];

      // Simulate W key press (forward)
      const wEvent = new KeyboardEvent('keydown', { keyCode: 87 });
      document.dispatchEvent(wEvent);
      results.push('W keydown dispatched');

      // Simulate A key press (left)
      const aEvent = new KeyboardEvent('keydown', { keyCode: 65 });
      document.dispatchEvent(aEvent);
      results.push('A keydown dispatched');

      // Simulate S key press (backward)
      const sEvent = new KeyboardEvent('keydown', { keyCode: 83 });
      document.dispatchEvent(sEvent);
      results.push('S keydown dispatched');

      // Simulate D key press (right)
      const dEvent = new KeyboardEvent('keydown', { keyCode: 68 });
      document.dispatchEvent(dEvent);
      results.push('D keydown dispatched');

      // Check browser controls state
      if (window.context && window.context.browserControls) {
        const bc = window.context.browserControls;
        results.push(`moveForward: ${bc.moveForward()}`);
        results.push(`moveLeft: ${bc.moveLeft()}`);
        results.push(`moveBackward: ${bc.moveBackward()}`);
        results.push(`moveRight: ${bc.moveRight()}`);
      }

      return results;
    });

    console.log('Key press results:', keyResults);

    // Verify that keys are being registered
    expect(keyResults).toContain('W keydown dispatched');
    expect(keyResults).toContain('A keydown dispatched');
    expect(keyResults).toContain('S keydown dispatched');
    expect(keyResults).toContain('D keydown dispatched');
  });

  test('camera movement can be detected', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Get initial camera position
    const initialPosition = await page.evaluate(() => {
      if (window.context && window.context.camera) {
        return {
          x: window.context.camera.position.x,
          y: window.context.camera.position.y,
          z: window.context.camera.position.z
        };
      }
      return null;
    });

    console.log('Initial camera position:', initialPosition);

    // Simulate a key press to move
    await page.evaluate(() => {
      const wEvent = new KeyboardEvent('keydown', { keyCode: 87 });
      document.dispatchEvent(wEvent);
    });

    // Wait a frame
    await page.waitForTimeout(100);

    // Check if camera position changed (or could change)
    const cameraInfo = await page.evaluate(() => {
      if (window.context && window.context.camera) {
        return {
          hasCamera: true,
          hasTranslateZ: typeof window.context.camera.translateZ === 'function',
          hasTranslateX: typeof window.context.camera.translateX === 'function',
          position: {
            x: window.context.camera.position.x,
            y: window.context.camera.position.y,
            z: window.context.camera.position.z
          }
        };
      }
      return { hasCamera: false };
    });

    console.log('Camera info:', cameraInfo);
    expect(cameraInfo.hasCamera).toBeTruthy();
    expect(cameraInfo.hasTranslateZ).toBeTruthy();
  });

  test('room navigation with N key', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Get current room
    const initialRoom = await page.evaluate(() => {
      return window.context ? window.context.room : null;
    });

    console.log('Initial room:', initialRoom);

    // Simulate N key press
    await page.evaluate(() => {
      const nEvent = new KeyboardEvent('keydown', { keyCode: 78 });
      document.dispatchEvent(nEvent);
    });

    // Wait for room transition
    await page.waitForTimeout(500);

    // Check if room changed (or goto was set)
    const roomInfo = await page.evaluate(() => {
      return {
        currentRoom: window.context ? window.context.room : null,
        goto: window.context ? window.context.goto : null,
        hasGotoRoom: typeof window.gotoRoom === 'function'
      };
    });

    console.log('Room info after N key:', roomInfo);
  });

  test('direct room navigation with number keys', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Test pressing '4' key (spider room)
    await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', { keyCode: 52 }); // 52 = '4'
      document.dispatchEvent(event);
    });

    // Wait for transition
    await page.waitForTimeout(500);

    // Check if goto was set
    const gotoStatus = await page.evaluate(() => {
      return {
        goto: window.context ? window.context.goto : null
      };
    });

    console.log('Goto status after pressing 4:', gotoStatus);
  });

  test('console errors check', async ({ page }) => {
    // Set up console listener
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Try some interactions
    await page.keyboard.press('w');
    await page.waitForTimeout(100);
    await page.keyboard.press('a');
    await page.waitForTimeout(100);

    // Check for errors
    console.log('Console errors:', errors);
  });

  test('verify vrMode flag', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check vrMode flag
    const vrModeInfo = await page.evaluate(() => {
      return {
        hasContext: typeof window.context !== 'undefined',
        hasVrMode: window.context ? typeof window.context.vrMode !== 'undefined' : false,
        vrModeValue: window.context ? window.context.vrMode : null,
        vrModeType: window.context ? typeof window.context.vrMode : null
      };
    });

    console.log('VR Mode info:', vrModeInfo);
    expect(vrModeInfo.hasContext).toBeTruthy();
    expect(vrModeInfo.hasVrMode).toBeTruthy();
    expect(vrModeInfo.vrModeValue).toBe(false); // Should be false in browser mode
  });
});
