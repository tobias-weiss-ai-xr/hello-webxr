# Fix H Room and Implement Remaining Element Rooms

## TL;DR

> **Quick Summary**: Fix critical lobby room registration bug preventing startup, verify generic ElementRoom handles elements correctly (H, He, Fe), implement 5 missing experimental room unique 3D setups, and add safety guards for room navigation.
>
> **Deliverables**:
> - Lobby room assignment fix in `src/index.js`
> - Tests verifying Hydrogen, Helium, Iron room navigation
> - 5 new experimental room implementation functions (extreme_conditions, industrial_apps, historical_lab, space_chem, nano_world)
> - URL validation and VR mode safety guards
>
> **Estimated Effort**: Medium
> **Parallel Execution**: NO - sequential due to bug fix dependencies
> **Critical Path**: Fix lobby bug → test element rooms → implement experimental rooms

---

## Context

### Original Request
"plan how to fix the H room and how to implement the other remaining rooms"

### Interview Summary
**Key Discussions**:
- User wants to fix H room and implement remaining rooms
- Upon investigation: H room doesn't exist as separate file - uses generic ElementRoom.js
- Critical bug found: Lobby room (rooms[0]) never assigned, causing crash on startup
- 5 out of 10 experimental rooms have no unique implementations

**Research Findings**:
- Architecture uses single generic rooms: ElementRoom.js (all 118 elements), ExperimentalRoom.js (all 10 rooms)
- Element data has 118 elements (H through Og) with full properties
- Experimental rooms: 10 total (reaction_lab, nuclear_chamber, electrochem_lab, organic_chem, extreme_conditions, industrial_apps, historical_lab, space_chem, nano_world, challenge_arena)
- Only 5 experimental rooms have specific implementations in switch statement

### Metis Review
**Identified Gaps** (addressed):
- **Gap 1**: Missing experimental room scope - RESOLVED: Implement unique 3D setups for all 5 missing rooms (not generic lab)
- **Gap 2**: Element room testing scope - RESOLVED: Test Hydrogen + Helium (noble gas) + Iron (transition metal) for coverage
- **Gap 3**: Edge case guards - RESOLVED: Add URL validation and VR mode safety; skip rapid-switch deduplication (out of scope)
- **Gap 4**: Acceptance criteria specificity - RESOLVED: Added concrete executable tests with shell commands
- **Gap 5**: Experimental room interactivity - RESOLVED: Keep visual-only, no raycaster interactions

---

## Work Objectives

### Core Objective
Fix critical startup crash, verify generic element room functionality across element types, and complete experimental room implementations.

### Concrete Deliverables
1. Lobby room assignment: Add `rooms[ROOM_LOBBY] = roomLobby;` in `src/index.js`
2. Element room tests: Create Playwright tests for Hydrogen, Helium, Iron navigation
3. Experimental room implementations: Create 5 new setup functions with unique 3D geometry
4. Safety guards: Add URL validation and VR mode export verification
5. Documentation: Update AGENTS.md if experimental room pattern changes

### Definition of Done
- [x] `npm test` passes with no failures
- [x] Dev server starts without console errors
- [x] All 3 element rooms (H, He, Fe) navigate correctly via URL
- [x] All 10 experimental rooms have unique implementations in switch statement
- [x] URL with invalid room ID shows error message (no crash)
- [x] VR mode toggle doesn't crash on missing exports

### Must Have
- Fix critical lobby room bug
- Verify ElementRoom works with Hydrogen (baseline) and 2 edge cases
- Implement 5 missing experimental room unique setups (not generic lab)
- Add URL validation guard clause

### Must NOT Have (Guardrails)
- Create individual element room files (H.js, He.js, etc.) - violates generic pattern
- Modify room indexing constants (ROOM_LOBBY, ROOM_ELEMENTS_START, ROOM_EXP_START)
- Add raycaster interactions to experimental rooms - keep visual-only
- Touch shader packing (packshaders.py) - orthogonal to room logic
- Implement rapid-switch deduplication - out of scope per user requirements
- Add performance profiling - baseline verification only

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> This is NOT conditional — it applies to EVERY task, regardless of test strategy.
>
> **FORBIDDEN** — acceptance criteria that require:
> - "User manually tests..." / "사용자가 직접 테스트..."
> - "User visually confirms..." / "사용자가 눈으로 확인..."
> - "User interacts with..." / "사용자가 직접 조작..."
> - "Ask user to verify..." / "사용자에게 확인 요청..."
> - ANY step where a human must perform an action
>
> **ALL verification is executed by the agent** using tools (Bash, file checks, Running tests). No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Playwright tests in tests/ directory)
- **Automated tests**: Tests-after (add tests after implementation)
- **Framework**: Playwright (@playwright/test)

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

> Whether tests are added or not, EVERY task MUST include Agent-Executed QA Scenarios.
> - **With tests**: QA scenarios complement Playwright tests
> - **Without tests**: QA scenarios are the PRIMARY verification method

**Each Scenario MUST Follow This Format:**

```
Scenario: [Descriptive name — what user action/flow is being verified]
  Tool: [Bash / Direct file read]
  Preconditions: [What must be true before this scenario runs]
  Steps:
    1. [Exact action with specific command/file check]
    2. [Next action with expected intermediate state]
    3. [Assertion with exact expected value]
  Expected Result: [Concrete, observable outcome]
  Failure Indicators: [What would indicate failure]
  Evidence: [Output capture / file path check]
```

---

## Execution Strategy

### Parallel Execution Waves

> Sequential execution required - bug fix must be completed before other verification.

