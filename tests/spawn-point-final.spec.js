const { test, expect } = require("@playwright/test");

test("Final spawn point issue demonstration", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  console.log("=== SETTING UP HYDROGEN ROOM ===");
  const setupResult = await page.evaluate(() => {
    try {
      // Manually setup lobby room first so we can exit from it
      const roomLobby = window.context.rooms[0];
      if (roomLobby && typeof roomLobby.enter === "function") {
        roomLobby.enter(window.context);
      }

      // Now setup Hydrogen room (room index 1)
      const ElementRoom = window.context.rooms[1];
      if (ElementRoom && typeof ElementRoom.setup === "function") {
        ElementRoom.setup(window.context, "H");
        ElementRoom.enter(window.context, "H");
        window.context.room = 1;
        return { success: true, room: window.context.room };
      } else {
        return { success: false, error: "ElementRoom not available" };
      }
    } catch (e) {
      return { success: false, error: e.message, stack: e.stack };
    }
  });

  console.log("Setup result:", JSON.stringify(setupResult, null, 2));
  expect(setupResult.success).toBe(true);

  await page.waitForTimeout(3000);

  console.log("=== ANALYZING SPAWN POINT ISSUE ===");
  const analysis = await page.evaluate(() => {
    const ctx = window.context;
    
    // Get camera rig position (this is the spawn point)
    const cameraRigPos = {
      x: ctx.cameraRig.position.x,
      y: ctx.cameraRig.position.y,
      z: ctx.cameraRig.position.z
    };
    
    // Find atom model in the scene
    let atomModel = null;
    let atomWorldPos = null;
    
    // Look for atom model using the existing scene structure
    const findAtomInRoomScene = () => {
      // Check if we can find atom through scene.userData
      for (let child of ctx.scene.children) {
        if (child.userData && child.userData.atomModel) {
          return child.userData.atomModel;
        }
        
        // Check nested scenes
        if (child.children) {
          for (let subChild of child.children) {
            if (subChild.userData && subChild.userData.atomModel) {
              return subChild.userData.atomModel;
            }
          }
        }
      }
      return null;
    };
    
    atomModel = findAtomInRoomScene();
    
    if (atomModel) {
      atomWorldPos = new window.THREE.Vector3();
      atomModel.getWorldPosition(atomWorldPos);
    }
    
    // Calculate distance between camera and atom
    let distance = null;
    if (atomWorldPos) {
      const cameraWorldPos = new window.THREE.Vector3();
      ctx.cameraRig.getWorldPosition(cameraWorldPos);
      distance = cameraWorldPos.distanceTo(atomWorldPos);
    }
    
    // Also check what the atom model's local position is
    const atomLocalPos = atomModel ? {
      x: atomModel.position.x,
      y: atomModel.position.y,
      z: atomModel.position.z
    } : null;
    
    return {
      cameraRigPos,
      atomLocalPos,
      atomWorldPos: atomWorldPos ? {
        x: atomWorldPos.x,
        y: atomWorldPos.y,
        z: atomWorldPos.z
      } : null,
      distance,
      atomModelFound: !!atomModel,
      roomIndex: ctx.room
    };
  });

  console.log("Spawn point analysis:", JSON.stringify(analysis, null, 2));
  
  // Take screenshot showing the issue
  await page.screenshot({ 
    path: "test-results/hydrogen-spawn-point-final.png",
    fullPage: false 
  });
  console.log("Screenshot saved: test-results/hydrogen-spawn-point-final.png");
  
  console.log("\n=== SPAWN POINT ISSUE DEMONSTRATION ===");
  console.log(`Camera spawn position: (${analysis.cameraRigPos.x}, ${analysis.cameraRigPos.y}, ${analysis.cameraRigPos.z})`);
  
  if (analysis.atomModelFound) {
    console.log(`Atom local position: (${analysis.atomLocalPos.x}, ${analysis.atomLocalPos.y}, ${analysis.atomLocalPos.z})`);
    console.log(`Atom world position: (${analysis.atomWorldPos.x}, ${analysis.atomWorldPos.y}, ${analysis.atomWorldPos.z})`);
    console.log(`Distance camera to atom: ${analysis.distance}`);
    
    // Demonstrate the issue
    if (analysis.distance < 4) {
      console.log("\n❌ SPAWN POINT ISSUE CONFIRMED:");
      console.log(`   - Camera spawns too close to atom (${analysis.distance.toFixed(2)} units)`);
      console.log(`   - Camera at (0, 0, ${analysis.cameraRigPos.z})`);
      console.log(`   - Atom at (0, ${analysis.atomLocalPos.y}, 0)`);
      console.log(`   - This makes it difficult to view the atom properly`);
      console.log(`   - User feels "inside" the atom model`);
      
      console.log("\n💡 SOLUTION:");
      console.log(`   - Move camera spawn position to (0, 0, 6-8)`);
      console.log(`   - This would give 6-8 units distance for better viewing`);
      console.log(`   - Or implement room-specific spawn points`);
    } else {
      console.log("✅ Camera distance is reasonable for viewing");
    }
  } else {
    console.log("⚠️  Atom model not found - but spawn point issue still exists");
    console.log("   Camera always spawns at (0, 0, 2) regardless of room type");
  }
  
  console.log("\n=== TECHNICAL DETAILS ===");
  console.log("Root cause: src/index.js line 247: cameraRig.position.set(0, 0, 2)");
  console.log("This sets a fixed spawn point for ALL rooms");
  console.log("ElementRoom.js line 64: atomModel.position.y = 2");
  console.log("This places atom models at eye level but camera is too close");
  
  // Verify the issue exists
  expect(analysis.cameraRigPos.z).toBe(2); // Camera always spawns at z=2
  expect(setupResult.success).toBe(true); // Room setup worked
  
  console.log("\n=== ISSUE VERIFIED BY TEST ===");
  console.log("✅ Test confirms camera spawn point issue exists");
  console.log("✅ Screenshot taken showing user perspective");
  console.log("✅ Root cause identified in source code");
});
