const { test, expect } = require('@playwright/test');

test('ElementRoom handles Iron (Transition Metal) via URL parameter', async ({ page }) => {
  // Navigate directly to Iron room via URL parameter
  await page.goto('/?room=Fe');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('=== VERIFYING IRON ROOM LOADED ===');
  const roomState = await page.evaluate(() => {
    // window.context might not be initialized yet, check for undefined
    if (typeof window.context === 'undefined') {
      return { error: 'window.context not initialized' };
    }
    return {
      room: window.context.room,
      sceneChildren: window.context.scene ? window.context.scene.children.length : 0
    };
  });
  console.log('Room state:', JSON.stringify(roomState, null, 2));

  // Verify room index is 26 (Iron is 26th element, room index = 1 + 25)
  expect(roomState.room).toBe(26);

  console.log('=== VERIFYING ELEMENT DATA ===');
  const elementData = await page.evaluate(() => {
    // ElementRoom stores param in scene.userData
    const elementSymbol = window.context.scene.userData.elementSymbol;
    const currentElementRoom = window.context.currentElementRoom;
    return { elementSymbol, currentElementRoom };
  });
  console.log('Element data:', JSON.stringify(elementData, null, 2));

  expect(elementData.elementSymbol).toBe('Fe');
  expect(elementData.currentElementRoom).toBe('Fe');

  console.log('=== VERIFYING ELEMENT PROPERTIES ===');
  const elementProperties = await page.evaluate(() => {
    // Look for elements array in global scope or module
    // Since this is ESM, we need to check what's exposed
    const scene = window.context.scene;
    const children = scene.children;
    return {
      hasAtomModel: children.some(c => c.name === 'atomModel'),
      childrenCount: children.length,
      childNames: children.map(c => c.name || 'unnamed')
    };
  });
  console.log('Element properties:', JSON.stringify(elementProperties, null, 2));

  // Verify atom model exists
  expect(elementProperties.hasAtomModel).toBe(true);

  console.log('=== VERIFYING TRANSITION METAL COLOR ===');
  const colorData = await page.evaluate(() => {
    const scene = window.context.scene;
    const atomModel = scene.children.find(c => c.name === 'atomModel');
    if (!atomModel) return { error: 'atomModel not found' };

    // Look for meshes with transition metal color (0x74B9FF)
    const transitionColor = 0x74B9FF;
    const meshes = atomModel.children || [];
    const coloredMeshes = meshes
      .filter(m => m.type === 'Mesh' && m.material && m.material.color)
      .map(m => ({
        name: m.name,
        color: m.material.color.getHex(),
        isTransitionColor: m.material.color.getHex() === transitionColor
      }));

    return {
      meshCount: meshes.length,
      coloredMeshes,
      hasTransitionColor: coloredMeshes.some(m => m.isTransitionColor)
    };
  });
  console.log('Color data:', JSON.stringify(colorData, null, 2));

  // Verify transition metal color is applied
  expect(colorData.hasTransitionColor).toBe(true);

  console.log('=== VERIFYING ELECTRON SHELLS (26 electrons, >=3 shells) ===');
  const electronData = await page.evaluate(() => {
    const scene = window.context.scene;
    const atomModel = scene.children.find(c => c.name === 'atomModel');
    if (!atomModel) return { error: 'atomModel not found' };

    // Count electron-containing meshes
    const allMeshes = [];
    atomModel.traverse(child => {
      if (child.type === 'Mesh') {
        allMeshes.push({
          name: child.name,
          type: child.name?.toLowerCase().includes('electron') ? 'electron' :
                child.name?.toLowerCase().includes('shell') ? 'shell' :
                child.name?.toLowerCase().includes('nucleus') ? 'nucleus' : 'other'
        });
      }
    });

    const electrons = allMeshes.filter(m => m.type === 'electron');
    const shells = allMeshes.filter(m => m.type === 'shell');

    return {
      totalMeshes: allMeshes.length,
      electronCount: electrons.length,
      shellCount: shells.length,
      electronNames: electrons.map(m => m.name),
      shellNames: shells.map(m => m.name)
    };
  });
  console.log('Electron data:', JSON.stringify(electronData, null, 2));

  // Verify Iron has 26 electrons
  expect(electronData.electronCount).toBe(26);

  // Verify Iron has at least 3 shells (K, L, M shells for period 4)
  expect(electronData.shellCount).toBeGreaterThanOrEqual(3);
});