```
Wave 1 (Task 1):
└── Task 1: Fix critical lobby room bug

Wave 2 (After Wave 1):
├── Task 2: Test ElementRoom with Hydrogen
├── Task 3: Test ElementRoom with Helium (noble gas)
├── Task 4: Test ElementRoom with Iron (transition metal)

Wave 3 (After Wave 2):
├── Task 5: Implement extreme_conditions room
├── Task 6: Implement industrial_apps room
├── Task 7: Implement historical_lab room
├── Task 8: Implement space_chem room
└── Task 9: Implement nano_world room

Wave 4 (After Wave 3):
├── Task 10: Add URL validation guard
└── Task 11: Verify VR mode safety

Critical Path: Task 1 → Task 2-4 → Task 5-9 → Task 10-11
Parallel Speedup: ~33% faster than sequential (tasks 2-4 and 5-9 can run in parallel after dependencies complete)
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3, 4, 5-11 | None (critical path) |
| 2 | 1 | 5-11 | 3, 4 |
| 3 | 1 | 5-11 | 2, 4 |
| 4 | 1 | 5-11 | 2, 3 |
| 5 | 1, 2, 3, 4 | 10, 11 | 6, 7, 8, 9 |
| 6 | 1, 2, 3, 4 | 10, 11 | 5, 7, 8, 9 |
| 7 | 1, 2, 3, 4 | 10, 11 | 5, 6, 8, 9 |
| 8 | 1, 2, 3, 4 | 10, 11 | 5, 6, 7, 9 |
| 9 | 1, 2, 3, 4 | 10, 11 | 5, 6, 7, 8 |
| 10 | 1, 5-9 | None | 11 |
| 11 | 1, 5-9 | None | 10 |

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info.

- [x] 1. Fix Critical Lobby Room Bug

  **What to do**:
  - Add line in `src/index.js` before line 280: `rooms[ROOM_LOBBY] = roomLobby;`
  - This assigns the imported Lobby module to the rooms array at index 0
  - Ensure it's added BEFORE the existing `rooms[ROOM_LOBBY].setup(context);` call
  - Maintain existing code style and formatting (2-space indentation)

  **Must NOT do**:
  - Modify ROOM_LOBBY constant (must remain 0)
  - Change roomLobby import path
  - Modify the.setup() call that follows

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Single line addition to existing file - trivial change
  - **Skills**: N/A
    - Reason: No specialized skills needed for simple line insertion

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 1)
  - **Blocks**: 2, 3, 4, 5-11
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `src/index.js:283-286` - Element room registration pattern for array assignment
  - `src/index.js:288-291` - Experimental room registration pattern for array assignment
  - `src/index.js:28` - roomLobby import statement

  **API/Type References** (contracts to implement against):
  - `src/index.js:49` - Constant: `const ROOM_LOBBY = 0;`
  - `src/index.js:44` - Array declaration: `var rooms = [];`

  **Test References** (testing patterns to follow):
  - `tests/rooms-array.spec.js` - Existing test for room array verification
  - `tests/app-load.spec.js:9-16` - Pattern for evaluating window.context

  **External References** (libraries and frameworks):
  - None needed - standard JavaScript array assignment

  **Documentation References** (specs and requirements):
  - `src/rooms/AGENTS.md` - Room module export requirements (setup, enter, exit, execute)

  **WHY Each Reference Matters** (explain the relevance):
  - Lines 283-286: Show how rooms are assigned in loops - follow same pattern for lobby
  - Line 28: Verify the import name matches the assignment (roomLobby)
  - Line 49: Confirm ROOM_LOBBY is 0 - assignment must be at rooms[0]

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  ```
  Scenario: Verify lobby room assignment added before setup call
    Tool: Bash (file read + grep)
    Preconditions: File src/index.js exists
    Steps:
      1. Read src/index.js lines 275-285
      2. Assert line contains: rooms[ROOM_LOBBY] = roomLobby;
      3. Assert this line appears BEFORE: rooms[ROOM_LOBBY].setup(context);
    Expected Result: Assignment line exists and precedes setup call
    Failure Indicators: Assignment line missing, or appears after setup call
    Evidence: Extracted lines showing correct order

  Scenario: Verify lobby assignment uses correct constant and import
    Tool: Bash (grep)
    Preconditions: File src/index.js exists
    Steps:
      1. grep "rooms\[ROOM_LOBBY\]" src/index.js
      2. Assert exactly 3 occurrences exist: assignment + setup call + enter call
      3. Assert assignment uses "rooms[ROOM_LOBBY] = roomLobby;"
    Expected Result: 3 occurrences, correct syntax
    Failure Indicators: Wrong variable name, missing ROOM_LOBBY array access
    Evidence: Grep output showing 3 matches with correct syntax

  Scenario: Dev server starts without console errors
    Tool: Bash (start server + wait + curl)
    Preconditions: npm dependencies installed, port 3000 free
    Steps:
      1. Run: npm start > /tmp/startup.log 2>&1 & DEV_PID=$!
      2. Wait 10 seconds for server to initialize
      3. Run: curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
      4. Assert HTTP status is 200
      5. Run: grep -i "TypeError: Cannot read properties of undefined" /tmp/startup.log || echo "NO_UNDEFINED_ERROR"
      6. Assert "NO_UNDEFINED_ERROR" (no TypeError from missing room)
      7. Run: kill $DEV_PID 2>/dev/null
    Expected Result: Server responds with 200, no TypeError
    Failure Indicators: HTTP code not 200, TypeError about undefined in logs
    Evidence: HTTP status code, grep output showing "NO_UNDEFINED_ERROR"

  Scenario: Verify window.context exists and room is 0 (lobby)
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Run: npx playwright code http://localhost:3000 --evaluate "window.context && window.context.room"
      2. Assert output contains "0"
      3. Run: npx playwright code http://localhost:3000 --evaluate "window.context.rooms[0] !== undefined"
      4. Assert output contains "true"
    Expected Result: context.room is 0, rooms[0] is defined
    Failure Indicators: context is undefined, room is not 0, rooms[0] is undefined
    Evidence: Playwright code output showing room=0 and rooms[0] defined
  ```

  **Evidence to Capture**:
  - [ ] Extracted lines 275-285 from src/index.js showing assignment order
  - [ ] Grep output showing 3 occurrences of "rooms[ROOM_LOBBY]"
  - [ ] /tmp/startup.log file with server startup output
  - [ ] HTTP status code from curl
  - [ ] Playwright code output showing context.room value

  **Commit**: YES (group with 2, 3, 4)
  - Message: `fix(index): Add missing lobby room registration`
  - Files: `src/index.js`
  - Pre-commit: `npm test`

---

- [x] 2. Test ElementRoom with Hydrogen

  **What to do**:
  - Create test file `tests/hydrogen-room.spec.js`
  - Verify Hydrogen room loads correctly via URL `?room=H`
  - Check that ElementRoom correctly looks up H element data
  - Verify 3D atom model, electron shell, and info panel are created
  - Test that room navigation works from `window.context.GotoRoom(1, 'H')`

  **Must NOT do**:
  - Modify ElementRoom.js implementation
  - Create individual H.js room file

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single test file addition, follows existing patterns
  - **Skills**: `playwright`
    - Reason: Need Playwright for browser navigation testing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: 5-11
  - **Blocked By**: 1

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `tests/hydrogen-nav.spec.js` - Existing Hydrogen navigation test pattern
  - `tests/navigation.spec.js` - URL parameter test pattern
  - `tests/elementroom-logs.spec.js` - ElementRoom console logging test
  - `src/rooms/ElementRoom.js:17-50` - ElementRoom setup function structure
  - `src/rooms/ElementRoom.js:62-127` - createAtomModel function
  - `src/rooms/ElementRoom.js:129-200` - createInfoPanel function

  **API/Type References** (contracts to implement against):
  - `src/data/elements.js:31-44` - Hydrogen element data structure
  - `src/index.js:73-102` - gotoRoom function signature (roomIndex, elementSymbol)
  - `src/rooms/ElementRoom.js:17` - setup function signature: `export async function setup(ctx, elementSymbol)`

  **Test References** (testing patterns to follow):
  - `tests/app-load.spec.js:3-23` - Pattern for page evaluation and assertions
  - `tests/navigation.spec.js:3-13` - Pattern for URL parameter testing
  - `tests/hydrogen-nav.spec.js:3-29` - Pattern for room navigation testing

  **External References** (libraries and frameworks):
  - Playwright docs: `@playwright/test` page.evaluate() for inspecting window.context
  - Playwright docs: page.waitForLoadState() for waiting for load completion

  **Documentation References** (specs and requirements):
  - `src/rooms/AGENTS.md` - Room navigation via URL parameters
  - `AGENTS.md` - Testing patterns using window.context

  **WHY Each Reference Matters**:
  - ElementRoom.js: Understand what gets created (atom, shell, info panel) to verify existence
  - elements.js: Know Hydrogen's properties (atomicNumber: 1, mass: 1.008, etc.) for validation
  - gotoRoom function: Understand parameters (1 for H room index, 'H' for symbol)

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  ```
  Scenario: Test file created following existing patterns
    Tool: Bash (file read + grep)
    Preconditions: Task 1 completed
    Steps:
      1. Read tests/hydrogen-room.spec.js lines 1-10
      2. Assert test uses: import { test, expect } from '@playwright/test';
      3. Assert test has: page.goto('/?room=H');
      4. Assert test waits for: await page.waitForLoadState('networkidle');
      5. Assert test evaluates: window.context.room to verify value is 1
    Expected Result: Test file exists with correct imports and test structure
    Failure Indicators: File doesn't exist, missing imports, wrong URL, wrong room index
    Evidence: Test file content showing correct structure

  Scenario: Hydrogen room navigation via URL works
    Tool: Bash (npx playwright test)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Run: npx playwright test tests/hydrogen-room.spec.js --reporter=line
      2. Assert exit code is 0
      3. Assert output contains: PASS
    Expected Result: Test passes, no errors
    Failure Indicators: Exit code non-zero, FAIL in output, TypeError in logs
    Evidence: Test runner output showing PASS status

  Scenario: Hydrogen element data correctly loaded
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Run: npx playwright code http://localhost:3000/?room=H --evaluate "window.context room after navigation"
      2. Actually: npx playwright code http://localhost:3000/?room=H --eval "window.context.elementData || window.context.currentElementRoom"
      3. Better: Evaluate in test: page.evaluate(() => window.context.scenes[window.context.room].userData.elementData)
      4. Assert elementData.symbol is 'H'
      5. Assert elementData.atomicNumber is 1
      6. Assert elementData.mass is 1.008
    Expected Result: Hydrogen data loaded correctly (symbol: H, atomicNumber: 1, mass: 1.008)
    Failure Indicators: elementData undefined, wrong symbol, wrong atomicNumber
    Evidence: Playwright evaluation output showing correct element data

  Scenario: Atom model created for Hydrogen
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running, Hydrogen room loaded
    Steps:
      1. Run: npx playwright code http://localhost:3000/?room=H --eval "window.context.scenes[1].children.find(c => c.userData && c.userData.slug === 'atom-model' || c.name === 'atomModel')"
      2. Actually: Check scene.children for nucleus and electrons
      3. Run: npx playwright code http://localhost:3000/?room=H --eval "window.context.scenes[1].children.filter(c => c.userData && (c.userData.nucleus || c.userData.electron)).length"
      4. Assert value >= 1 (at least nucleus exists)
    Expected Result: Atom mesh exists in scene (nucleus or electron objects found)
    Failure Indicators: No atom meshes, scene.children empty
    Evidence: Playwright output showing count >= 1

  Scenario: Console logs show ElementRoom setup executed
    Tool: Bash (grep log file)
    Preconditions: Dev server started with logging
    Steps:
      1. Check /tmp/startup.log or server output for: [ElementRoom] setup called for: H
      2. Run: grep "\[ElementRoom\]" /tmp/startup.log | tail -10
      3. Assert output contains: setup called for: H
    Expected Result: Log line shows ElementRoom setup executed for H
    Failure Indicators: No setup log line, or log shows different element
    Evidence: Grep output showing setup log line
  ```

  **Evidence to Capture**:
  - [ ] Test file content (tests/hydrogen-room.spec.js)
  - [ ] Playwright test output showing PASS
  - [ ] Playwright evaluation showing elementData values
  - [ ] Playwright evaluation showing atom mesh count
  - [ ] Server log output showing ElementRoom setup for H

  **Commit**: YES (group with 1, 3, 4)
  - Message: `test: Add Hydrogen room navigation test`
  - Files: `tests/hydrogen-room.spec.js`
  - Pre-commit: `npx playwright test tests/hydrogen-room.spec.js`

---

- [x] 3. Test ElementRoom with Helium (Noble Gas)

  **What to do**:
  - Create test file `tests/helium-room.spec.js`
  - Verify Helium room loads correctly via URL `?room=He`
  - Check that ElementRoom correctly looks up He element data
  - Verify noble gas color (NOBLE_GAS_COLORS.He = 0xFFE4E1) is applied
  - Test that room works with noble gas element type (different group from Hydrogen)

  **Must NOT do**:
  - Modify ElementRoom.js implementation
  - Create individual He.js room file

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single test file addition, follows existing patterns
  - **Skills**: `playwright`
    - Reason: Need Playwright for browser navigation testing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4)
  - **Blocks**: 5-11
  - **Blocked By**: 1

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `tests/hydrogen-nav.spec.js` - Existing Hydrogen navigation test pattern (adapt for He)
  - `tests/hydrogen-room.spec.js` - Just created in Task 2 - follow same structure
  - `src/rooms/ElementRoom.js:31` - Theme color application: `new THREE.Color(themeColor).multiplyScalar(0.15)` for background
  - `src/data/elements.js:46-60` - Helium element data structure with nobleGas group

  **API/Type References** (contracts to implement against):
  - `src/data/elements.js:19-20` - Noble gas color: `NOBLE_GAS_COLORS.He: 0xFFE4E1`
  - `src/index.js:49-51` - Room index calculation: `ROOM_ELEMENTS_START + index` (He is index 1 in ELEMENTS, so room index 2)
  - `src/rooms/ElementRoom.js:17` - setup function signature

  **Test References** (testing patterns to follow):
  - `tests/hydrogen-room.spec.js` - Task 2 test file - mirror structure for He
  - `tests/navigation.spec.js:3-13` - URL parameter test pattern

  **External References** (libraries and frameworks):
  - Playwright docs: page.evaluate() for inspecting window.context

  **Documentation References** (specs and requirements):
  - `src/data/elements.js:5-16` - Group color definitions including noble gases
  - `AGENTS.md` - Testing patterns

  **WHY Each Reference Matters**:
  - Helium data: Verify specific properties (atomicNumber: 2, nobleGas group, color: 0xFFE4E1)
  - NOBLE_GAS_COLORS: Validate that helium uses the correct noble gas color, not generic color
  - Room index: Helium is at ELEMENTS[1], so room index is ROOM_ELEMENTS_START + 1 = 2

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  ```
  Scenario: Test file created for Helium navigation
    Tool: Bash (file read)
    Preconditions: Task 2 completed (pattern established)
    Steps:
      1. Read tests/helium-room.spec.js lines 1-15
      2. Assert test uses: page.goto('/?room=He');
      3. Assert test waits for: await page.waitForLoadState('networkidle');
      4. Assert test evaluates: window.context.room to verify value is 2
    Expected Result: Test file exists with correct URL and room index
    Failure Indicators: File doesn't exist, wrong URL (?room=He), wrong room index (should be 2)
    Evidence: Test file content

  Scenario: Helium room navigation works
    Tool: Bash (npx playwright test)
    Preconditions: Dev server running
    Steps:
      1. Run: npx playwright test tests/helium-room.spec.js --reporter=line
      2. Assert exit code is 0
      3. Assert output contains: PASS
    Expected Result: Test passes
    Failure Indicators: Exit code non-zero, FAIL output
    Evidence: Test output

  Scenario: Helium element data loaded correctly
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running, He room loaded
    Steps:
      1. Run: npx playwright code http://localhost:3000/?room=He --eval "const scene = window.context.scenes[2]; scene.userData.elementData ? JSON.stringify({symbol:scene.userData.elementData.symbol, atomicNumber:scene.userData.elementData.atomicNumber, group:scene.userData.elementData.group}) : 'NO_DATA'"
      2. Assert output contains: "symbol":"He"
      3. Assert output contains: "atomicNumber":2
      4. Assert output contains: "group":"nobleGas"
    Expected Result: Helium data correct (He, atomicNumber 2, nobleGas group)
    Failure Indicators: NO_DATA, wrong symbol, wrong group
    Evidence: Playwright evaluation output

  Scenario: Noble gas color applied to Helium room
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running, He room loaded
    Steps:
      1. Run: npx playwright code http://localhost:3000/?room=He --eval "window.context.scenes[2].background.getHex()"
      2. Assert output is close to: 0xFFE4E1 (or multiplied by 0.15 for background)
      3. Calculate: 0xFFE4E1 = 16776801 in decimal, then multiply by themeColor multiplier
      4. Actually check: Background expects NOBLE_GAS_COLORS.He * 0.15 * 0.08 pattern from generic
      5. Run: npx playwright code http://localhost:3000/?room=He --eval "const bg = window.context.scenes[2].background; bg ? bg.getHexString() : 'NO_BG'"
      6. Assert color is present and not generic gray
    Expected Result: Background color using noble gas theme (not default gray)
    Failure Indicators: NO_BG, color is 0x2a2a3a (default gray)
    Evidence: Playwright color output
  ```

  **Evidence to Capture**:
  - [ ] Test file content (tests/helium-room.spec.js)
  - [ ] Playwright test output
  - [ ] Playwright evaluation showing elementData
  - [ ] Playwright evaluation showing background color

  **Commit**: YES (group with 1, 2, 4)
  - Message: `test: Add Helium room navigation test`
  - Files: `tests/helium-room.spec.js`
  - Pre-commit: `npx playwright test tests/helium-room.spec.js`

---

- [x] 4. Test ElementRoom with Iron (Transition Metal)

  **What to do**:
  - Create test file `tests/iron-room.spec.js`
  - Verify Iron room loads correctly via URL `?room=Fe`
  - Check that ElementRoom correctly looks up Fe element data
  - Verify transition metal color (GROUP_COLORS.transition = 0x74B9FF) is applied
  - Test that room works with transition metal element type (multiple electron shells)
  - Verify electron shells are correctly calculated (Fe has atomicNumber 26, shells: [2, 8, 18] = 28, but Fe needs 26, so [2, 8, 8, 8] or correct divisor pattern)

  **Must NOT do**:
  - Modify ElementRoom.js implementation
  - Create individual Fe.js room file

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single test file addition, follows existing patterns
  - **Skills**: `playwright`
    - Reason: Need Playwright for browser navigation testing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 3)
  - **Blocks**: 5-11
  - **Blocked By**: 1

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `tests/hydrogen-room.spec.js` - Task 2 test structure (adapt for Fe)
  - `tests/helium-room.spec.js` - Task 3 test structure (adapt for Fe)
  - `src/rooms/ElementRoom.js:80-124` - Electron shell creation logic (critical for Fe test)

  **API/Type References** (contracts to implement against):
  - `src/data/elements.js` - Find Iron element definition (symbol: 'Fe', atomicNumber: 26, transition group, mass: 55.845)
  - `src/data/elements.js:6` - Transition metal color: `GROUP_COLORS.transition = 0x74B9FF`
  - `src/index.js:49-51` - Room index calculation: Fe is at ELEMENTS[25], so room index is 26

  **Test References** (testing patterns to follow):
  - `tests/hydrogen-room.spec.js` - Task 2 test established pattern
  - `tests/helium-room.spec.js` - Task 3 test established pattern

  **External References** (libraries and frameworks):
  - Playwright docs: page.evaluate()
  - Three.js docs: scene.children API for traversing mesh hierarchy

  **Documentation References** (specs and requirements):
  - `src/rooms/AGENTS.md` - Room module structure requirements
  - `AGENTS.md` - Testing patterns

  **WHY Each Reference Matters**:
  - Electron shell logic (lines 80-124): Critical for verifying Fe displays correct electron count (26 electrons distributed across shells)
  - Fe element data: atomicNumber 26 means 26 electrons need to be in shells
  - Transition metal color: Verify 0x74B9FF is applied, not generic color

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  ```
  Scenario: Test file created for Iron navigation
    Tool: Bash (file read)
    Preconditions: Tasks 2-3 completed (pattern established)
    Steps:
      1. Read tests/iron-room.spec.js lines 1-15
      2. Assert test uses: page.goto('/?room=Fe');
      3. Assert test evaluates: window.context.room to verify value is 26
    Expected Result: Test file with correct URL and room index (Fe is index 25 in ELEMENTS, so room is 26)
    Failure Indicators: File missing, wrong room index
    Evidence: Test file content

  Scenario: Iron room navigation works
    Tool: Bash (npx playwright test)
    Preconditions: Dev server running
    Steps:
      1. Run: npx playwright test tests/iron-room.spec.js --reporter=line
      2. Assert exit code is 0
    Expected Result: Test passes
    Failure Indicators: Exit code non-zero
    Evidence: Test output

  Scenario: Iron element data loaded correctly
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running, Fe room loaded
    Steps:
      1. Run: npx playwright code http://localhost:3000/?room=Fe --eval "const ed = window.context.scenes[26].userData.elementData; ed ? JSON.stringify({symbol:ed.symbol, atomicNumber:ed.atomicNumber, mass:ed.mass, group:ed.group}) : 'NO_DATA'"
      2. Assert output contains: "symbol":"Fe"
      3. Assert output contains: "atomicNumber":26
      4. Assert output contains: "group":"transition"
    Expected Result: Fe data correct (symbol: Fe, atomicNumber: 26, transition group)
    Failure Indicators: NO_DATA, wrong values
    Evidence: Playwright evaluation output

  Scenario: Electron shells correctly calculated for Iron (26 electrons)
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running, Fe room loaded
    Steps:
      1. Run: npx playwright code http://localhost:3000/?room=Fe --eval "const atom = window.context.scenes[26].userData.atomModel; atom ? atom.children.filter(c => c.userData && c.userData.electron).length : 'NO_ATOM'"
      2. Assert value is 26 (exactly 26 electron meshes)
      3. Run: npx playwright code http://localhost:3000/?room=Fe --eval "const atom = window.context.scenes[26].userData.atomModel; atom ? atom.children.filter(c => c.userData && c.userData.shell).length : 'NO_ATOM'"
      4. Assert value is >= 3 (at least 3 electron shells for 26 electrons: 2+8+16 or similar)
    Expected Result: 26 electron meshes distributed across >=3 shells
    Failure Indicators: NO_ATOM, wrong electron count, not enough shells
    Evidence: Playwright output showing electron and shell counts

  Scenario: Transition metal color applied
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running, Fe room loaded
    Steps:
      1. Run: npx playwright code http://localhost:3000/?room=Fe --eval "window.context.scenes[26].background ? window.context.scenes[26].background.getHexString() : 'NO_BG'"
      2. Assert color is not generic 0x2a2a3a
      3. Assert color hue matches transition metal blue theme
    Expected Result: Background uses transition metal color (blue theme)
    Failure Indicators: NO_BG, default gray color
    Evidence: Playwright color output
  ```

  **Evidence to Capture**:
  - [ ] Test file content (tests/iron-room.spec.js)
  - [ ] Playwright test output
  - [ ] Playwright evaluation showing elementData
  - [ ] Playwright evaluation showing electron/shell counts (should be 26 electrons, >=3 shells)
  - [ ] Playwright evaluation showing background color

  **Commit**: YES (group with 1, 2, 3)
  - Message: `test: Add Iron room navigation test`
  - Files: `tests/iron-room.spec.js`
  - Pre-commit: `npx playwright test tests/iron-room.spec.js`

---

- [x] 5. Implement extreme_conditions Experimental Room

  **What to do**:
  - Create function `createExtremeConditions(ctx)` in `src/rooms/ExperimentalRoom.js`
  - Add case for 'extreme_conditions' to `createRoomSpecificSetup()` switch statement
  - Create 3D geometry representing extreme conditions (superfluid helium, plasma containment, high pressure chamber)
  - Use room color: `ROOM_COLORS.extreme_conditions = 0xFFA94D` (orange)
  - Add unique visual elements distinct from generic lab
  - Follow patterns from existing implementations (createAlchemistWorkshop, createNuclearControlRoom)

  **Must NOT do**:
  - Create separate room file (use existing ExperimentalRoom.js)
  - Add raycaster interactions (keep visual-only)
  - Modify room constants or registration logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single function addition to existing file, follows established patterns
  - **Skills**: None required (Three.js direct, no special skills)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7, 8, 9)
  - **Blocks**: 10, 11
  - **Blocked By**: 1, 2, 3, 4

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - `src/rooms/ExperimentalRoom.js:67-94` - createAlchemistWorkshop pattern (table, molecule display)
  - `src/rooms/ExperimentalRoom.js:96-120` - createNuclearControlRoom pattern (panel, cylinder core)
  - `src/rooms/ExperimentalRoom.js:11-22` - ROOM_COLORS constant definitions
  - `src/rooms/ExperimentalRoom.js:24-42` - setup function structure calling createRoomSpecificSetup

  **API/Type References** (contracts to implement against):
  - `src/data/elements.js:1876-1891` - extreme_conditions room definition (experiments: ['superfluid', 'plasma', 'highpressure'])
  - `src/rooms/ExperimentalRoom.js:11-13` - ROOM_COLORS: `extreme_conditions: 0xFFA94D`
  - `src/rooms/ExperimentalRoom.js:44-65` - createRoomSpecificSetup switch statement structure

  **Test References** (testing patterns to follow):
  - Tests will use URL navigation (`?room=extreme_conditions`) to verify room loads
  - Follow existing test patterns: `tests/navigation.spec.js`

  **External References** (libraries and frameworks):
  - Three.js docs: CylinderGeometry, SphereGeometry, MeshBasicMaterial
  - Three.js docs: Scene.add() for adding meshes

  **Documentation References** (specs and requirements):
  - `src/rooms/AGENTS.md` - Room setup function requirements
  - `AGENTS.md` - Room pattern: setup, enter, exit, execute exports

  **WHY Each Reference Matters**:
  - createAlchemistWorkshop: Follow same pattern (create geometry, add to scene, add metadata to scene.userData)
  - ROOM_COLORS.extreme_conditions: Use 0xFFA94D for theme color consistency
  - createRoomSpecificSetup: Must add case 'extreme_conditions' calling createExtremeConditions(ctx)

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  ```
  Scenario: Function createExtremeConditions added to file
    Tool: Bash (grep + read)
    Preconditions: Tasks 1-4 completed
    Steps:
      1. Run: grep "function createExtremeConditions" src/rooms/ExperimentalRoom.js
      2. Assert output contains: "function createExtremeConditions"
      3. Run: grep -A5 "function createExtremeConditions" src/rooms/ExperimentalRoom.js | head -6
      4. Assert function signature: function createExtremeConditions(ctx)
    Expected Result: Function definition exists with correct signature
    Failure Indicators: Function not found, wrong signature
    Evidence: Grep output showing function definition

  Scenario: Case added to createRoomSpecificSetup switch
    Tool: Bash (grep)
    Preconditions: createExtremeConditions function exists
    Steps:
      1. Run: grep -B2 -A2 "case 'extreme_conditions'" src/rooms/ExperimentalRoom.js
      2. Assert output contains: case 'extreme_conditions':
      3. Assert output contains: createExtremeConditions(ctx);
      4. Assert output contains: break;
    Expected Result: Switch case present calling createExtremeConditions
    Failure Indicators: Case not found, function call missing, break missing
    Evidence: Grep output showing switch case

  Scenario: Function creates Three.js geometry
    Tool: Bash (grep)
    Preconditions: Function and case exist
    Steps:
      1. Run: grep -A10 "function createExtremeConditions" src/rooms/ExperimentalRoom.js | grep "THREE\."
      2. Assert at least 2 THREE construction calls (e.g., THREE.SphereGeometry, THREE.Mesh)
      3. Run: grep "scene.add" src/rooms/ExperimentalRoom.js | tail -5
      4. Assert scene.add called within createExtremeConditions
    Expected Result: Function creates geometry and adds to scene
    Failure Indicators: No THREE.*Geometry calls, no scene.add call
    Evidence: Grep output showing THREE calls and scene.add

  Scenario: extreme_conditions room loads via URL
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running
    Steps:
      1. Run: npx playwright code http://localhost:3000/?room=extreme_conditions --eval "window.context.room"
      2. Assert output contains "119" (ROOM_EXP_START + 0)
      3. Run: npx playwright code http://localhost:3000/?room=extreme_conditions --eval "window.context.scenes[119].userData"
      4. Assert userData is not undefined
    Expected Result: Room index is 119, scene has userData
    Failure Indicators: Wrong room index, userData undefined
    Evidence: Playwright output

  Scenario: No console errors when loading extreme_conditions room
    Tool: Bash (grep server logs)
    Preconditions: Dev server running with logging
    Steps:
      1. Check server logs for: TypeError, undefined, createExtremeConditions errors
      2. Run: tail -50 /tmp/startup.log | grep -i error || echo "NO_ERRORS_IN_LOGS"
      3. Assert "NO_ERRORS_IN_LOGS" after room load
    Expected Result: No errors in logs
    Failure Indicators: TypeError about createExtremeConditions undefined
    Evidence: Grep output showing "NO_ERRORS_IN_LOGS"
  ```

  **Evidence to Capture**:
  - [ ] Grep output showing function definition
  - [ ] Grep output showing switch case
  - [ ] Grep output showing THREE geometry calls
  - [ ] Playwright output showing room index 119
  - [ ] Server logs showing no errors

  **Commit**: YES (group with 6, 7, 8, 9)
  - Message: `feat(experimental): Add extreme_conditions room setup`
  - Files: `src/rooms/ExperimentalRoom.js`
  - Pre-commit: `npx playwright code http://localhost:3000/?room=extreme_conditions --eval "window.context.room"`

