# PSE in VR - Virtuelles Periodensystem

WebXR-basiertes virtuelles Periodensystem mit 118 Element-Räumen und 10 Experimentierräumen. Immersives Chemie-Lernerlebnis.

**Stack:** Three.js (3D), ECSY (ECS), Playwright (tests), Webpack (build), WebXR Polyfill

---

## COMMANDS

```bash
# Development
npm install
npm start              # HTTPS dev server at :8080

# Build
npm run build          # Production bundle
npm run watch          # Watch mode

# Testing
npm test               # All Playwright tests
npx playwright test tests/navigation.spec.js    # Single test file
npx playwright test navigation.spec.js:10       # Specific test by line
npx playwright test -g "test name"             # By test name
npm run test:ui        # Browser UI
npm run test:headed    # Headed mode

# Shaders (if modifying .vert/.frag files)
python packshaders.py [seconds]  # Repack into src/lib/shaders.js
```

---

## STRUCTURE

```
src/
├── data/         # Element data & room definitions (ELEMENTS, EXPERIMENTAL_ROOMS)
├── lib/          # Core libraries (RayControl, Teleport, assetManager, shaders)
├── systems/      # ECSY entity-component systems
├── rooms/        # VR room modules (Lobby, ElementRoom, ExperimentalRoom)
├── stations/     # Legacy: Interactive stations within rooms
└── components/   # ECSY component definitions

tests/            # Playwright e2e tests (inspect window.context)
assets/           # 3D models, textures, sounds
shaders/          # GLSL shader sources
```

---

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Entry point, room navigation | `src/index.js` |
| Interaction system | `src/lib/RayControl.js` |
| Room logic (setup/enter/exit/execute) | `src/rooms/*.js` |
| ECS components | `src/components/index.js` |
| Asset loading | `src/lib/assetManager.js` |
| Element data | `src/data/elements.js` |
| 3D models | `src/lib/modelLoader.js` |
| Audio system | `src/lib/AudioManager.js` |

---

## CODE STYLE

**Module exports:**
- Classes: `export default class MyClass { }`
- Functions: `export function myFunc() { }` or named exports `{ myFunc }`
- Data: `export const MY_CONSTANT = value;`

**Imports:** Always use `.js` extension for relative paths:
```javascript
import * as THREE from 'three';
import RayControl from '../lib/RayControl.js';
import { ELEMENTS, GROUP_COLORS } from '../data/elements.js';
import { Text, Position, Object3D } from '../components/index.js';
```

**Variable declarations:**
- `var` for module-scoped variables (traditional pattern here)
- `const` for constants
- `let` for block-scoped variables

**Naming:**
- Classes: PascalCase (`RayControl`, `Teleport`)
- Functions: camelCase (`createAtomModel`, `setupLighting`)
- Constants: UPPER_SNAKE_CASE (`ROOM_LOBBY`, `ELEMENT_COLORS`)
- Module variables: camelCase with `var` (`scene`, `elementData`)

**Error handling:**
- Never use empty catch blocks
- Use `console.warn()` for recoverable errors
- Use `console.error()` for critical issues

**Three.js patterns:**
- Scene: `new THREE.Scene()`
- Meshes: `new THREE.Mesh(geometry, material)`
- Materials: Use proper properties (`color`, `metalness`, `roughness`, `emissive`, `opacity`)
- Vector3: `new THREE.Vector3(x, y, z)`, `set()`, `copy()`

---

## ROOM PATTERNS

All room modules export 4 functions:

```javascript
export function setup(ctx, param) {
  // param = elementSymbol (for ElementRoom) or roomId (for ExperimentalRoom)
  scene = new THREE.Scene();
  ctx.raycontrol.addState('name', {...});
}

export function enter(ctx, param) {
  ctx.scene.add(scene);
  ctx.raycontrol.activateState('name');
}

export function exit(ctx, param) {
  ctx.raycontrol.deactivateState('name');
  ctx.scene.remove(scene);
}

export function execute(ctx, delta, time, param) {
  // Update animations
  material.uniforms.time.value = time;
}
```

---

## ROOM NAVIGATION

```javascript
// Room indices:
// 0 = Lobby
// 1-22 = Element rooms (H, He, Li, Be, B, C, N, O, F, Ne, Na, Mg, Al, Si, P, S, Cl, Ar, Ca, Fe, Cu, Au, U)
// 23+ = Experimental rooms

// Direct navigation via URL:
// http://localhost:8080/?room=H  (Go to Hydrogen room)
// http://localhost:8080/?room=0  (Go to lobby)

// In src/index.js:
context.goto = roomIndex;  // Triggers room change
```

---

## CONTEXT OBJECT (`ctx`)

Passed to all room functions and classes:
- `ctx.scene`, `ctx.renderer`, `ctx.camera`
- `ctx.world` (ECSY), `ctx.raycontrol`, `ctx.teleport`
- `ctx.assets`, `ctx.shaders`, `ctx.audioListener`
- `ctx.GotoRoom` - Function reference for room navigation
- `ctx.cameraRig`, `ctx.controllers`, `ctx.handedness`
- `ctx.vrMode` - Boolean, true when in WebXR mode

---

## ANTI-PATTERNS

- Direct `three/examples/jsm/...` imports - use established patterns from `src/lib/`
- Empty catch blocks - use `console.warn()` at minimum
- Assuming TypeScript - this is pure JavaScript
- Hardcoded room indices - use ROOM_LOBBY, ROOM_ELEMENTS_START constants

**Known workarounds** (preserve):
- Oculus Browser <8 controller event skips (`@FIXME` in `src/index.js`)

---

## TESTING

Tests use Playwright, inspect `window.context` for runtime state:
```javascript
test('example test', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const room = await page.evaluate(() => window.context.room);
  expect(room).toBe(0);
});
```

---

## PERFORMANCE

- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` caps at 2x
- Asset loading via `assetManager.js` with progress callbacks
- ECSY systems for efficient entity updates
