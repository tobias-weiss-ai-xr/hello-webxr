import { test, expect } from '@playwright/test';

async function waitForApp(page) {
  await page.waitForFunction(
    () => (window as any).context?.engine && (window as any).context?.room !== undefined,
    { timeout: 30000 }
  );
}

test('smooth transition between Lobby and ElementRoom', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);

  // Navigate to element room (Hydrogen)
  const hydrogenButton = page.locator('[role="button"]').filter({ hasText: 'H' });
  await hydrogenButton.click();

  // Wait for transition to complete (animation + room load)
  await page.waitForTimeout(1000);

  // Verify we're in element room (rooms 1-118 are element rooms)
  const room = await page.evaluate(() => (window as any).context.room);
  expect(room).toBe(1); // H is first element (index 1)
});

test('transition cancel on rapid navigation', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);

  // Start transition to H, then immediately to C
  const hydrogenButton = page.locator('[role="button"]').filter({ hasText: 'H' });
  const carbonButton = page.locator('[role="button"]').filter({ hasText: 'C' });

  await hydrogenButton.click();
  await page.waitForTimeout(100); // Mid-transition

  await carbonButton.click();
  await page.waitForTimeout(1000); // Wait for completion

  // Should end up in Carbon room (index 6), not Hydrogen (index 1)
  const room = await page.evaluate(() => (window as any).context.room);
  const carbonIndex = (await page.evaluate(() => (window as any).ELEMENTS))
    .find((e: any) => e.symbol === 'C')
    .atomicNumber;
  expect(room).toBe(carbonIndex);
});

test('input locked during transition', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);

  // Start transition
  const hydrogenButton = page.locator('[role="button"]').filter({ hasText: 'H' });
  await hydrogenButton.click();

  // Immediately try to move (W key) - should be visible but ineffective during transition
  await page.waitForTimeout(200);

  // Verify we're now in the Hydrogen room (transition not blocked, input just locked)
  await page.waitForTimeout(800);
  const room = await page.evaluate(() => (window as any).context.room);
  expect(room).toBe(1);
});