---

- [x] 6. Implement industrial_apps Experimental Room

  **What to do**:
  - Create function `createIndustrialApps(ctx)` in `src/rooms/ExperimentalRoom.js`
  - Add case for 'industrial_apps' to `createRoomSpecificSetup()` switch statement
  - Create 3D geometry representing industrial chemistry applications (blast furnace, Haber-Bosch reactor)
  - Use room color: `ROOM_COLORS.industrial_apps = 0x74B9FF` (blue)
  - Add unique visual elements distinct from generic lab
  - Follow patterns from existing implementations (createAlchemistWorkshop, createNuclearControlRoom)

  **Must NOT do**:
  - Create separate room file
  - Add raycaster interactions
  - Modify room constants or registration logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single function addition, follows established patterns
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 7, 8, 9)
  - **Blocks**: 10, 11
  - **Blocked By**: 1, 2, 3, 4

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References**:
  - `src/rooms/ExperimentalRoom.js:67-94` - createAlchemistWorkshop pattern
  - `src/rooms/ExperimentalRoom.js:96-120` - createNuclearControlRoom pattern
  - `src/rooms/ExperimentalRoom.js:11-22` - ROOM_COLORS (industrial_apps: 0x74B9FF)

  **API/Type References**:
  - `src/data/elements.js:1892-1906` - industrial_apps room definition (experiments: ['haberbosch', 'blastfurnace', 'petrochemical'])
  - `src/rooms/ExperimentalRoom.js:44-65` - createRoomSpecificSetup switch structure

  **Test References**:
  - `tests/navigation.spec.js` - URL parameter test pattern

  **External References**:
  - Three.js docs: BoxGeometry, CylinderGeometry, MeshBasicMaterial

  **Documentation References**:
  - `src/rooms/AGENTS.md` - Room setup function requirements

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  ```
  Scenario: Function createIndustrialApps added
    Tool: Bash (grep)
    Preconditions: Tasks 1-4 completed
    Steps:
      1. Run: grep "function createIndustrialApps" src/rooms/ExperimentalRoom.js
      2. Assert output contains function definition
    Expected Result: Function exists
    Failure Indicators: Function not found
    Evidence: Grep output

  Scenario: Case added to switch statement
    Tool: Bash (grep)
    Preconditions: Function exists
    Steps:
      1. Run: grep -A2 "case 'industrial_apps'" src/rooms/ExperimentalRoom.js
      2. Assert contains: createIndustrialApps(ctx);
      3. Assert contains: break;
    Expected Result: Switch case present
    Failure Indicators: Case not found
    Evidence: Grep output

  Scenario: industrial_apps room loads via URL
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running
    Steps:
      1. Run: npx playwright code http://localhost:3000/?room=industrial_apps --eval "window.context.room"
      2. Assert output contains "120" (ROOM_EXP_START + 1)
    Expected Result: Room index is 120
    Failure Indicators: Wrong index or error
    Evidence: Playwright output

  Scenario: No errors loading industrial_apps room
    Tool: Bash (grep logs)
    Preconditions: Room loaded
    Steps:
      1. Run: grep -i "createIndustrialApps\|TypeError" /tmp/startup.log | tail -5
      2. Assert no TypeError about createIndustrialApps
    Expected Result: No errors
    Failure Indicators: TypeError or undefined function error
    Evidence: Grep output showing no errors
  ```

  **Evidence to Capture**:
  - [ ] Grep output showing function definition
  - [ ] Grep output showing switch case
  - [ ] Playwright output showing room index 120
  - [ ] Server logs showing no errors

  **Commit**: YES (group with 5, 7, 8, 9)
  - Message: `feat(experimental): Add industrial_apps room setup`
  - Files: `src/rooms/ExperimentalRoom.js`
  - Pre-commit: `npx playwright code http://localhost:3000/?room=industrial_apps --eval "window.context.room"`

