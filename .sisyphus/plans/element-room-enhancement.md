# Element Room Enhancement Plan

## TL;DR

> **Quick Summary**: Add prominent navigation help UI, refactor element rooms with accurate electron shell configuration, and integrate real 3D element models.
> 
> **Deliverables**:
> - In-VR help panel showing "Press N to switch rooms" + VR controller instructions
> - Back-to-lobby button in every element room
> - Accurate electron shell configuration (Aufbau principle)
> - 3D model integration for representative elements
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Data → Shell Logic → UI → Models

---

## Context

### Original Request
1. Write a prominent notice to switch rooms via N key (and how to switch in VR mode)
2. Plan to refactor the element rooms
3. Add example 3D models for each element
4. Make orbits fit the actual shell configuration

### Interview Summary
**Research Findings**:

1. **Current Shell Logic** (ElementRoom.js:156-200):
   - Uses hardcoded `shells = [2, 8, 18, 32, 50, 72]`
   - Simple Bohr model - places electrons evenly around rings
   - Does NOT follow Aufbau principle (2, 8, 8, 18, 18, 32, 32...)

2. **Element Data** (elements.js):
   - Has `atomicNumber`, `block` (s/p/d/f), but NO `electronConfiguration`
   - Missing shell data needed for accurate visualization

3. **Navigation**:
   - Desktop: N key works (fixed in previous commit)
   - VR: Element buttons in Lobby trigger `ctx.goto = roomIndex`
   - **Gap**: No back button in element rooms, no help UI

4. **3D Assets**:
   - `assets/elements/` and `assets/molecules/` directories don't exist
   - Current implementation uses procedural `createThemedElementDisplay()`
   - Themes: cosmic, solar, metallic, crystalline, gaseous, radioactive, biological, energy

---

## Work Objectives

### Core Objective
Transform element rooms from basic procedural displays into scientifically accurate, visually rich, and user-friendly VR experiences.

### Concrete Deliverables
- `.sisyphus/evidence/help-panel-*.png` - Screenshots of help UI in VR
- `src/data/elements.js` - Updated with `electronConfiguration` field
- `src/rooms/ElementRoom.js` - Refactored shell logic
- `src/components/HelpPanel.js` - New reusable help panel component
- `assets/elements/*.glb` - 3D models for representative elements

### Definition of Done
- [ ] Help panel visible in all rooms showing navigation controls
- [ ] Back-to-lobby button works in all element rooms
- [ ] Electron shells match real electron configuration (e.g., Na: [2,8,1])
- [ ] At least 10 elements have 3D models loaded and displayed
- [ ] All Playwright tests pass

### Must Have
- Help panel showing "N = Next Room" for desktop
- Help panel showing "Click element button → Go to element room" for VR
- Back-to-lobby button in element rooms
- Accurate shell configuration based on real electron arrangement

### Must NOT Have (Guardrails)
- Don't break existing room navigation (N key, VR buttons)
- Don't create models for all 118 elements (too much, start with 10)
- Don't change element data structure radically (add fields, don't restructure)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (Playwright)
- **Automated tests**: Tests-after (focus on visual/functional verification)
- **Framework**: Playwright

### Agent-Executed QA Scenarios

**Scenario: Help panel displays navigation instructions**
```
Tool: Playwright (playwright skill)
Steps:
  1. Navigate to http://localhost:8080
  2. Wait for canvas visible
  3. Press N to enter first element room
  4. Wait 1s for room transition
  5. Assert: Help panel visible in scene
  6. Assert: Panel contains "N" key instruction
  7. Screenshot: .sisyphus/evidence/help-panel-element-room.png
Expected Result: Help panel visible with navigation text
```

**Scenario: Back-to-lobby button works**
```
Tool: Playwright (playwright skill)
Steps:
  1. Navigate to lobby
  2. Press N to enter Hydrogen room
  3. Click back-to-lobby button (if VR mode) OR verify button exists
  4. Assert: Room index returns to 0
Expected Result: User can return to lobby from element room
```

