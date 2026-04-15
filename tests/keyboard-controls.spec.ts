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

  test('WASD keys do not crash and camera remains valid', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);

    const before = await page.evaluate(() => {
      const c = (window as any).context.camera;
      return { alpha: c.alpha, beta: c.beta, radius: c.radius };
    });

    await page.keyboard.press('W');
    await page.waitForTimeout(500);

    const after = await page.evaluate(() => {
      const c = (window as any).context.camera;
      return { alpha: c.alpha, beta: c.beta, radius: c.radius };
    });

    expect(after.alpha).toBe(before.alpha);
    expect(after.beta).toBe(before.beta);
    expect(after.radius).toBe(before.radius);
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