---

- [x] 7. Implement historical_lab Experimental Room

  **What to do**:
  - Create function `createHistoricalLab(ctx)` in `src/rooms/ExperimentalRoom.js`
  - Add case for 'historical_lab' to `createRoomSpecificSetup()` switch statement
  - Create 3D geometry representing historical chemistry experiments (Marie Curie lab, Lavoisier setup)
  - Use room color: `ROOM_COLORS.historical_lab = 0xD63384` (purple)
  - Add unique visual elements distinct from generic lab
  - Follow patterns from existing implementations

  **Must NOT do**:
  - Create separate room file
  - Add raycaster interactions
  - Modify room constants or registration logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single function addition, follows established patterns
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 6, 8, 9)
  - **Blocks**: 10, 11
  - **Blocked By**: 1, 2, 3, 4

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References**:
  - `src/rooms/ExperimentalRoom.js:67-94` - createAlchemistWorkshop pattern
  - `src/rooms/ExperimentalRoom.js:11-22` - ROOM_COLORS (historical_lab: 0xD63384)

  **API/Type References**:
  - `src/data/elements.js:1907-1921` - historical_lab room definition (experiments: ['marie_curie', 'lavoisier', 'mendeleev'])
  - `src/rooms/ExperimentalRoom.js:44-65` - createRoomSpecificSetup switch structure

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  ```
  Scenario: Function createHistoricalLab added
    Tool: Bash (grep)
    Preconditions: Tasks 1-4 completed
    Steps:
      1. Run: grep "function createHistoricalLab" src/rooms/ExperimentalRoom.js
      2. Assert exists
    Expected Result: Function exists
    Failure Indicators: Not found
    Evidence: Grep output

  Scenario: Case added to switch
    Tool: Bash (grep)
    Preconditions: Function exists
    Steps:
      1. Run: grep -A2 "case 'historical_lab'" src/rooms/ExperimentalRoom.js
      2. Assert contains: createHistoricalLab(ctx);
    Expected Result: Case present
    Failure Indicators: Not found
    Evidence: Grep output

  Scenario: historical_lab room loads via URL
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running
    Steps:
      1. Run: npx playwright code http://localhost:3000/?room=historical_lab --eval "window.context.room"
      2. Assert output contains "121" (ROOM_EXP_START + 2)
    Expected Result: Room index is 121
    Failure Indicators: Wrong index
    Evidence: Playwright output

  Scenario: No errors loading historical_lab room
    Tool: Bash (grep logs)
    Preconditions: Room loaded
    Steps:
      1. Run: grep -i "TypeError\|createHistoricalLab" /tmp/startup.log | tail -3
      2. Assert no errors
    Expected Result: No errors
    Failure Indicators: TypeError
    Evidence: Grep output
  ```

  **Evidence to Capture**:
  - [ ] Grep output showing function definition
  - [ ] Grep output showing switch case
  - [ ] Playwright output showing room index 121
  - [ ] Server logs showing no errors

  **Commit**: YES (group with 5, 6, 8, 9)
  - Message: `feat(experimental): Add historical_lab room setup`
  - Files: `src/rooms/ExperimentalRoom.js`
  - Pre-commit: `npx playwright code http://localhost:3000/?room=historical_lab --eval "window.context.room"`

