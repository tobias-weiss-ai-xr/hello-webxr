# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactive-content.spec.ts >> trivia cards are visible in element room
- Location: tests/interactive-content.spec.ts:11:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | async function waitForRoom(page, expectedRoom) {
> 4  |   await page.waitForFunction(
     |              ^ TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.
  5  |     (room) => (window as any).context?.room === room,
  6  |     expectedRoom,
  7  |     { timeout: 30000 }
  8  |   );
  9  | }
  10 | 
  11 | test('trivia cards are visible in element room', async ({ page }) => {
  12 |   await page.goto('/?room=Au');
  13 |   await waitForRoom(page, 80);
  14 | 
  15 |   const triviaCount = await page.evaluate(() => {
  16 |     const panels = (window as any).elementUI?.getDescendants(true) || [];
  17 |     return panels.filter((p: any) => p.name?.includes('Card') || p.name?.includes('Trivia')).length || 0;
  18 |   });
  19 | 
  20 |   expect(triviaCount).toBeGreaterThan(0);
  21 | });
  22 | 
  23 | test('trivia card title content is correct', async ({ page }) => {
  24 |   await page.goto('/?room=Au');
  25 |   await waitForRoom(page, 80);
  26 | 
  27 |   const titleText = await page.evaluate(() => {
  28 |     const panels = (window as any).elementUI?.getDescendants(true) || [];
  29 |     const cards = panels.filter((p: any) => p.name?.includes('Card')) || [];
  30 |     return cards?.[0]?._children?.[0]?.text || '';
  31 |   });
  32 | 
  33 |   expect(titleText).toContain('Au Properties');
  34 | });
  35 | 
  36 | test('experiment buttons link to experimental rooms', async ({ page }) => {
  37 |   await page.goto('/?room=Au');
  38 |   await waitForRoom(page, 80);
  39 | 
  40 |   const experimentCount = await page.evaluate(() => {
  41 |     const panels = (window as any).elementUI?.getDescendants(true) || [];
  42 |     return panels.filter((p: any) => p.name?.includes('Btn')).length || 0;
  43 |   });
  44 | 
  45 |   expect(experimentCount).toBeGreaterThan(0);
  46 | });
  47 | 
  48 | test('historical panel shows for themed elements', async ({ page }) => {
  49 |   await page.goto('/?room=Au');
  50 |   await waitForRoom(page, 80);
  51 | 
  52 |   const hasHistorical = await page.evaluate(() => {
  53 |     const panels = (window as any).elementUI?.getDescendants(true) || [];
  54 |     return panels.some((p: any) => p.name?.includes('Hist')) || false;
  55 |   });
  56 | 
  57 |   expect(hasHistorical).toBe(true);
  58 | });
```