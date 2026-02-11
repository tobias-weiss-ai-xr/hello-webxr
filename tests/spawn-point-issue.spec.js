const { test, expect } = require("@playwright/test");
test.describe("Spawn Point Issue Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => {
      const loading = document.getElementById("loading");
      return loading && getComputedStyle(loading).display === "none";
    }, { timeout: 30000 });
    await page.waitForFunction(() => {
      return typeof window.context !== "undefined" && window.context.camera !== undefined;
    }, { timeout: 30000 });
  });

  test("Camera position too close to atom in element rooms", async ({ page }) => {
    console.log("=== TESTING HYDROGEN ROOM SPAWN POINT ===");
    
    // Setup Hydrogen room
    const setupResult = await page.evaluate(() => {
      try {
        // First ensure we are in lobby
        const lobbyRoom = window.context.rooms[0];
        if (lobbyRoom && typeof lobbyRoom.enter === "function") {
          lobbyRoom.enter(window.context);
        }

        // Setup Hydrogen room (room index 1)
        const ElementRoom = window.context.rooms[1];
        if (ElementRoom && typeof ElementRoom.setup === "function") {
          ElementRoom.setup(window.context, "H");
          ElementRoom.enter(window.context, "H");
          window.context.room = 1;
          return { success: true, room: 1 };
        } else {
          return { success: false, error: "ElementRoom not available" };
        }
      } catch (e) {
        return { success: false, error: e.message };
      }
    });

    console.log("Setup result:", JSON.stringify(setupResult, null, 2));
    expect(setupResult.success).toBe(true);
    await page.waitForTimeout(3000);

    // Get camera and atom positions
    const measurements = await page.evaluate(() => {
      const ctx = window.context;
      
      // Camera rig position
      const cameraRigPos = {
        x: ctx.cameraRig.position.x,
        y: ctx.cameraRig.position.y,
        z: ctx.cameraRig.position.z
      };
      
      // Find atom model
      let atomWorldPos = null;
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
      
      // Search through scene for atom model
      for (let child of ctx.scene.children) {
        const atomModel = findAtomInScene(child);
        if (atomModel) {
          atomWorldPos = new window.THREE.Vector3();
          atomModel.getWorldPosition(atomWorldPos);
          break;
        }
      }
      
      // Calculate distance
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
        roomIndex: ctx.room
      };
    });

    console.log("Hydrogen room measurements:", JSON.stringify(measurements, null, 2));
    
    // Take screenshot
    await page.screenshot({ 
      path: "test-results/hydrogen-spawn-issue.png",
      fullPage: false 
    });
    console.log("Screenshot saved: test-results/hydrogen-spawn-issue.png");
    
    // Verify the issue exists
    expect(measurements.distance).toBeLessThan(3);
    expect(measurements.cameraRigPos.z).toBeLessThan(3);
    
    console.log(`Camera position: (${measurements.cameraRigPos.x}, ${measurements.cameraRigPos.y}, ${measurements.cameraRigPos.z})`);
    console.log(`Atom position: (${measurements.atomWorldPos.x}, ${measurements.atomWorldPos.y}, ${measurements.atomWorldPos.z})`);
    console.log(`Distance to atom: ${measurements.distance}`);
    
    // This demonstrates the spawn point issue
    console.log("❌ ISSUE CONFIRMED: Camera spawns too close to atom core");
  });
});