---

- [x] 8. Implement space_chem Experimental Room

  **What to do**:
  - Create function `createSpaceChem(ctx)` in `src/rooms/ExperimentalRoom.js`
  - Add case for 'space_chem' to `createRoomSpecificSetup()` switch statement
  - Create 3D geometry representing space chemistry (supernova environment, star nucleosynthesis scene)
  - Use room color: `ROOM_COLORS.space_chem = 0x0A0A1A` (dark space color)
  - Add unique visual elements distinct from generic lab (e.g., particle systems, star spheres)
  - Follow patterns from existing implementations

  **Must NOT do**:
  - Create separate room file
  - Add raycaster interactions
  - Modify room constants or registration logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single function addition, follows established patterns
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 6, 7, 9)
  - **Blocks**: 10, 11
  - **Blocked By**: 1, 2, 3, 4

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References**:
  - `src/rooms/ExperimentalRoom.js:96-120` - createNuclearControlRoom pattern (CylinderGeometry for reactor core - adapt for star)
  - `src/rooms/ExperimentalRoom.js:11-22` - ROOM_COLORS (space_chem: 0x0A0A1A)

  **API/Type References**:
  - `src/data/elements.js:1922-1936` - space_chem room definition (experiments: ['nucleosynthesis', 'meteorites', 'interstellar'])
  - `src/rooms/ExperimentalRoom.js:44-65` - createRoomSpecificSetup switch structure

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  ```
  Scenario: Function createSpaceChem added
    Tool: Bash (grep)
    Preconditions: Tasks 1-4 completed
    Steps:
      1. Run: grep "function createSpaceChem" src/rooms/ExperimentalRoom.js
      2. Assert exists
    Expected Result: Function exists
    Failure Indicators: Not found
    Evidence: Grep output

  Scenario: Case added to switch
    Tool: Bash (grep)
    Preconditions: Function exists
    Steps:
      1. Run: grep -A2 "case 'space_chem'" src/rooms/ExperimentalRoom.js
      2. Assert contains: createSpaceChem(ctx);
    Expected Result: Case present
    Failure Indicators: Not found
    Evidence: Grep output

  Scenario: space_chem room loads via URL
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running
    Steps:
      1. Run: npx playwright code http://localhost:3000/?room=space_chem --eval "window.context.room"
      2. Assert output contains "122" (ROOM_EXP_START + 3)
    Expected Result: Room index is 122
    Failure Indicators: Wrong index
    Evidence: Playwright output

  Scenario: No errors loading space_chem room
    Tool: Bash (grep logs)
    Preconditions: Room loaded
    Steps:
      1. Run: grep -i "TypeError\|createSpaceChem" /tmp/startup.log | tail -3
      2. Assert no errors
    Expected Result: No errors
    Failure Indicators: TypeError
    Evidence: Grep output
  ```

  **Evidence to Capture**:
  - [ ] Grep output showing function definition
  - [ ] Grep output showing switch case
  - [ ] Playwright output showing room index 122
  - [ ] Server logs showing no errors

  **Commit**: YES (group with 5, 6, 7, 9)
  - Message: `feat(experimental): Add space_chem room setup`
  - Files: `src/rooms/ExperimentalRoom.js`
  - Pre-commit: `npx playwright code http://localhost:3000/?room=space_chem --eval "window.context.room"`

