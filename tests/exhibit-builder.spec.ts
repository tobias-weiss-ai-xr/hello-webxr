import { test, expect } from '@playwright/test';

test('ExhibitBuilder creates exhibit station with atom, artifacts, and info panel', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);

  const hasExhibits = await page.evaluate(() => {
    const ctx = (window as any).context;
    return ctx.scene?.meshes?.filter(m => m.name?.startsWith('exhibit_')).length >= 6 ||
           ctx.scene?.meshes?.filter(m => m.name?.startsWith('atomModel_')).length >= 6;
  });

  expect(hasExhibits).toBe(true);
});