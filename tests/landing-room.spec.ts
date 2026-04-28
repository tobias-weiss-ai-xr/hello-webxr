import { test, expect } from '@playwright/test';

test('Landing Room has 6 featured exhibits', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);
  await page.waitForTimeout(500);

  const exhibitCount = await page.evaluate(() => {
    const ctx = (window as any).context;
    return ctx.scene?.meshes?.filter(m => m.name?.startsWith('exhibit_')).length || 0;
  });

  expect(exhibitCount).toBe(6);
});

test('Landing Room has doorways to Periodic Pavilion and Lab Wing', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);

  const doorways = await page.evaluate(() => {
    const ctx = (window as any).context;
    return ctx.scene?.meshes?.filter(m => m.name?.includes('wall'))?.length || 0;
  });

  expect(doorways).toBeGreaterThan(4);
});