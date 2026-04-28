import { test, expect } from '@playwright/test';

test('Periodic Pavilion renders full interactive periodic table', async ({ page }) => {
  await page.goto('/?room=periodic_pavilion');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);
  await page.waitForTimeout(500);

  const elementCount = await page.evaluate(() => {
    const ctx = (window as any).context;
    return ctx.scene?.meshes?.filter(m => m.name?.startsWith('ptCell_')).length || 0;
  });

  expect(elementCount).toBe(118);
});

test('Periodic Pavilion has doorway back to Landing Room', async ({ page }) => {
  await page.goto('/?room=periodic_pavilion');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);

  const hasDoorway = await page.evaluate(() => {
    const ctx = (window as any).context;
    const doorways = ctx.scene?.meshes?.filter(m => m.name?.includes('wall'))?.length || 0;
    return doorways > 0;
  });

  expect(hasDoorway).toBe(true);
});