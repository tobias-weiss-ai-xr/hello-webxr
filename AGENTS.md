# PSE in VR - Virtuelles Periodensystem

WebXR-basiertes virtuelles Periodensystem mit 118 Element-Räumen und 10 Experimentierräumen.

**Stack:** Babylon.js (3D + GUI), TypeScript (strict), Vite (build), Playwright (e2e tests)
**Production URL:** https://pse.chemie-lernen.org
**Deploy branch:** `pse-in-vr`

> **Migration note:** This project migrated from Three.js/Webpack/ECSY to Babylon.js/Vite/TypeScript. Old README and package.json still reference the original "hello-webxr" demo — trust what's in `src/`, not the README.

---

## COMMANDS

```bash
# Setup (needs --legacy-peer-deps due to stale peer deps in package.json)
npm install --legacy-peer-deps

# Development (HTTPS required for WebXR, port 3000)
npm run dev              # Vite dev server at https://localhost:3000

# Build (type-checks first, then Vite build)
npm run build            # tsc --noEmit && vite build → dist/

# Testing
npm test                 # All Playwright tests (sequential, 1 worker)
npx playwright test tests/navigation.spec.ts       # Single test file
npx playwright test navigation.spec.ts:10          # Specific test by line
npx playwright test -g "test name"                 # By test name
npm run test:headed       # Headed mode (browser visible)
```

**CI test workflow** uses Node 20, runs `build` then `test`. **CI deploy** uses Node 18, deploys `dist/` to GitHub Pages from `pse-in-vr` branch.

---

## PROJECT STRUCTURE

```
src/
├── index.ts          # Entry point — engine init, room registration, render loop
├── types/index.ts    # All TypeScript interfaces (AppContext, RoomModule, ElementData, etc.)
├── data/elements.ts  # Element data (118 elements), GROUP_COLORS, EXPERIMENTAL_ROOMS
├── lib/
│   ├── AssetLoader.ts   # glTF/GLB/texture loading via Babylon SceneLoader
│   ├── AudioManager.ts  # Procedural audio + spatial sounds (Web Audio API)
│   └── ColorUtils.ts
├── rooms/
│   ├── RoomManager.ts   # Room registry, setup/enter/exit lifecycle, mesh disposal
│   ├── Lobby.ts         # Room 0 — periodic table hologram, element buttons
│   ├── ElementRoom.ts   # Rooms 1-118 — atom visualization per element
│   └── ExperimentalRoom.ts  # Rooms 119+ — experiment rooms
└── vendor/              # Binary vendor files (Basis, Draco transcoders — do not edit)

tests/                  # Playwright e2e tests (.spec.ts)
assets/                 # 3D models (.glb), textures (.png)
index.html              # Vite entry point (<script type="module" src="/src/index.ts">)
```

**Path alias:** `@/` → `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`)

---

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Entry point, room registration, render loop | `src/index.ts` |
| All type definitions (AppContext, RoomModule, etc.) | `src/types/index.ts` |
| Room lifecycle (setup/enter/exit/execute) | `src/rooms/*.ts` |
| Room index constants (ROOM_LOBBY, ROOM_ELEMENTS_START) | `src/rooms/RoomManager.ts` |
| Element data, group colors, experimental rooms | `src/data/elements.ts` |
| Asset loading | `src/lib/AssetLoader.ts` |
| Audio (procedural sounds, ambience) | `src/lib/AudioManager.ts` |
| 3D model loading | Babylon `SceneLoader.ImportMeshAsync` in `src/lib/AssetLoader.ts` |

---

## ARCHITECTURE

### Room System

All room modules export 4 functions matching the `RoomModule` interface (`src/types/index.ts`):

```typescript
export function setup(ctx: AppContext, param?: string): void;    // Called once per room index
export function enter(ctx: AppContext, param?: string): void;    // Show room, attach UI
export function exit(ctx: AppContext): void;                     // Hide room, dispose meshes
export function execute(ctx: AppContext, delta: number, time: number): void;  // Per-frame updates
```

- `RoomManager` tracks all created meshes/nodes per room and disposes them on exit
- `setup()` is called once and cached; `enter()`/`exit()` are called on every navigation
- Room modules use `ctx.trackMesh()` and `ctx.trackNode()` to register disposables

### Room Indices

```
0           = Lobby (ROOM_LOBBY)
1–118       = Element rooms (ROOM_ELEMENTS_START through ROOM_ELEMENTS_START + 117)
119+        = Experimental rooms
```

Navigation via URL: `/?room=H` (element symbol) or `/?room=reaction_lab` (room ID)

### AppContext (`ctx`)

Passed to all room functions. Full definition in `src/types/index.ts`:

```typescript
scene, engine, camera, xr          // Babylon.js core
room: number                       // Current room index
vrMode: boolean                    // true when in WebXR session
goto: number | null                // Set to trigger room change in next frame
GotoRoom(index, symbol?, expId?)   // Programmatic navigation
assets: Record<string, any>        // Loaded asset results
trackMesh(mesh), trackNode(node)   // Register disposables with RoomManager
```

Runtime state accessible in tests via `(window as any).context`.

---

## CODE CONVENTIONS

**Language:** TypeScript with `strict: true` (`tsconfig.json`). No `as any` suppression.

**Imports:** Always include `.js` extension for relative paths (Vite ESM resolution):
```typescript
import { Engine } from '@babylonjs/core/Engines/engine.js';
import type { AppContext } from '../types/index.js';
```

**Babylon.js imports:** Use deep path imports with `.js` extension (tree-shakeable):
```typescript
// CORRECT — tree-shakeable deep imports
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';

// WRONG — barrel imports (bundles entire library)
import * as BABYLON from '@babylonjs/core';
```

**Module-level state:** Rooms use module-scoped `let` variables for scene objects (Babylon convention — meshes belong to the scene, not class instances).

**Unused params:** Prefix with underscore: `(_ctx: AppContext, _delta: number)`

---

## TESTING

Tests are Playwright e2e, inspect `window.context` for runtime state:

```typescript
// Helper pattern used across test files
async function waitForApp(page) {
  await page.waitForFunction(
    () => (window as any).context?.engine && (window as any).context?.room !== undefined,
    { timeout: 30000 }
  );
}

test('example', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);
  const room = await page.evaluate(() => (window as any).context.room);
  expect(room).toBe(0);
});
```

**Test config:** `fullyParallel: false`, `workers: 1` (sequential execution). `ignoreHTTPSErrors: true`. CI retries 2x.

**Test files:** `tests/navigation.spec.ts`, `tests/loading.spec.ts`, `tests/keyboard-controls.spec.ts`, `tests/assets.spec.ts`, `tests/error-resilience.spec.ts`

---

## ANTI-PATTERNS

- **Three.js imports** — project uses Babylon.js exclusively. `three` is in package.json but unused in source.
- **Barrel imports from `@babylonjs/core`** — use deep path imports for tree-shaking.
- **`as any` type suppression** — strict TypeScript, no escapes.
- **Direct `three/examples/jsm/...` imports** — doesn't apply here, but don't introduce Three.js.
- **Editing `src/vendor/`** — binary transcoder files, not source code.
- **Assuming ESY/ECS patterns** — ECSY was removed; rooms are plain module exports, not ECS components.
- **Hardcoded room indices** — use `ROOM_LOBBY` and `ROOM_ELEMENTS_START` from `RoomManager.ts`.
