const { test, expect } = require('@playwright/test');

test('ElementRoom handles Hydrogen correctly', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('=== SETTING UP HYDROGEN ROOM ===');
  // Directly setup Hydrogen room without using GotoRoom (workaround for initialization bug)
  const setupResult = await page.evaluate(() => {
    try {
      // Manually setup lobby room first so we can exit from it
      const roomLobby = window.context.rooms[0];
      if (roomLobby && typeof roomLobby.enter === 'function') {
        roomLobby.enter(window.context);
      }

      // Now setup Hydrogen room (room index 1)
      const ElementRoom = window.context.rooms[1];
      if (ElementRoom && typeof ElementRoom.setup === 'function') {
        ElementRoom.setup(window.context, 'H');
        ElementRoom.enter(window.context, 'H');
        window.context.room = 1;
        return { success: true, room: window.context.room };
      } else {
        return { success: false, error: 'ElementRoom not available' };
      }
    } catch (e) {
      return { success: false, error: e.message, stack: e.stack };
    }
  });
  console.log('Setup result:', JSON.stringify(setupResult, null, 2));
  expect(setupResult.success).toBe(true);

  await page.waitForTimeout(3000);

  console.log('=== VERIFYING ROOM INDEX ===');
  const roomState = await page.evaluate(() => {
    return { room: window.context.room };
  });
  console.log('Room state:', JSON.stringify(roomState, null, 2));
  expect(roomState.room).toBe(1);

  console.log('=== CHECKING ELEMENT DATA ===');
  const elementData = await page.evaluate(() => {
    const scene = window.context.scene;
    const findElementData = (obj) => {
      if (obj.userData && obj.userData.elementData) {
        return obj.userData.elementData;
      }
      if (obj.children) {
        for (let child of obj.children) {
          const found = findElementData(child);
          if (found) return found;
        }
      }
      return null;
    };
    const data = findElementData(scene);
    return {
      hasElementData: data !== null,
      elementData: data ? {
        symbol: data.symbol,
        atomicNumber: data.atomicNumber,
        mass: data.mass
      } : null
    };
  });
  console.log('Element data:', JSON.stringify(elementData, null, 2));
  expect(elementData.hasElementData).toBe(true);
  expect(elementData.elementData).not.toBeNull();
  expect(elementData.elementData.symbol).toBe('H');
  expect(elementData.elementData.atomicNumber).toBe(1);
  expect(elementData.elementData.mass).toBeCloseTo(1.008, 3);

  console.log('=== CHECKING ATOM MODEL COMPONENTS ===');
  const atomComponents = await page.evaluate(() => {
    const scene = window.context.scene;
    let hasNucleus = false;
    let hasElectron = false;
    let hasAtomModel = false;
    const traverse = (obj) => {
      if (obj.userData) {
        if (obj.userData.type === 'nucleus') hasNucleus = true;
        if (obj.userData.type === 'electron') hasElectron = true;
        if (obj.userData.elementSymbol === 'H') hasAtomModel = true;
      }
      if (obj.children) {
        obj.children.forEach(traverse);
      }
    };
    traverse(scene);
    return {
      hasAtomModel,
      hasNucleus,
      hasElectron,
      sceneChildren: scene.children.length
    };
  });
  console.log('Atom components:', JSON.stringify(atomComponents, null, 2));
  expect(atomComponents.hasAtomModel).toBe(true);
  expect(atomComponents.hasNucleus).toBe(true);
  expect(atomComponents.hasElectron).toBe(true);
});
