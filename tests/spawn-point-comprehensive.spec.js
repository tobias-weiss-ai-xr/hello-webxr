const { test, expect } = require("@playwright/test");

test("Comprehensive spawn point issue analysis", async ({ page }) => {
  console.log("=== COMPREHENSIVE SPAWN POINT ANALYSIS ===");
  
  // Navigate to root first, then to hydrogen
  await page.goto("https://localhost:3000/");
  await page.waitForLoadState("networkidle", { timeout: 15000 });
  await page.waitForTimeout(3000);
  
  // Check initial context
  const initialState = await page.evaluate(() => {
    return {
      contextAvailable: typeof window.context !== "undefined",
      cameraRigAvailable: window.context && window.context.cameraRig,
      initialRoom: window.context ? window.context.room : null
    };
  });
  
  console.log("Initial state:", initialState);
  
  // Navigate to Hydrogen room
  await page.goto("https://localhost:3000/?room=H");
  await page.waitForLoadState("networkidle", { timeout: 15000 });
  await page.waitForTimeout(5000); // Give more time for room to load
  
  // Check if we're in hydrogen room
  const roomState = await page.evaluate(() => {
    return {
      contextAvailable: typeof window.context !== "undefined",
      roomIndex: window.context ? window.context.room : null,
      sceneChildren: window.context ? window.context.scene.children.length : 0
    };
  });
  
  console.log("Room state after navigation:", roomState);
  
  // Take screenshot of what we see
  await page.screenshot({ path: "test-results/hydrogen-after-wait.png" });
  console.log("Screenshot saved: test-results/hydrogen-after-wait.png");
  
  // Comprehensive scene analysis
  const analysis = await page.evaluate(() => {
    const ctx = window.context;
    if (!ctx) return { error: "Context not available" };
    
    // Camera position
    const cameraRigPos = {
      x: ctx.cameraRig.position.x,
      y: ctx.cameraRig.position.y,
      z: ctx.cameraRig.position.z
    };
    
    // Deep scene traversal to find atom
    let atomModel = null;
    let atomWorldPos = null;
    let nucleusFound = false;
    let elementDataFound = false;
    
    const analyzeObject = (obj, depth = 0) => {
      if (depth > 10) return null;
      
      // Check for various atom identifiers
      if (obj.userData) {
        if (obj.userData.atomModel) {
          atomModel = obj;
          console.log("Found atomModel via userData.atomModel");
        }
        if (obj.userData.nucleus) {
          nucleusFound = true;
          console.log("Found nucleus via userData.nucleus");
        }
        if (obj.userData.elementData) {
          elementDataFound = true;
          console.log("Found elementData via userData.elementData");
        }
      }
      
      // Check position patterns (atom models are typically at y=2)
      if (obj.position && obj.position.y > 1.5 && obj.position.y < 2.5 && !atomModel) {
        // Check if this could be an atom (has children, not just a simple mesh)
        if (obj.children && obj.children.length > 2) {
          atomModel = obj;
          console.log("Found potential atom by position:", obj.position);
        }
      }
      
      // Check children recursively
      if (obj.children) {
        for (let child of obj.children) {
          const result = analyzeObject(child, depth + 1);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    // Analyze scene
    for (let child of ctx.scene.children) {
      const result = analyzeObject(child);
      if (result) break;
    }
    
    // Get world position if atom found
    if (atomModel) {
      atomWorldPos = new window.THREE.Vector3();
      atomModel.getWorldPosition(atomWorldPos);
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
      atomModelFound: !!atomModel,
      nucleusFound,
      elementDataFound,
      roomIndex: ctx.room
    };
  });
  
  console.log("Comprehensive analysis:", JSON.stringify(analysis, null, 2));
  
  // Final analysis
  console.log("\n=== SPAWN POINT ISSUE ANALYSIS ===");
  console.log(`Camera spawns at: (${analysis.cameraRigPos.x}, ${analysis.cameraRigPos.y}, ${analysis.cameraRigPos.z})`);
  
  if (analysis.atomModelFound) {
    console.log(`Atom model found at: (${analysis.atomWorldPos.x}, ${analysis.atomWorldPos.y}, ${analysis.atomWorldPos.z})`);
    console.log(`Distance to atom: ${analysis.distance}`);
    
    if (analysis.distance < 4) {
      console.log("❌ ISSUE CONFIRMED: Camera is too close to atom model");
      console.log("   The user spawns at z=2 but atom is at y=2, creating poor viewing angle");
      console.log("   SOLUTION: Move camera spawn position further back (z=6-8)");
    } else {
      console.log("✅ Camera distance appears reasonable");
    }
  } else {
    console.log("⚠️  Atom model not found - room may not have loaded properly");
    console.log("   Nucleus found:", analysis.nucleusFound);
    console.log("   Element data found:", analysis.elementDataFound);
  }
  
  // Demonstrate the root cause
  console.log("\n=== ROOT CAUSE ===");
  console.log("From src/index.js line 247: cameraRig.position.set(0, 0, 2)");
  console.log("From ElementRoom.js line 64: atomModel.position.y = 2");
  console.log("");
  console.log("ISSUE: Camera always spawns at (0, 0, 2) regardless of room type");
  console.log("This puts camera too close to atom models positioned at (0, 2, 0)");
  console.log("Distance ≈ √((2-0)² + (0-2)²) = √8 ≈ 2.8 units (too close for good viewing)");
});
