import { test, expect } from '@playwright/test';

test.describe('Historical Lab Room', () => {
  test('should load historical_lab room with antique equipment', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=historical_lab');

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

    // Check for antique table
    const hasTable = sceneObjects.some(obj =>
      obj.geometry?.type === 'BoxGeometry' &&
      obj.position.y === 0.5 &&
      obj.position.x === 0
    );
    expect(hasTable).toBeTruthy();

    // Check for crucible cone
    const hasCrucible = sceneObjects.some(obj =>
      obj.geometry?.type === 'ConeGeometry'
    );
    expect(hasCrucible).toBeTruthy();

    // Check for parchment plane
    const hasParchment = sceneObjects.some(obj =>
      obj.geometry?.type === 'PlaneGeometry'
    );
    expect(hasParchment).toBeTruthy();

    // Check for alchemy symbol ring
    const hasAlchemySymbol = sceneObjects.some(obj => obj.name === 'alchemySymbol');
    expect(hasAlchemySymbol).toBeTruthy();

    console.log('✓ Historical Lab room loaded successfully');
    console.log(`  - Found ${sceneObjects.length} objects`);
    console.log('  ✓ Antique table present');
    console.log('  ✓ Crucible present');
    console.log('  ✓ Parchment present');
    console.log('  ✓ Alchemy symbol present');
  });

  test('should have correct theme color for historical_lab', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=historical_lab');
    await page.waitForTimeout(2000);

    const bgColor = await page.evaluate(() => {
      const bg = window.context.scene.background;
      return bg ? {r: bg.r, g: bg.g, b: bg.b} : null;
    });

    expect(bgColor).not.toBeNull();
    // Theme color is 0xD63384 (pink) * 0.1
    expect(bgColor.r).toBeCloseTo(0.1 * 0.84, 1);
    expect(bgColor.g).toBeCloseTo(0.1 * 0.2, 1);
    expect(bgColor.b).toBeCloseTo(0.1 * 0.51, 1);
  });
});