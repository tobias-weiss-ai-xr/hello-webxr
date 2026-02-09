import { test, expect } from '@playwright/test';

test.describe('Industrial Applications Room', () => {
  test('should load industrial_apps room with furnace and reactor', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=industrial_apps');

    // Wait for scene to initialize
    await page.waitForTimeout(2000);

    const room = await page.evaluate(() => window.context.room);
    expect(room).toBeGreaterThan(118); // Should be in experimental room range

    const sceneObjects = await page.evaluate(() => {
      return window.context.scene.children.map(obj => ({
        name: obj.name,
        position: obj.position,
        geometry: {
          type: obj.geometry?.type
        }
      }));
    });

    // Check for blast furnace cylinder
    const hasFurnace = sceneObjects.some(obj =>
      obj.geometry?.type === 'CylinderGeometry' &&
      obj.position.x === 0 &&
      obj.position.y === 2.5
    );
    expect(hasFurnace).toBeTruthy();

    // Check for multiple pipelines (cylinders)
    const hasPipelines = sceneObjects.filter(obj =>
      obj.geometry?.type === 'CylinderGeometry' &&
      obj.position.y === 1
    );
    expect(hasPipelines.length).toBeGreaterThanOrEqual(4);

    // Check for reactor box
    const hasReactor = sceneObjects.some(obj =>
      obj.geometry?.type === 'BoxGeometry' &&
      obj.position.z === -4
    );
    expect(hasReactor).toBeTruthy();

    console.log('✓ Industrial Applications room loaded successfully');
    console.log(`  - Found ${sceneObjects.length} objects`);
    console.log('  ✓ Blast furnace present');
    console.log(`  ✓ Has ${hasPipelines.length} pipelines`);
    console.log('  ✓ Reactor present');
  });

  test('should have correct theme color for industrial_apps', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=industrial_apps');
    await page.waitForTimeout(2000);

    const bgColor = await page.evaluate(() => {
      const bg = window.context.scene.background;
      return bg ? {r: bg.r, g: bg.g, b: bg.b} : null;
    });

    expect(bgColor).not.toBeNull();
    // Theme color is 0x74B9FF (blue) * 0.1
    expect(bgColor.r).toBeCloseTo(0.1 * 0.45, 1);
    expect(bgColor.g).toBeCloseTo(0.1 * 0.72, 1);
    expect(bgColor.b).toBeCloseTo(0.1 * 1, 1);
  });
});