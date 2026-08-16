import { expect, test } from '@playwright/test';

async function waitForRoom(page, expectedRoom) {
  await page.waitForFunction(
    (room) => (window as any).context?.room === room,
    expectedRoom,
    { timeout: 30000 }
  );
}

test('trivia cards are visible in element room', async ({ page }) => {
  await page.goto('/?room=Au');
  await waitForRoom(page, 80);

  const triviaCount = await page.evaluate(() => {
    const panels = (window as any).elementUI?.getDescendants(true) || [];
    return panels.filter((p: any) => p.name?.includes('Card') || p.name?.includes('Trivia')).length || 0;
  });

  expect(triviaCount).toBeGreaterThan(0);
});

test('trivia card title content is correct', async ({ page }) => {
  await page.goto('/?room=Au');
  await waitForRoom(page, 80);

  const titleText = await page.evaluate(() => {
    const panels = (window as any).elementUI?.getDescendants(true) || [];
    const cards = panels.filter((p: any) => p.name?.includes('Card')) || [];
    return cards?.[0]?._children?.[0]?.text || '';
  });

  expect(titleText).toContain('Au Properties');
});

test('experiment buttons link to experimental rooms', async ({ page }) => {
  await page.goto('/?room=Au');
  await waitForRoom(page, 80);

  const experimentCount = await page.evaluate(() => {
    const panels = (window as any).elementUI?.getDescendants(true) || [];
    return panels.filter((p: any) => p.name?.includes('Btn')).length || 0;
  });

  expect(experimentCount).toBeGreaterThan(0);
});

test('historical panel shows for themed elements', async ({ page }) => {
  await page.goto('/?room=Au');
  await waitForRoom(page, 80);

  const hasHistorical = await page.evaluate(() => {
    const panels = (window as any).elementUI?.getDescendants(true) || [];
    return panels.some((p: any) => p.name?.includes('Hist')) || false;
  });

  expect(hasHistorical).toBe(true);
});