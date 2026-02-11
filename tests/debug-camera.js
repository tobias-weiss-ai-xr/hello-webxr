const { test, expect } = require('@playwright/test');

test('debug camera position', async ({ page }) => {
    console.log('=== DEBUG TEST ===');
    await page.goto('/?room=H');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    const debugInfo = await page.evaluate(() => {
      console.log('=== BROWSER DEBUG ===');
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

    console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
});