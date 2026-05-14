# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Room Navigation >> navigating to gold room via URL param
- Location: tests/navigation.spec.ts:41:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 22
Received: 0
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
  10 | test.describe('Room Navigation', () => {
  11 |   test('lobby loads by default (room 0)', async ({ page }) => {
  12 |     await page.goto('/');
  13 |     await waitForApp(page);
  14 | 
  15 |     const room = await page.evaluate(() => (window as any).context.room);
  16 |     expect(room).toBe(0);
  17 |   });
  18 | 
  19 |   test('camera spawns at expected position', async ({ page }) => {
  20 |     await page.goto('/');
  21 |     await waitForApp(page);
  22 | 
  23 |     const pos = await page.evaluate(() => {
  24 |       const c = (window as any).context.camera;
  25 |       return c ? { x: c.position.x, y: c.position.y, z: c.position.z } : null;
  26 |     });
  27 | 
  28 |     expect(pos).not.toBeNull();
  29 |     expect(Math.abs(pos!.x)).toBeLessThan(1);
  30 |     expect(Math.abs(pos!.z)).toBeLessThan(10);
  31 |   });
  32 | 
  33 |   test('navigating to hydrogen room via URL param', async ({ page }) => {
  34 |     await page.goto('/?room=H');
  35 |     await waitForApp(page);
  36 | 
  37 |     const room = await page.evaluate(() => (window as any).context.room);
  38 |     expect(room).toBe(1);
  39 |   });
  40 | 
  41 |   test('navigating to gold room via URL param', async ({ page }) => {
  42 |     await page.goto('/?room=Au');
  43 |     await waitForApp(page);
  44 | 
  45 |     const room = await page.evaluate(() => (window as any).context.room);
> 46 |     expect(room).toBe(22);
     |                  ^ Error: expect(received).toBe(expected) // Object.is equality
  47 |   });
  48 | 
  49 |   test('invalid room param falls back to lobby', async ({ page }) => {
  50 |     await page.goto('/?room=nonexistent');
  51 |     await waitForApp(page);
  52 | 
  53 |     const room = await page.evaluate(() => (window as any).context.room);
  54 |     expect(room).toBe(0);
  55 |   });
  56 | 
  57 |   test('navigating to lobby via URL param', async ({ page }) => {
  58 |     await page.goto('/?room=0');
  59 |     await waitForApp(page);
  60 | 
  61 |     const room = await page.evaluate(() => (window as any).context.room);
  62 |     expect(room).toBe(0);
  63 |   });
  64 | });
  65 | 
```