**Scenario: Electron shells match configuration**
```
Tool: Playwright (playwright skill)
Steps:
  1. Navigate to Sodium (Na) room - room index 11
  2. Capture console logs
  3. Assert: Logs show electronConfiguration [2, 8, 1]
  4. Count shell meshes in atomModel
  5. Assert: 3 shells exist (for [2, 8, 1])
Expected Result: Sodium shows 3 shells with 2, 8, 1 electrons
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Data Foundation):
├── Task 1: Add electronConfiguration to elements.js
└── Task 2: Create representative 3D element models (10 elements)

Wave 2 (Core Implementation):
├── Task 3: Refactor shell logic to use electronConfiguration
├── Task 4: Create HelpPanel component
└── Task 5: Add back-to-lobby button to ElementRoom

Wave 3 (Integration & Polish):
├── Task 6: Integrate 3D models into element rooms
├── Task 7: Add help panel to all rooms
└── Task 8: Write Playwright tests

Critical Path: Task 1 → Task 3 → Task 4/5 → Task 7 → Task 8
Parallel Speedup: ~50% faster than sequential
```

---

## TODOs

- [ ] 1. Add electronConfiguration to Element Data

  **What to do**:
  - Add `electronConfiguration: number[]` field to each element in `src/data/elements.js`
  - Example: Hydrogen `[1]`, Helium `[2]`, Lithium `[2,1]`, Sodium `[2,8,1]`, Iron `[2,8,14,2]`
  - Use standard notation: array index = shell number (1-indexed), value = electrons in that shell

  **Must NOT do**:
  - Don't change existing fields
  - Don't try to auto-calculate (manual data is more reliable)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward data entry task
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `src/data/elements.js:29-100` - Current element structure
  - Electron configuration reference: https://en.wikipedia.org/wiki/Electron_configuration

  **Acceptance Criteria**:
  - [ ] All 118 elements have `electronConfiguration` field
  - [ ] Values match real electron configurations
  - [ ] No syntax errors in elements.js

  **Commit**: YES (groups with 2)
  - Message: `feat(data): add electronConfiguration to all elements`
  - Files: `src/data/elements.js`

---

- [ ] 2. Create Representative 3D Element Models

  **What to do**:
  - Create `assets/elements/` directory
  - Add GLB models for 10 representative elements:
    - **H** (Hydrogen) - Simple sphere
    - **C** (Carbon) - Diamond/tetrahedral structure
    - **Fe** (Iron) - Metallic cube/crystal
    - **Au** (Gold) - Shiny gold nugget
    - **Na** (Sodium) - Soft metal cube
    - **Cl** (Chlorine) - Green gas cloud
    - **O** (Oxygen) - Blue gas sphere
    - **Si** (Silicon) - Gray crystal
    - **Cu** (Copper) - Copper wire/coil
    - **U** (Uranium) - Glowing green radioactive symbol

  **Must NOT do**:
  - Don't create all 118 models (out of scope)
  - Don't use copyrighted models

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 3D model creation requires visual skills
  - **Skills**: []
    - Could use Blender MCP if available, otherwise manual creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 6
  - **Blocked By**: None

  **References**:
  - `src/lib/modelLoader.js:createElementDisplay()` - Where models are loaded
  - Theme patterns: cosmic, solar, metallic, crystalline, gaseous, radioactive

  **Acceptance Criteria**:
  - [ ] `assets/elements/` directory exists
  - [ ] At least 10 GLB files present
  - [ ] Files are valid 3D models (can be loaded by Three.js)

  **Commit**: YES (groups with 1)
  - Message: `feat(assets): add 3D models for representative elements`
  - Files: `assets/elements/*.glb`

---

