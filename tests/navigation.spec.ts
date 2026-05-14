import { test, expect } from '@playwright/test';

async function waitForApp(page) {
  await page.waitForFunction(
    () => (window as any).context?.engine && (window as any).context?.room !== undefined,
    { timeout: 30000 }
  );
}

test.describe('Room Navigation', () => {
  test('lobby loads by default (room 0)', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);

    const room = await page.evaluate(() => (window as any).context.room);
    expect(room).toBe(0);
  });

  test('camera spawns at expected position', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);

    const pos = await page.evaluate(() => {
      const c = (window as any).context.camera;
      return c ? { x: c.position.x, y: c.position.y, z: c.position.z } : null;
    });

    expect(pos).not.toBeNull();
    expect(Math.abs(pos!.x)).toBeLessThan(1);
    expect(Math.abs(pos!.z)).toBeLessThan(10);
  });

  test('navigating to hydrogen room via URL param', async ({ page }) => {
    await page.goto('/?room=H');
    await waitForApp(page);

    const room = await page.evaluate(() => (window as any).context.room);
    expect(room).toBe(1);
  });

  test('navigating to gold room via URL param', async ({ page }) => {
    await page.goto('/?room=Au');
    await waitForApp(page);

    const room = await page.evaluate(() => (window as any).context.room);
    expect(room).toBe(22);
  });

  test('invalid room param falls back to lobby', async ({ page }) => {
    await page.goto('/?room=nonexistent');
    await waitForApp(page);

    const room = await page.evaluate(() => (window as any).context.room);
    expect(room).toBe(0);
  });

  test('navigating to lobby via URL param', async ({ page }) => {
    await page.goto('/?room=0');
    await waitForApp(page);

    const room = await page.evaluate(() => (window as any).context.room);
    expect(room).toBe(0);
  });

  test('.back button returns to lobby', async ({ page }) => {
    await page.goto('/?room=H');
    await waitForRoom(page, 1);

    await page.click('.backBtn');
    await waitForRoom(page, 0);

    const room = await page.evaluate(() => (window as any).context.room);
    expect(room).toBe(0);
  });
});
