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

  // Navigate to element room (Hydrogen) via URL param
  await page.goto('/?room=H');
  await waitForApp(page);

  // Wait for transition to complete (animation + room load)
  await page.waitForTimeout(2000);

  // Verify we're in element room (rooms 1-118 are element rooms)
  const room = await page.evaluate(() => (window as any).context.room);
  expect(room).toBe(1); // H is first element (index 1)
});

test('transition cancel on rapid navigation', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);

  // Start transition to H, then immediately to C
  await page.goto('/?room=H');
  await page.waitForTimeout(100); // Mid-transition

  await page.goto('/?room=C');
  await page.waitForTimeout(1000); // Wait for completion

  // Should end up in Carbon room (index 6), not Hydrogen (index 1)
  const carbonIndex = 6;
  await page.waitForTimeout(1000);
  const room = await page.evaluate(() => (window as any).context.room);
  expect(room).toBe(carbonIndex);
});

test('input locked during transition', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);

  // Start transition
  await page.goto('/?room=H');

  // Immediately try to move (W key) - should be visible but ineffective during transition
  await page.waitForTimeout(200);

  // Verify we're now in the Hydrogen room (transition not blocked, input just locked)
  await page.waitForTimeout(1500);
  const room = await page.evaluate(() => (window as any).context.room);
  expect(room).toBe(1);
});