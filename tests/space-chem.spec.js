import { test, expect } from '@playwright/test';

test.describe('Space Chemistry Room', () => {
  test('should load space_chem room with star field and nebula', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=space_chem');

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

    // Check for star field points
    const hasStars = sceneObjects.some(obj =>
      obj.name === 'starField' &&
      obj.geometry?.type === 'BufferGeometry'
    );
    expect(hasStars).toBeTruthy();

    // Check for nebula sphere
    const hasNebula = sceneObjects.some(obj =>
      obj.geometry?.type === 'SphereGeometry' &&
      obj.position.z === -10
    );
    expect(hasNebula).toBeTruthy();

    // Check for orbiting fragments (icosahedrons)
    const hasFragments = sceneObjects.filter(obj =>
      obj.name === 'fragment' &&
      obj.geometry?.type === 'IcosahedronGeometry'
    );
    expect(hasFragments.length).toBeGreaterThanOrEqual(5);

    console.log('✓ Space Chemistry room loaded successfully');
    console.log(`  - Found ${sceneObjects.length} objects`);
    console.log('  ✓ Star field present');
    console.log('  ✓ Nebula present');
    console.log(`  ✓ Has ${hasFragments.length} orbiting fragments`);
  });

  test('should have correct theme color for space_chem', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=space_chem');
    await page.waitForTimeout(2000);

    const bgColor = await page.evaluate(() => {
      const bg = window.context.scene.background;
      return bg ? {r: bg.r, g: bg.g, b: bg.b} : null;
    });

    expect(bgColor).not.toBeNull();
    // Theme color is 0x0A0A1A (very dark blue) * 0.1
    expect(bgColor.r).toBeCloseTo(0.1 * 0.04, 1);
    expect(bgColor.g).toBeCloseTo(0.1 * 0.04, 1);
    expect(bgColor.b).toBeCloseTo(0.1 * 0.1, 1);
  });

  test('should animate orbiting fragments', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=space_chem');
    await page.waitForTimeout(2000);

    const initialPositions = await page.evaluate(() => {
      return window.context.scene.children
        .filter(obj => obj.name === 'fragment')
        .map(obj => ({x: obj.position.x, z: obj.position.z}));
    });

    await page.waitForTimeout(500);

    const finalPositions = await page.evaluate(() => {
      return window.context.scene.children
        .filter(obj => obj.name === 'fragment')
        .map(obj => ({x: obj.position.x, z: obj.position.z}));
    });

    let positionChanged = false;
    for (let i = 0; i < initialPositions.length; i++) {
      const dx = initialPositions[i].x - finalPositions[i].x;
      const dz = initialPositions[i].z - finalPositions[i].z;
      if (Math.abs(dx) > 0.1 || Math.abs(dz) > 0.1) {
        positionChanged = true;
        break;
      }
    }

    expect(positionChanged).toBeTruthy();
    console.log('✓ Fragments are orbiting');
  });
});