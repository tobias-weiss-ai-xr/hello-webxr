# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: transitions.spec.ts >> transition cancel on rapid navigation
- Location: tests/transitions.spec.ts:26:1

# Error details

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('[role="button"]').filter({ hasText: 'H' })

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | async function waitForApp(page) {
  4  |   await page.waitForFunction(
  5  |     () => (window as any).context?.engine && (window as any).context?.room !== undefined,
  6  |     { timeout: 30000 }
  7  |   );
  8  | }
  9  | 
  10 | test('smooth transition between Lobby and ElementRoom', async ({ page }) => {
  11 |   await page.goto('/');
  12 |   await waitForApp(page);
  13 | 
  14 |   // Navigate to element room (Hydrogen)
  15 |   const hydrogenButton = page.locator('[role="button"]').filter({ hasText: 'H' });
  16 |   await hydrogenButton.click();
  17 | 
  18 |   // Wait for transition to complete (animation + room load)
  19 |   await page.waitForTimeout(1000);
  20 | 
  21 |   // Verify we're in element room (rooms 1-118 are element rooms)
  22 |   const room = await page.evaluate(() => (window as any).context.room);
  23 |   expect(room).toBe(1); // H is first element (index 1)
  24 | });
  25 | 
  26 | test('transition cancel on rapid navigation', async ({ page }) => {
  27 |   await page.goto('/');
  28 |   await waitForApp(page);
  29 | 
  30 |   // Start transition to H, then immediately to C
  31 |   const hydrogenButton = page.locator('[role="button"]').filter({ hasText: 'H' });
  32 |   const carbonButton = page.locator('[role="button"]').filter({ hasText: 'C' });
  33 | 
> 34 |   await hydrogenButton.click();
     |                        ^ Error: locator.click: Target page, context or browser has been closed
  35 |   await page.waitForTimeout(100); // Mid-transition
  36 | 
  37 |   await carbonButton.click();
  38 |   await page.waitForTimeout(1000); // Wait for completion
  39 | 
  40 |   // Should end up in Carbon room (index 6), not Hydrogen (index 1)
  41 |   const room = await page.evaluate(() => (window as any).context.room);
  42 |   const carbonIndex = (await page.evaluate(() => (window as any).ELEMENTS))
  43 |     .find((e: any) => e.symbol === 'C')
  44 |     .atomicNumber;
  45 |   expect(room).toBe(carbonIndex);
  46 | });
  47 | 
  48 | test('input locked during transition', async ({ page }) => {
  49 |   await page.goto('/');
  50 |   await waitForApp(page);
  51 | 
  52 |   // Start transition
  53 |   const hydrogenButton = page.locator('[role="button"]').filter({ hasText: 'H' });
  54 |   await hydrogenButton.click();
  55 | 
  56 |   // Immediately try to move (W key) - should be visible but ineffective during transition
  57 |   await page.waitForTimeout(200);
  58 | 
  59 |   // Verify we're now in the Hydrogen room (transition not blocked, input just locked)
  60 |   await page.waitForTimeout(800);
  61 |   const room = await page.evaluate(() => (window as any).context.room);
  62 |   expect(room).toBe(1);
  63 | });
```