- [ ] 3. Refactor Electron Shell Logic

  **What to do**:
  - Modify `createAtomModel()` in `ElementRoom.js` to use `element.electronConfiguration`
  - Remove hardcoded `shells = [2, 8, 18, 32, 50, 72]`
  - Create shell rings based on actual configuration array
  - Place electrons according to array values

  **Before**:
  ```javascript
  const shells = [2, 8, 18, 32, 50, 72];
  // ... calculates shells from atomicNumber
  ```

  **After**:
  ```javascript
  const config = element.electronConfiguration || [element.atomicNumber];
  config.forEach((electronCount, shellIndex) => {
    const shellRadius = 1.0 + shellIndex * 0.6;
    // Create shell and electrons
  });
  ```

  **Must NOT do**:
  - Don't break elements without electronConfiguration (fallback to current behavior)
  - Don't change animation logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Targeted refactor, well-defined scope
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 4, 5)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1

  **References**:
  - `src/rooms/ElementRoom.js:138-203` - Current createAtomModel function
  - `src/data/elements.js` - Source of electronConfiguration

  **Acceptance Criteria**:
  - [ ] Sodium (Na) shows 3 shells with [2, 8, 1] electrons
  - [ ] Hydrogen (H) shows 1 shell with [1] electron
  - [ ] Iron (Fe) shows 4 shells with correct counts
  - [ ] Elements without config still work (fallback)

  **Agent-Executed QA**:
  ```
  Scenario: Verify Sodium shell configuration
    Tool: Playwright
    Steps:
      1. Navigate to localhost:8080
      2. Press 'n' 11 times to reach Sodium (index 11)
      3. Wait 2s for room to render
      4. Evaluate: Count children of atomModel with userData.shell
      5. Assert: Count === 3 (three shells)
      6. Screenshot: .sisyphus/evidence/sodium-shells.png
  ```

  **Commit**: YES
  - Message: `refactor(element-room): use electronConfiguration for accurate shells`
  - Files: `src/rooms/ElementRoom.js`

---

- [ ] 4. Create HelpPanel Component

  **What to do**:
  - Create new file `src/components/HelpPanel.js`
  - Export `createHelpPanel(ctx, options)` function
  - Options: `{ position: {x, y, z}, showDesktop: true, showVR: true }`
  - Content:
    ```
    Desktop:
    - "N = Next Room"
    - "0-9 = Jump to room"
    - "WASD = Move camera"
    
    VR:
    - "Point at element → Click to enter room"
    - "Teleport pad → Move within room"
    - "Back button → Return to lobby"
    ```

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component creation
  - **Skills**: []
    - Follows existing Text component pattern

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3, 5)
  - **Blocks**: Task 7
  - **Blocked By**: None

  **References**:
  - `src/rooms/Lobby.js:333-377` - Existing info panel pattern
  - `src/components/index.js` - Where to export new component

  **Acceptance Criteria**:
  - [ ] HelpPanel component exists and is exported
  - [ ] Panel shows desktop controls when `showDesktop: true`
  - [ ] Panel shows VR controls when `showVR: true`
  - [ ] Panel is billboarded to face camera

  **Commit**: YES (groups with 5)
  - Message: `feat(ui): add HelpPanel component for navigation instructions`
  - Files: `src/components/HelpPanel.js`, `src/components/index.js`

---

- [ ] 5. Add Back-to-Lobby Button to ElementRoom

  **What to do**:
  - Add a "back to lobby" button mesh in ElementRoom
  - Position at a consistent location (e.g., behind user, y=1.6)
  - Register RayControl state for button interaction
  - On click: `ctx.goto = 0` (lobby index)

  **Pattern from ExperimentalRoom.js**:
  ```javascript
  ctx.raycontrol.addState('backToLobby', {
    colliderMesh: [backButton],
    controller: 'primary',
    onSelectStart: (intersection, e) => {
      ctx.goto = 0;  // Return to lobby
    }
  });
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Follows existing pattern exactly
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3, 4)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/rooms/ExperimentalRoom.js:647-656` - Back button pattern
  - `src/rooms/ElementRoom.js:enter()` - Where to add state

  **Acceptance Criteria**:
  - [ ] Back button visible in element room
  - [ ] Clicking button returns to lobby
  - [ ] Button has hover effect

  **Commit**: YES (groups with 4)
  - Message: `feat(element-room): add back-to-lobby button`
  - Files: `src/rooms/ElementRoom.js`

---

