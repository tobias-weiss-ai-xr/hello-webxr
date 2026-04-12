import { test, expect } from '@playwright/test';

async function waitForApp(page) {
  await page.waitForFunction(
    () => (window as any).context?.engine && (window as any).context?.room !== undefined,
    { timeout: 30000 }
  );
}

test.describe('Keyboard Controls', () => {
  test('WASD keys do not crash the app', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.keyboard.press('W');
    await page.waitForTimeout(200);
    await page.keyboard.press('A');
    await page.waitForTimeout(200);
    await page.keyboard.press('S');
    await page.waitForTimeout(200);
    await page.keyboard.press('D');
    await page.waitForTimeout(200);

    expect(errors).toHaveLength(0);
  });

  test('WASD keys change camera position', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);

    const before = await page.evaluate(() => {
      const c = (window as any).context.camera;
      return { x: c.position.x, z: c.position.z };
    });

    await page.keyboard.press('W');
    await page.waitForTimeout(500);

    const after = await page.evaluate(() => {
      const c = (window as any).context.camera;
      return { x: c.position.x, z: c.position.z };
    });

    const moved = before.x !== after.x || before.z !== after.z;
    expect(moved).toBe(true);
  });

  test('keyboard input does not crash after room navigation', async ({ page }) => {
    await page.goto('/?room=Au');
    await waitForApp(page);

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.keyboard.press('W');
    await page.waitForTimeout(200);
    await page.keyboard.press('S');
    await page.waitForTimeout(200);

    const critical = errors.filter(err =>
      err.includes('Cannot read properties of undefined') ||
      err.includes('Scene is undefined')
    );
    expect(critical).toHaveLength(0);
  });
});