---

- [x] 9. Implement nano_world Experimental Room

  **What to do**:
  - Create function `createNanoWorld(ctx)` in `src/rooms/ExperimentalRoom.js`
  - Add case for 'nano_world' to `createRoomSpecificSetup()` switch statement
  - Create 3D geometry representing nanoscale world (crystal lattice, atomic orbitals, carbon nanotube visualization)
  - Use room color: `ROOM_COLORS.nano_world = 0x17A2B8` (teal)
  - Add unique visual elements distinct from generic lab
  - Follow patterns from existing implementations

  **Must NOT do**:
  - Create separate room file
  - Add raycaster interactions
  - Modify room constants or registration logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single function addition, follows established patterns
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 6, 7, 8)
  - **Blocks**: 10, 11
  - **Blocked By**: 1, 2, 3, 4

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References**:
  - `src/rooms/ExperimentalRoom.js:136-166` - createCarbonUniverse pattern (TubeGeometry for helix - adapt for nanotube)
  - `src/rooms/ExperimentalRoom.js:11-22` - ROOM_COLORS (nano_world: 0x17A2B8)

  **API/Type References**:
  - `src/data/elements.js:1937-1951` - nano_world room definition (experiments: ['crystals', 'orbitals', 'nanotubes'])
  - `src/rooms/ExperimentalRoom.js:44-65` - createRoomSpecificSetup switch structure
  - `src/lib/modelLoader.js:184-205` - createCompoundDisplay function (for crystal lattice reference)

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  ```
  Scenario: Function createNanoWorld added
    Tool: Bash (grep)
    Preconditions: Tasks 1-4 completed
    Steps:
      1. Run: grep "function createNanoWorld" src/rooms/ExperimentalRoom.js
      2. Assert exists
    Expected Result: Function exists
    Failure Indicators: Not found
    Evidence: Grep output

  Scenario: Case added to switch
    Tool: Bash (grep)
    Preconditions: Function exists
    Steps:
      1. Run: grep -A2 "case 'nano_world'" src/rooms/ExperimentalRoom.js
      2. Assert contains: createNanoWorld(ctx);
    Expected Result: Case present
    Failure Indicators: Not found
    Evidence: Grep output

  Scenario: nano_world room loads via URL
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running
    Steps:
      1. Run: npx playwright code http://localhost:3000/?room=nano_world --eval "window.context.room"
      2. Assert output contains "123" (ROOM_EXP_START + 4)
    Expected Result: Room index is 123
    Failure Indicators: Wrong index
    Evidence: Playwright output

  Scenario: No errors loading nano_world room
    Tool: Bash (grep logs)
    Preconditions: Room loaded
    Steps:
      1. Run: grep -i "TypeError\|createNanoWorld" /tmp/startup.log | tail -3
      2. Assert no errors
    Expected Result: No errors
    Failure Indicators: TypeError
    Evidence: Grep output
  ```

  **Evidence to Capture**:
  - [ ] Grep output showing function definition
  - [ ] Grep output showing switch case
  - [ ] Playwright output showing room index 123
  - [ ] Server logs showing no errors

  **Commit**: YES (group with 5, 6, 7, 8)
  - Message: `feat(experimental): Add nano_world room setup`
  - Files: `src/rooms/ExperimentalRoom.js`
  - Pre-commit: `npx playwright code http://localhost:3000/?room=nano_world --eval "window.context.room"`

