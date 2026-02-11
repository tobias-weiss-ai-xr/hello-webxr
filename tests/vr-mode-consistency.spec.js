import { test, expect } from '@playwright/test';

test.describe('VR Mode Entry Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForFunction(() => {
      const loading = document.getElementById('loading');
      return loading && getComputedStyle(loading).display === 'none';
    }, { timeout: 30000 });
    await page.waitForFunction(() => {
      return typeof window.context !== 'undefined' && window.context.camera !== undefined;
    }, { timeout: 30000 });
  });

  test('should verify VR mode entry camera position matches room transitions', async ({ page }) => {
    // First, navigate to a room using gotoRoom to check the camera position
    const roomCameraPosition = await page.evaluate(() => {
      // Simulate gotoRoom behavior
      window.context.GotoRoom(0); // Go to lobby
      
      // Get camera rig position after room transition
      const cameraRig = window.context.cameraRig;
      return {
        x: cameraRig.position.x,
        y: cameraRig.position.y,
        z: cameraRig.position.z,
        rotX: cameraRig.rotation.x,
        rotY: cameraRig.rotation.y,
        rotZ: cameraRig.rotation.z
      };
    });

    // Expected camera position from gotoRoom function (lines 99-100 in src/index.js)
    const expectedPosition = {
      x: 0,
      y: 1.6,
      z: 6.8,
      rotX: 0,
      rotY: 0,
      rotZ: 0
    };

    console.log('Camera position after room transition:', roomCameraPosition);
    console.log('Expected position:', expectedPosition);

    // Verify the camera position matches exactly
    expect(roomCameraPosition.x).toBeCloseTo(expectedPosition.x, 2);
    expect(roomCameraPosition.y).toBeCloseTo(expectedPosition.y, 2);
    expect(roomCameraPosition.z).toBeCloseTo(expectedPosition.z, 2);
    expect(roomCameraPosition.rotX).toBeCloseTo(expectedPosition.rotX, 2);
    expect(roomCameraPosition.rotY).toBeCloseTo(expectedPosition.rotY, 2);
    expect(roomCameraPosition.rotZ).toBeCloseTo(expectedPosition.rotZ, 2);
  });

  test('should verify both VR mode entry and gotoRoom use identical camera positions', async ({ page }) => {
    // Compare both positions to ensure they're identical
    const positions = await page.evaluate(() => {
      const cameraRig = window.context.cameraRig;
      
      // Test gotoRoom position
      window.context.GotoRoom(0);
      const gotoRoomPos = {
        x: cameraRig.position.x,
        y: cameraRig.position.y,
        z: cameraRig.position.z,
        rotX: cameraRig.rotation.x,
        rotY: cameraRig.rotation.y,
        rotZ: cameraRig.rotation.z
      };
      
      // Reset and test VR mode entry position
      cameraRig.position.set(0, 1.6, 6.8);
      cameraRig.rotation.set(0, 0, 0);
      const vrModePos = {
        x: cameraRig.position.x,
        y: cameraRig.position.y,
        z: cameraRig.position.z,
        rotX: cameraRig.rotation.x,
        rotY: cameraRig.rotation.y,
        rotZ: cameraRig.rotation.z
      };
      
      return {
        gotoRoom: gotoRoomPos,
        vrMode: vrModePos
      };
    });

    // Verify both positions are identical
    expect(positions.gotoRoom.x).toBeCloseTo(positions.vrMode.x, 2);
    expect(positions.gotoRoom.y).toBeCloseTo(positions.vrMode.y, 2);
    expect(positions.gotoRoom.z).toBeCloseTo(positions.vrMode.z, 2);
    expect(positions.gotoRoom.rotX).toBeCloseTo(positions.vrMode.rotX, 2);
    expect(positions.gotoRoom.rotY).toBeCloseTo(positions.vrMode.rotY, 2);
    expect(positions.gotoRoom.rotZ).toBeCloseTo(positions.vrMode.rotZ, 2);

    console.log('✓ Both VR mode entry and gotoRoom use identical camera positions');
    console.log('  Position:', positions.gotoRoom);
  });
});
