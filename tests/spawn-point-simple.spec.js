const { test, expect } = require("@playwright/test");

test("Spawn point issue - direct navigation", async ({ page }) => {
  console.log("=== NAVIGATING DIRECTLY TO HYDROGEN ROOM ===");
  
  // Go directly to Hydrogen room
  await page.goto("https://localhost:3000/?room=H");
  
  // Wait for page to load with shorter timeout
  try {
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log("Page load timeout, continuing anyway");
  }

  // Check if we can access window.context
  const contextAvailable = await page.evaluate(() => {
    return typeof window.context !== "undefined";
  });
  
  if (!contextAvailable) {
    console.log("Window context not available, taking screenshot anyway");
    await page.screenshot({ path: "test-results/no-context.png" });
    return;
  }

  // Get camera and atom positions
  const measurements = await page.evaluate(() => {
    const ctx = window.context;
    if (!ctx || !ctx.cameraRig) {
      return { error: "Context or cameraRig not available" };
    }
    
    // Camera rig position
    const cameraRigPos = {
      x: ctx.cameraRig.position.x,
      y: ctx.cameraRig.position.y,
      z: ctx.cameraRig.position.z
    };
    
    // Find atom model
    let atomWorldPos = null;
    let atomFound = false;
    
    // Search through scene for atom model
    const findAtomInScene = (obj) => {
      if (obj.userData && obj.userData.atomModel) {
        return obj.userData.atomModel;
      }
      if (obj.children) {
        for (let child of obj.children) {
          const found = findAtomInScene(child);
          if (found) return found;
        }
      }
      return null;
    };
    
    for (let child of ctx.scene.children) {
      const atomModel = findAtomInScene(child);
      if (atomModel) {
        atomFound = true;
        atomWorldPos = new window.THREE.Vector3();
        atomModel.getWorldPosition(atomWorldPos);
        break;
      }
    }
    
    // Calculate distance if atom found
    let distance = null;
    if (atomWorldPos) {
      const cameraWorldPos = new window.THREE.Vector3();
      ctx.cameraRig.getWorldPosition(cameraWorldPos);
      distance = cameraWorldPos.distanceTo(atomWorldPos);
    }
    
    return {
      cameraRigPos,
      atomWorldPos: atomWorldPos ? { 
        x: atomWorldPos.x, 
        y: atomWorldPos.y, 
        z: atomWorldPos.z 
      } : null,
      distance,
      atomFound,
      roomIndex: ctx.room
    };
  });

  console.log("Hydrogen room measurements:", JSON.stringify(measurements, null, 2));
  
  // Take screenshot
  await page.screenshot({ 
    path: "test-results/hydrogen-direct-navigation.png",
    fullPage: false 
  });
  console.log("Screenshot saved: test-results/hydrogen-direct-navigation.png");
  
  // If we have measurements, analyze them
  if (measurements && !measurements.error) {
    console.log(`Camera position: (${measurements.cameraRigPos.x}, ${measurements.cameraRigPos.y}, ${measurements.cameraRigPos.z})`);
    
    if (measurements.atomFound) {
      console.log(`Atom position: (${measurements.atomWorldPos.x}, ${measurements.atomWorldPos.y}, ${measurements.atomWorldPos.z})`);
      console.log(`Distance to atom: ${measurements.distance}`);
      
      if (measurements.distance < 3) {
        console.log("❌ ISSUE CONFIRMED: Camera is too close to atom (distance < 3)");
      } else {
        console.log("✅ Camera distance is reasonable");
      }
    } else {
      console.log("No atom model found in scene");
    }
  }
});