---

- [x] 10. Add URL Validation Guard

  **What to do**:
  - Add guard clause in `src/index.js` gotoRoom function or URL parameter handling
  - Validate that room parameter exists in ELEMENTS or EXPERIMENTAL_ROOMS before navigation
  - If invalid room ID, show user-friendly error message in console, stay in current room
  - Prevent crash from non-existent room like `?room=Zh` or `?room=NonExistent`
  - Add validation before calling `rooms[roomIndex].setup/enter` to prevent undefined errors

  **Must NOT do**:
  - Modify room indexing constants
  - Change room registration logic
  - Add heavy error handling infrastructure

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple guard clause addition to existing function
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 11)
  - **Blocks**: None
  - **Blocked By**: 1, 5, 6, 7, 8, 9

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References**:
  - `src/index.js:73-102` - gotoRoom function structure (add validation at start)
  - `src/index.js:312-338` - URL parameter handling section (add validation before navigation)

  **API/Type References**:
  - `src/data/elements.js` - ELEMENTS array, EXPERIMENTAL_ROOMS array for validation
  - `src/index.js:32` - Import: `import {ELEMENTS, EXPERIMENTAL_ROOMS} from './data/elements.js';`

  **Test References** (testing patterns to follow):
  - `tests/url-param.spec.js` - URL parameter test pattern (verify invalid room handling)

  **External References** (libraries and frameworks):
  - JavaScript MDN: console.warn(), console.error() for user feedback

  **Documentation References** (specs and requirements):
  - `AGENTS.md` - Error handling patterns: use console.warn() for recoverable errors

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  ```
  Scenario: Guard clause added to URL parameter handling
    Tool: Bash (grep + read)
    Preconditions: Tasks 1-9 completed
    Steps:
      1. Run: grep -n "if (roomName)" src/index.js | head -2
      2. Find URL parameter handling around line 312
      3. Run: grep -A20 "if (roomName)" src/index.js | grep -E "ELEMENTS\.findIndex|EXPERIMENTAL_ROOMS\.findIndex|console\.warn|Invalid"
      4. Assert validation check exists
      5. Assert console.warn called for invalid room
    Expected Result: Validation logic exists with error message
    Failure Indicators: No validation check, no console.warn
    Evidence: Grep output showing validation code

  Scenario: Invalid room ID shows error and stays in lobby
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running
    Steps:
      1. Run: npx playwright code "http://localhost:3000/?room=Zh" --eval "window.context.room"
      2. Assert output contains "0" (stays in lobby)
      3. Run: grep -i "invalid" /tmp/startup.log | tail -3 || echo "NO_INVALID_LOG"
      4. Assert logs contain "Invalid" or similar error message
    Expected Result: Room is still 0 (lobby), error message in logs
    Failure Indicators: Room changed to non-zero, no error message
    Evidence: Playwright output showing room=0, grep showing error log

  Scenario: Invalid room parameter doesn't crash server
    Tool: Bash (grep logs)
    Preconditions: Invalid room URL accessed
    Steps:
      1. Run: grep -i "TypeError: Cannot read properties of undefined" /tmp/startup.log | tail -3
      2. Assert NO TypeError about undefined room function
      3. Run: grep -i "rooms\[" /tmp/startup.log | grep -E "undefined|is not a function" || echo "NO_UNDEFINED_ROOM_ERROR"
      4. Assert "NO_UNDEFINED_ROOM_ERROR"
    Expected Result: No server crash, no TypeError about rooms array
    Failure Indicators: TypeError, rooms[undefined] error
    Evidence: Grep output showing no errors

  Scenario: Valid room IDs continue to work (regression test)
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running
    Steps:
      1. Run: npx playwright code "http://localhost:3000/?room=H" --eval "window.context.room"
      2. Assert output contains "1"
      3. Run: npx playwright code "http://localhost:3000/?room=Fe" --eval "window.context.room"
      4. Assert output contains "26"
    Expected Result: Valid rooms still navigate correctly
    Failure Indicators: Room not changing, validation breaking valid rooms
    Evidence: Playwright output showing correct room indices
  ```

  **Evidence to Capture**:
  - [ ] Grep output showing validation logic
  - [ ] Playwright output showing room stays at 0 for invalid URL
  - [ ] Server logs showing error message for invalid room
  - [ ] Server logs showing no TypeError crash
  - [ ] Playwright output showing valid rooms still work

  **Commit**: YES (group with 11)
  - Message: `fix(router): Add URL validation for room parameter`
  - Files: `src/index.js`
  - Pre-commit: `npx playwright code "http://localhost:3000/?room=InvalidRoom" --eval "window.context.room"`

---

