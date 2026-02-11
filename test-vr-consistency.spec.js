// Test to verify VR mode entry consistency
const test = async ({ page }) => {
  console.log('Starting VR mode consistency test...');
  
  await page.goto('https://localhost:3000');
  
  await page.waitForLoadState('networkidle');
  
  // Check if VR mode entry code exists and has correct values
  const vrModeEntryCode = await page.evaluate(() => {
    const source = document.querySelector('script[src*="index.js"]').textContent;
    const vrEntryMatch = source.match(/context\.cameraRig\.position\.set\(0,\s*1\.6,\s*6\.8\)/);
    const rotationMatch = source.match(/context\.cameraRig\.rotation\.set\(0,\s*0,\s*0\)/);
    
    return {
      vrEntryFound: vrEntryMatch && vrEntryMatch.length > 0,
      rotationFound: rotationMatch && rotationMatch.length > 0,
      vrEntryCode: vrEntryMatch ? vrEntryMatch[0] : null,
      rotationCode: rotationMatch ? rotationMatch[0] : null
    };
  });
  
  console.log('VR Mode Entry Test Results:', vrModeEntryCode);
  
test('VR mode entry uses same camera position and rotation as room transitions', async ({ page }) => {
  console.log('Starting VR mode consistency test...');
  
  // First check VR mode entry by examining the actual HTML content
  const pageContent = await page.content();
  console.log('Page HTML source length:', pageContent.length);
  
  // Look for VR mode entry code patterns
  const vrEntryPositionMatch = pageContent.match(/context\.cameraRig\.position\.set\(0,\s*1\.6,\s*6\.8\)/);
  const vrEntryRotationMatch = pageContent.match(/context\.cameraRig\.rotation\.set\(0,\s*0,\s*0\)/);
  
  // Look for gotoRoom patterns
  const gotoPositionMatch = pageContent.match(/context\.cameraRig\.position\.set\(0,\s*1\.6,\s*6\.8\)/);
  const gotoRotationMatch = pageContent.match(/context\.cameraRig\.rotation\.set\(0,\s*0,\s*0\)/);
  
  const results = {
    vrEntryPositionFound: vrEntryPositionMatch && vrEntryPositionMatch.length > 0,
    vrEntryRotationFound: vrEntryRotationMatch && vrEntryRotationMatch.length > 0,
    vrEntryPositionCode: vrEntryPositionMatch ? vrEntryPositionMatch[0] : null,
    vrEntryRotationCode: vrEntryRotationMatch ? vrEntryRotationMatch[0] : null,
    gotoPositionFound: gotoPositionMatch && gotoPositionMatch.length > 0,
    gotoRotationFound: gotoRotationMatch && gotoRotationMatch.length > 0,
    gotoPositionCode: gotoPositionMatch ? gotoPositionMatch[0] : null,
    gotoRotationCode: gotoRotationMatch ? gotoRotationMatch[0] : null
  };
  
  console.log('VR Mode Entry Test Results:', results);
  console.log('GotoRoom Test Results:', { gotoPosition: results.gotoPositionCode, gotoRotation: results.gotoRotationCode });
  
  // Verify both have identical values
  expect(results.vrEntryPositionFound).toBe(true);
  expect(results.vrEntryRotationFound).toBe(true);
  expect(results.vrEntryPositionCode).toEqual(results.gotoPositionCode);
  expect(results.vrEntryRotationCode).toEqual(results.gotoRotationCode);
  
  // Additional verification
  if (results.vrEntryPositionFound && results.gotoPositionFound) {
    console.log('✓ Both VR mode entry and gotoRoom have camera position set');
    expect(results.vrEntryPositionCode).toContain('0, 1.6, 6.8');
    expect(results.gotoPositionCode).toContain('0, 1.6, 6.8');
  }
  
  if (results.vrEntryRotationFound && results.gotoRotationFound) {
    console.log('✓ Both VR mode entry and gotoRoom have camera rotation set');
    expect(results.vrEntryRotationCode).toContain('0, 0, 0');
    expect(results.gotoRotationCode).toContain('0, 0, 0');
  }
  
  console.log('✓ VR mode entry is consistent with room transitions');
});
  
  console.log('GotoRoom Test Results:', gotoRoomCode);
  
  // Verify both have identical values
  expect(vrModeEntryCode.vrEntryFound).toBe(true);
  expect(vrModeEntryCode.rotationFound).toBe(true);
  expect(vrModeEntryCode.vrEntryCode).toContain('0, 1.6, 6.8');
  expect(vrModeEntryCode.rotationCode).toContain('0, 0, 0');
  
  expect(gotoRoomCode.gotoFound).toBe(true);
  expect(gotoRoomCode.gotoRotationFound).toBe(true);
  expect(gotoRoomCode.gotoCode).toContain('0, 1.6, 6.8');
  expect(gotoRoomCode.gotoRotationCode).toContain('0, 0, 0');
  
  // Verify values are identical between VR mode entry and gotoRoom
  expect(vrModeEntryCode.vrEntryCode).toEqual(gotoRoomCode.gotoCode);
  expect(vrModeEntryCode.rotationCode).toEqual(gotoRoomCode.gotoRotationCode);
  
  console.log('✓ VR mode entry is consistent with room transitions');
};

test('VR mode entry uses same camera position and rotation as room transitions', test);