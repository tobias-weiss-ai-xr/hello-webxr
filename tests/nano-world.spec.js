import { test, expect } from '@playwright/test';

test.describe('Nano World Room', () => {
  test('should load nano_world room with crystal lattice and orbitals', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=nano_world');

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

    // Check for nano lattice (Group with spheres and cylinders)
    const hasLattice = sceneObjects.some(obj => obj.name === 'nanoLattice');
    expect(hasLattice).toBeTruthy();

    // Check for multiple atoms (spheres) and bonds (cylinders) in lattice
    const spheres = sceneObjects.filter(obj => obj.geometry?.type === 'SphereGeometry');
    const cylinders = sceneObjects.filter(obj => obj.geometry?.type === 'CylinderGeometry');

    expect(spheres.length).toBeGreaterThanOrEqual(27); // 3x3x3 lattice atoms
    expect(cylinders.length).toBeGreaterThanOrEqual(27); // Lattice bonds

    // Check for orbital rings (tori)
    const tori = sceneObjects.filter(obj => obj.geometry?.type === 'TorusGeometry');
    expect(tori.length).toBeGreaterThanOrEqual(3); // 3 orbital rings

    console.log('✓ Nano World room loaded successfully');
    console.log(`  - Found ${sceneObjects.length} objects`);
    console.log(`  - Has ${spheres.length} atoms`);
    console.log(`  - Has ${cylinders.length} bonds`);
    console.log(`  - Has ${tori.length} orbital rings`);
  });

  test('should have correct theme color for nano_world', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=nano_world');
    await page.waitForTimeout(2000);

    const bgColor = await page.evaluate(() => {
      const bg = window.context.scene.background;
      return bg ? {r: bg.r, g: bg.g, b: bg.b} : null;
    });

    expect(bgColor).not.toBeNull();
    // Theme color is 0x17A2B8 (teal) * 0.1
    expect(bgColor.r).toBeCloseTo(0.1 * 0.09, 1);
    expect(bgColor.g).toBeCloseTo(0.1 * 0.63, 1);
    expect(bgColor.b).toBeCloseTo(0.1 * 0.72, 1);
  });

  test('should animate rotating lattice', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=nano_world');
    await page.waitForTimeout(2000);

    const latticeData = await page.evaluate(() => {
      const lattice = window.context.scene.children.find(obj => obj.name === 'nanoLattice');
      if (!lattice) return null;
      return {
        x: lattice.rotation.x,
        y: lattice.rotation.y,
        z: lattice.rotation.z
      };
    });

    expect(latticeData).not.toBeNull();
    expect(latticeData.y).toBe(0); // Should start at 0

    await page.waitForTimeout(500);

    const latticeDataAfter = await page.evaluate(() => {
      const lattice = window.context.scene.children.find(obj => obj.name === 'nanoLattice');
      if (!lattice) return null;
      return {
        x: lattice.rotation.x,
        y: lattice.rotation.y,
        z: lattice.rotation.z
      };
    });

    expect(latticeDataAfter).not.toBeNull();
    expect(latticeDataAfter.y).toBeGreaterThan(0); // Should have rotated
    console.log('✓ Lattice is rotating');
  });
});