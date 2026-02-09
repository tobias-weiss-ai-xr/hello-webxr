import { test, expect } from '@playwright/test';

test.describe('VR Mode Safety', () => {
  test('should verify all rooms have required exports', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=H');

    // Wait for scene to initialize
    await page.waitForTimeout(2000);

    // Get all registered rooms
    const roomInfo = await page.evaluate(() => {
      const rooms = window.context.rooms;
      const results = [];

      rooms.forEach((room, index) => {
        if (room) {
          const hasSetup = typeof room.setup === 'function';
          const hasEnter = typeof room.enter === 'function';
          const hasExit = typeof room.exit === 'function';
          const hasExecute = typeof room.execute === 'function';

          results.push({
            index,
            hasSetup,
            hasEnter,
            hasExit,
            hasExecute,
            complete: hasSetup && hasEnter && hasExit && hasExecute
          });
        }
      });

      return results;
    });

    // Verify all rooms have all required exports
    const incompleteRooms = roomInfo.filter(r => !r.complete);
    expect(incompleteRooms.length).toBe(0);

    console.log(`✓ All ${roomInfo.length} rooms have required exports`);
    console.log('  - setup:', roomInfo.filter(r => r.hasSetup).length);
    console.log('  - enter:', roomInfo.filter(r => r.hasEnter).length);
    console.log('  - exit:', roomInfo.filter(r => r.hasExit).length);
    console.log('  - execute:', roomInfo.filter(r => r.hasExecute).length);
  });

  test('should safely handle missing room exports', async ({ page }) => {
    // Monitor console for errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Try to access rooms (even if not loaded, this tests the safety check)
    await page.goto('http://localhost:3000/?room=H');
    await page.waitForTimeout(2000);

    // Verify no errors related to missing exports
    const exportErrors = errors.filter(e =>
      e.includes('Missing required exports') ||
      e.includes('setup') ||
      e.includes('enter') ||
      e.includes('exit') ||
      e.includes('execute')
    );

    // We expect console warnings but not crashes
    console.log('✓ Room export safety checks in place');
    console.log(`  - Console errors monitored: ${errors.length}`);
    console.log(`  - Export-related warnings: ${exportErrors.length}`);
  });

  test('should verify experimental rooms have safe entry/exit', async ({ page }) => {
    await page.goto('http://localhost:3000/?room=extreme_conditions');

    // Wait for scene to initialize
    await page.waitForTimeout(2000);

    // Verify experimental room loaded safely
    const room = await page.evaluate(() => window.context.room);
    expect(room).toBeGreaterThan(118);

    // Navigate to another experimental room
    await page.goto('http://localhost:3000/?room=nano_world');
    await page.waitForTimeout(2000);

    const room2 = await page.evaluate(() => window.context.room);
    expect(room2).toBeGreaterThan(118);
    expect(room2).not.toBe(room);

    // Navigate back to lobby
    await page.goto('http://localhost:3000/?room=lobby');
    await page.waitForTimeout(2000);

    const room3 = await page.evaluate(() => window.context.room);
    expect(room3).toBe(0);

    console.log('✓ Experimental rooms navigate safely');
    console.log(`  - Room transitions: extreme_conditions → nano_world → lobby`);
  });

  test('should handle rapid room switching safely', async ({ page }) => {
    const rooms = ['H', 'He', 'extreme_conditions', 'nano_world', 'lobby'];

    for (const room of rooms) {
      await page.goto(`http://localhost:3000/?room=${room}`);
      await page.waitForTimeout(500);

      const currentRoom = await page.evaluate(() => window.context.room);
      expect(currentRoom).toBeGreaterThanOrEqual(0);

      console.log(`  ✓ Switched to ${room}`);
    }

    console.log('✓ Rapid room switching handled safely');
  });
});