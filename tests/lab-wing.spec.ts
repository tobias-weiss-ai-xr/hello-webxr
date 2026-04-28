import { test, expect } from '@playwright/test';

test('Lab Wing room renders 10 experimental stations', async ({ page }) => {
  await page.goto('/?room=reaction_lab');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);
  await page.waitForTimeout(500); // Wait for room to fully load

  const experimentalStations = await page.evaluate(() => {
    const ctx = (window as any).context;
    return ctx.scene?.meshes?.filter(m => m.name?.startsWith('expStation_')).length || 0;
  });

  expect(experimentalStations).toBe(10);
});

test('Lab Wing has doorway back to Landing Room', async ({ page }) => {
  await page.goto('/?room=reaction_lab');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);

  const hasSouthDoorway = await page.evaluate(() => {
    const ctx = (window as any).context;
    const doorways = ctx.scene?.meshes?.filter(m => m.name?.includes('wall')) || [];
    return doorways.some(d => d.position.z > 0); // South wall doorway
  });

  expect(hasSouthDoorway).toBe(true);
});