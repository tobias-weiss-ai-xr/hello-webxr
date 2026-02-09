import { test, expect } from '@playwright/test';

test.describe('Extreme Conditions Room', () => {
  test('should load extreme_conditions room with pressure chamber', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=extreme_conditions');

    // Wait for scene to initialize
    await page.waitForTimeout(2000);

    const room = await page.evaluate(() => window.context.room);
    expect(room).toBeGreaterThan(118); // Should be in experimental room range

    const sceneObjects = await page.evaluate(() => {
      return window.context.scene.children.map(obj => ({
        name: obj.name,
        position: obj.position,
        userData: obj.userData
      }));
    });

    // Check for pressure chamber
    const hasPressureChamber = sceneObjects.some(obj => obj.name === 'pressureChamber');
    expect(hasPressureChamber).toBeTruthy();

    // Check for plasma sphere
    const hasPlasma = sceneObjects.some(obj => obj.name === 'plasma');
    expect(hasPlasma).toBeTruthy();

    // Check for superfluid helium torus
    const hasSuperfluidHe = sceneObjects.some(obj => obj.name === 'superfluidHe');
    expect(hasSuperfluidHe).toBeTruthy();

    console.log('✓ Extreme Conditions room loaded successfully');
    console.log(`  - Found ${sceneObjects.length} objects`);
    console.log('  ✓ Pressure chamber present');
    console.log('  ✓ Plasma sphere present');
    console.log('  ✓ Superfluid helium torus present');
  });

  test('should have correct theme color for extreme_conditions', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=extreme_conditions');
    await page.waitForTimeout(2000);

    const bgColor = await page.evaluate(() => {
      const bg = window.context.scene.background;
      return bg ? {r: bg.r, g: bg.g, b: bg.b} : null;
    });

    expect(bgColor).not.toBeNull();
    // Theme color is 0xFFA94D (orange) * 0.1
    expect(bgColor.r).toBeCloseTo(0.1 * 1, 1);
    expect(bgColor.g).toBeCloseTo(0.1 * 0.66, 1);
    expect(bgColor.b).toBeCloseTo(0.1 * 0.3, 1);
  });
});