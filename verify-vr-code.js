const fs = require('fs');

// Read the source file directly
const sourceContent = fs.readFileSync('C:/Users/Tobias/git/hello-webxr/src/index.js', 'utf8');

// Look for VR mode entry patterns
const vrEntryPositionMatch = sourceContent.match(/context\.cameraRig\.position\.set\(0,\s*1\.6,\s*6\.8\)/);
const vrEntryRotationMatch = sourceContent.match(/context\.cameraRig\.rotation\.set\(0,\s*0,\s*0\)/);

// Look for gotoRoom patterns  
const gotoPositionMatch = sourceContent.match(/context\.cameraRig\.position\.set\(0,\s*1\.6,\s*6\.8\)/);
const gotoRotationMatch = sourceContent.match(/context\.cameraRig\.rotation\.set\(0,\s*0,\s*0\)/);

console.log('=== VR Mode Entry Analysis ===');
console.log('VR Entry Position Match:', vrEntryPositionMatch ? vrEntryPositionMatch[0] : 'NOT FOUND');
console.log('VR Entry Rotation Match:', vrEntryRotationMatch ? vrEntryRotationMatch[0] : 'NOT FOUND');
console.log('GotoRoom Position Match:', gotoPositionMatch ? gotoPositionMatch[0] : 'NOT FOUND');
console.log('GotoRoom Rotation Match:', gotoRotationMatch ? gotoRotationMatch[0] : 'NOT FOUND');

if (vrEntryPositionMatch && gotoPositionMatch) {
  console.log('✓ Both VR mode entry and gotoRoom have camera position.set(0, 1.6, 6.8)');
}

if (vrEntryRotationMatch && gotoRotationMatch) {
  console.log('✓ Both VR mode entry and gotoRoom have camera rotation.set(0, 0, 0)');
}

console.log('=== Analysis Complete ===');