- [ ] 6. Integrate 3D Models into Element Rooms

  **What to do**:
  - Modify `createAtomModel()` to check for GLB model first
  - If `assets/elements/{symbol}.glb` exists, load it instead of procedural model
  - Fall back to procedural display if no model exists
  - Position model alongside electron shell visualization

  **Code pattern**:
  ```javascript
  async function createAtomModel(ctx, element) {
    const modelPath = `assets/elements/${element.symbol.toLowerCase()}.glb`;
    try {
      const gltf = await loadGLTF(modelPath);
      atomModel = gltf.scene;
    } catch {
      // Fall back to procedural
      atomModel = createThemedElementDisplay(element, element.theme);
    }
    // ... rest of setup
  }
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Follows existing modelLoader pattern
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 7, 8)
  - **Blocks**: None
  - **Blocked By**: Task 2

  **References**:
  - `src/lib/modelLoader.js` - Model loading utilities
  - `src/rooms/ElementRoom.js:138` - Where models are created

  **Acceptance Criteria**:
  - [ ] Elements with GLB files show 3D models
  - [ ] Elements without GLB files still show procedural display
  - [ ] No errors when model file doesn't exist

  **Commit**: YES
  - Message: `feat(element-room): integrate 3D models for elements`
  - Files: `src/rooms/ElementRoom.js`

---

- [ ] 7. Add Help Panel to All Rooms

  **What to do**:
  - Import HelpPanel in Lobby, ElementRoom, ExperimentalRoom
  - Create help panel in each room's `setup()` function
  - Position consistently (e.g., upper left corner, facing user spawn point)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Integration task using existing component
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 6, 8)
  - **Blocks**: Task 8
  - **Blocked By**: Task 4

  **References**:
  - `src/components/HelpPanel.js` - Component from Task 4
  - `src/rooms/*.js` - All room files to update

  **Acceptance Criteria**:
  - [ ] Help panel visible in Lobby
  - [ ] Help panel visible in ElementRoom
  - [ ] Help panel visible in ExperimentalRoom
  - [ ] All panels show correct controls for context

  **Commit**: YES
  - Message: `feat(ui): add help panels to all rooms`
  - Files: `src/rooms/Lobby.js`, `src/rooms/ElementRoom.js`, `src/rooms/ExperimentalRoom.js`

---

- [ ] 8. Write Playwright Tests

  **What to do**:
  - Update `tests/n-key-navigation.spec.js` with new scenarios
  - Add test for help panel visibility
  - Add test for back-to-lobby button
  - Add test for shell configuration accuracy

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Test writing, follows existing patterns
  - **Skills**: [`playwright`]
    - Playwright skill for test patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 6, 7)
  - **Blocks**: None
  - **Blocked By**: Task 7

  **References**:
  - `tests/n-key-navigation.spec.js` - Existing test file
  - `playwright.config.ts` - Test configuration

  **Acceptance Criteria**:
  - [ ] All tests pass
  - [ ] Coverage includes: navigation, help panel, back button, shells

  **Commit**: YES
  - Message: `test: add tests for element room enhancements`
  - Files: `tests/n-key-navigation.spec.js` or new test file

---

## Commit Strategy

| After Task | Message | Files |
|------------|---------|-------|
| 1, 2 | `feat: add electronConfiguration and 3D element models` | elements.js, assets/elements/ |
| 3 | `refactor: use electronConfiguration for accurate shells` | ElementRoom.js |
| 4, 5 | `feat: add HelpPanel and back-to-lobby button` | HelpPanel.js, ElementRoom.js |
| 6 | `feat: integrate 3D models into element rooms` | ElementRoom.js |
| 7 | `feat: add help panels to all rooms` | Lobby.js, ElementRoom.js, ExperimentalRoom.js |
| 8 | `test: add element room enhancement tests` | tests/ |

---

## Success Criteria

### Verification Commands
```bash
npm test  # Expected: All tests pass
npm run build  # Expected: No errors
```

### Final Checklist
- [ ] Help panel visible in all rooms with navigation instructions
- [ ] Back-to-lobby button works from any element room
- [ ] Electron shells match real configurations (Na: [2,8,1], etc.)
- [ ] At least 10 elements have 3D models displayed
- [ ] All Playwright tests pass
- [ ] Bundle builds without errors