- [x] 11. Verify VR Mode Safety (Enter/Exit Exports)

  **What to do**:
  - Verify that all room modules (Lobby, ElementRoom, ExperimentalRoom) export all 4 functions: setup, enter, exit, execute
  - If any missing exports detected, add placeholder functions to prevent VR mode toggle crash
  - Create test verifying VR mode toggle doesn't crash due to missing exports
  - Ensure `index.js` VR mode toggle (lines 299-302) can safely call enter/exit on all room types

  **Must NOT do**:
  - Modify VR mode toggle logic itself
  - Change room indexing
  - Add complex VR controller interaction logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification task, potential minor function additions
  - **Skills**: `playwright`
    - Reason: Need Playwright to test VR mode state changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 10)
  - **Blocks**: None
  - **Blocked By**: 1, 5, 6, 7, 8, 9

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References**:
  - `src/index.js:298-302` - VR mode toggle calling rooms[].exit and rooms[].enter
  - `src/rooms/Lobby.js` - Verify has export function setup, export function enter, export function exit, export function execute
  - `src/rooms/ElementRoom.js:17-50` - Verify setup, enter, exit, execute exports
  - `src/rooms/ExperimentalRoom.js:24-42` - Verify setup, enter, exit, execute exports

  **API/Type References**:
  - All room modules MUST export 4 functions following pattern:
  ```javascript
  export function setup(ctx, param) { }
  export function enter(ctx, param) { }
  export function exit(ctx, param) { }
  export function execute(ctx, delta, time, param) { }
  ```

  **Test References** (testing patterns to follow):
  - `tests/navigation.spec.js:39-50` - VR mode verification test pattern (modify to check exports)

  **Documentation References** (specs and requirements):
  - `src/rooms/AGENTS.md` - Room pattern: Export 4 functions
  - `AGENTS.md` - Testing patterns for window.context inspection

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  ```
  Scenario: All room modules export 4 required functions
    Tool: Bash (grep + check)
    Preconditions: Tasks 1-10 completed
    Steps:
      1. For each room file, check all 4 exports exist
      2. Run for Lobby.js:
         grep -E "export function (setup|enter|exit|execute)" src/rooms/Lobby.js | wc -l
         Assert count is 4
      3. Run for ElementRoom.js:
         grep -E "export function (setup|enter|exit|execute)" src/rooms/ElementRoom.js | wc -l
         Assert count is 4
      4. Run for ExperimentalRoom.js:
         grep -E "export function (setup|enter|exit|execute)" src/rooms/ExperimentalRoom.js | wc -l
         Assert count is 4
    Expected Result: All 3 files have exactly 4 function exports
    Failure Indicators: Any file missing exports
    Evidence: Grep count output for each file

  Scenario: VR mode toggle doesn't crash with valid room
    Tool: Bash (npx playwright code + grep logs)
    Preconditions: Dev server running, room loaded
    Steps:
      1. Load a room (e.g., Hydrogen): npx playwright code http://localhost:3000/?room=H
      2. Wait for room setup to complete
      3. Simulate VR mode toggle in code:
         npx playwright code http://localhost:3000/?room=H --eval "typeof window.context.rooms[1].exit === 'function' && typeof window.context.rooms[1].enter === 'function'"
      4. Assert output contains "true"
      5. Check server logs for no errors during simulate:
         grep -i "TypeError.*rooms\[1\].enter\|rooms\[1\].exit" /tmp/startup.log || echo "NO_VR_ERROR"
      6. Assert "NO_VR_ERROR"
    Expected Result: room[1].enter and room[1].exit are functions, no errors in logs
    Failure Indicators: Functions undefined, TypeError in logs
    Evidence: Playwright output showing functions exist, grep showing no errors

  Scenario: VR mode safe for all room types (Lobby, Element, Experimental)
    Tool: Bash (npx playwright code)
    Preconditions: Dev server running
    Steps:
      1. Test Lobby (0):
         npx playwright code http://localhost:3000 --eval "typeof window.context.rooms[0].enter === 'function'"
         Assert true
      2. Test Element room (1-118, test 1 and 26):
         npx playwright code http://localhost:3000/?room=H --eval "typeof window.context.rooms[1].exit === 'function'"
         Assert true
      3. Test Experimental room (119-128, test 119 and 123):
         npx playwright code http://localhost:3000/?room=nano_world --eval "typeof window.context.rooms[123].enter === 'function'"
         Assert true
    Expected Result: All tested room indices have enter/exit functions
    Failure Indicators: Any room index missing functions
    Evidence: Playwright output for each test

  Scenario: Create test file for VR mode safety verification
    Tool: Bash (file read + grep)
    Preconditions: Verified exports exist
    Steps:
      1. Create tests/vr-mode-safety.spec.js (or similar)
      2. Read first 20 lines: should verify all room exports present
      3. Assert test uses page.evaluate() to check typeof room[index].enter
      4. Assert test checks multiple room types (0, 1, 119)
    Expected Result: Test file exists checking VR mode safety
    Failure Indicators: Test file not created, doesn't verify exports
    Evidence: Test file content
  ```

  **Evidence to Capture**:
  - [ ] Grep count output for each file showing 4 exports
  - [ ] Playwright output showing room[1].enter and .exit are functions
  - [ ] Server logs showing no VR mode errors
  - [ ] Playwright output for multiple room types (0, 1, 123)
  - [ ] Test file content (tests/vr-mode-safety.spec.js)

  **Commit**: YES (group with 10)
  - Message: `test: Verify VR mode safety and room exports`
  - Files: `tests/vr-mode-safety.spec.js` (if any missing exports also add to respective room .js)
  - Pre-commit: `npx playwright test tests/vr-mode-safety.spec.js`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(index): Add missing lobby room registration` | src/index.js | npm test |
| 2-4 | `test: Add element room navigation tests (H, He, Fe)` | tests/hydrogen-room.spec.js, tests/helium-room.spec.js, tests/iron-room.spec.js | npm test (tests/hydrogen-room, tests/helium-room, tests/iron-room) |
| 5-9 | `feat(experimental): Add missing experimental room setups` | src/rooms/ExperimentalRoom.js | npx playwright code for each room |
| 10 | `fix(router): Add URL validation for room parameter` | src/index.js | npx playwright code with invalid room |
| 11 | `test: Verify VR mode safety and room exports` | tests/vr-mode-safety.spec.js | npx playwright test tests/vr-mode-safety.spec.js |

---

## Success Criteria

### Verification Commands
```bash
# 1. Verify lobby assignment
grep "rooms\[ROOM_LOBBY\] = roomLobby" src/index.js

# 2. Test element rooms
npx playwright test tests/hydrogen-room.spec.js tests/helium-room.spec.js tests/iron-room.spec.js --reporter=line

# 3. Test experimental rooms
for room in extreme_conditions industrial_apps historical_lab space_chem nano_world; do
  npx playwright code "http://localhost:3000/?room=$room" --eval "window.context.room"
done

# 4. Test invalid URL
npx playwright code "http://localhost:3000/?room=InvalidRoom" --eval "window.context.room"

# 5. Verify all room exports
for file in Lobby ElementRoom ExperimentalRoom; do
  echo "Checking $file.js exports:"
  grep -E "export function (setup|enter|exit|execute)" "src/rooms/$file.js"
done

# 6. Run all tests
npm test
```

### Final Checklist
- [x] Lobby room assignment fix applied
- [x] Hydrogen room test passes (room index 1)
- [x] Helium room test passes (room index 2)
- [x] Iron room test passes (room index 26, 26 electrons, >=3 shells)
- [x] All 5 new experimental rooms load via URL
- [x] All 10 experimental rooms have unique implementations (switch case coverage 100%)
- [x] Invalid room URL shows error, stays in lobby (index 0)
- [x] All 3 room modules export 4 functions (setup, enter, exit, execute)
- [x] VR mode toggle verified safe
- [x] All existing tests still pass
- [x] Server starts without console errors
- [x] No individual element room files created (generic pattern maintained)