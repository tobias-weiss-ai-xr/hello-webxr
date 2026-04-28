# Babylon.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Three.js + ECSY + Webpack stack with Babylon.js + Vite while preserving all 118 element rooms, 10 experimental rooms, and the lobby.

**Architecture:** Single Babylon.js scene with room sub-graphs (TransformNodes). Room pattern preserved: setup/enter/exit/execute. WebXR via `createDefaultXRExperienceAsync()`. Tree-shakeable imports from `@babylonjs/core/...`. Desktop fallback via ArcRotateCamera. Vite + HTTPS dev server.

**Tech Stack:** Babylon.js 7 (@babylonjs/core, @babylonjs/gui, @babylonjs/loaders), Vite 6, TypeScript, Playwright (tests preserved)

**Key Decisions:**
- TypeScript for type safety (Babylon.js is TypeScript-first)
- Single scene approach (dispose/add room meshes, not separate scenes)
- GUI via `@babylonjs/gui` (AdvancedDynamicTexture for VR overlay)
- No ECS (Babylon.js doesn't need it — direct scene graph management)
- Drop service worker, WebXR polyfill, ECSY
- Reuse `src/data/elements.js` as-is (framework-agnostic)
- Reuse `assets/` folder (3D models, textures)

---

## File Structure

```
src/
├── index.ts                 # Entry point (rewritten from index.js)
├── data/
│   └── elements.ts          # Copied from elements.js, add type exports
├── rooms/
│   ├── Lobby.ts             # Rewritten from Lobby.js
│   ├── ElementRoom.ts       # Rewritten from ElementRoom.js
│   ├── ExperimentalRoom.ts  # Rewritten from ExperimentalRoom.js
│   └── RoomManager.ts       # NEW: Room registration, setup/enter/exit/execute orchestration
├── lib/
│   ├── RayControl.ts        # Rewritten (Babylon ray + ActionManager)
│   ├── Teleport.ts          # REPLACED by Babylon built-in teleportation
│   ├── AudioManager.ts      # Rewritten (Babylon Sound class)
│   ├── AssetLoader.ts       # Rewritten (SceneLoader.ImportMeshAsync)
│   └── ColorUtils.ts        # Rewritten (or use Babylon.Color3)
├── types/
│   └── index.ts             # NEW: Shared interfaces (RoomModule, Context, etc.)
├── vendor/                  # Preserved (existing vendor files)
└── assets.ts                # Asset manifest (rewritten for Babylon paths)

tests/                       # Preserved, updated for Babylon
assets/                      # Preserved as-is
```

**Files to DELETE (no replacement needed):**
- `src/components/` — ECSY components, replaced by Babylon scene graph
- `src/systems/` — ECSY systems, replaced by Babylon built-ins
- `src/lib/shaders.js` — Replace with Babylon ShaderMaterial if needed
- `src/lib/VRButton.js` — Babylon has built-in XR helpers
- `src/lib/ParticleSys.js` — Babylon has built-in particle system
- `src/lib/slideshow.js` — Rewrite inline if needed
- `src/lib/EventDispatcher.js` — Use Babylon Observable pattern
- `src/lib/VoiceCommander.js` — Was disabled, drop
- `src/lib/PositionalAudioPolyphonic.js` — Three.js specific
- `sw.js` — No service worker
- `webpack.config.js` — Replaced by Vite
- `.babelrc` / `babel.config.js` — Vite handles transpilation

---

### Task 1: Scaffold Vite + Babylon.js project

**Files:**
- Create: `package.json` (overwrite)
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html` (overwrite — Vite entry)
- Delete: `webpack.config.js`, `.babelrc`

- [ ] **Step 1: Install new dependencies**

Run:
```bash
cd /opt/git/hello-webxr
# Remove old deps
rm -rf node_modules package-lock.json
# Install new stack
npm init -y
npm install @babylonjs/core @babylonjs/gui @babylonjs/loaders
npm install -D typescript vite @vitejs/plugin-basic-ssl @playwright/test
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'path';

export default defineConfig({
  plugins: [basicSsl()],
  root: '.',
  publicDir: 'assets',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          babylon: ['@babylonjs/core', '@babylonjs/gui', '@babylonjs/loaders']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    https: true
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.png', '**/*.jpg']
});
```

- [ ] **Step 4: Update package.json scripts**

Replace scripts section:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "playwright test",
    "test:headed": "playwright test --headed"
  }
}
```

- [ ] **Step 5: Create new index.html (Vite entry)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="description" content="Interaktives virtuelles Periodensystem für die Chemie. Erforsche alle 118 Elemente in 3D mit VR-Unterstützung.">
  <meta name="theme-color" content="#1a1a2e">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://pse.chemie-lernen.org">
  <meta property="og:title" content="PSE in VR - Virtuelles Periodensystem">
  <meta property="og:description" content="Interaktives virtuelles Periodensystem für die Chemie. Erforsche alle 118 Elemente in 3D mit VR-Unterstützung.">
  <meta property="og:locale" content="de_DE">
  <meta name="twitter:card" content="summary_large_image">
  <title>PSE in VR - Virtuelles Periodensystem</title>
  <style>
    body { margin: 0; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #loading { z-index: 9999; position: absolute; width: 100vw; height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); display: flex; align-items: center; justify-content: center; }
    #loading h1 { color: white; font-size: 6rem; margin: 1rem; }
    .hidden { display: none; }
    #no-webgl { padding: 20px; text-align: center; }
    #renderCanvas { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
  <div id="loading"><h1>Hello!</h1></div>
  <div id="no-webgl" class="hidden">
    <h2>WebGL Not Available</h2>
    <p>Your browser doesn't support WebGL. Please use a modern browser.</p>
  </div>
  <canvas id="renderCanvas"></canvas>
  <script type="module" src="/src/index.ts"></script>
</body>
</html>
```

- [ ] **Step 6: Verify dev server starts**

Run: `npx vite`
Expected: HTTPS server at https://localhost:3000, no errors

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + Babylon.js + TypeScript project"
```

---

### Task 2: Define TypeScript interfaces and types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create type definitions**

```typescript
import type { Scene, Camera, TransformNode, AbstractMesh } from '@babylonjs/core';

/** Room lifecycle interface — every room must export these 4 functions */
export interface RoomModule {
  setup(ctx: AppContext, param?: string): void;
  enter(ctx: AppContext, param?: string): void;
  exit(ctx: AppContext): void;
  execute(ctx: AppContext, delta: number, time: number): void;
}

/** Shared application context passed to all rooms */
export interface AppContext {
  scene: Scene;
  engine: import('@babylonjs/core').Engine;
  camera: Camera;
  xr: import('@babylonjs/core/XR/webXRDefaultExperience').WebXRDefaultExperience | null;
  room: number;
  vrMode: boolean;
  roomRoot: TransformNode;  // Parent for current room's meshes
  handedness: 'left' | 'right';
  goto: number | null;
  GotoRoom: (roomIndex: number, elementSymbol?: string, expRoomId?: string) => void;
  assets: Record<string, any>;
}

/** Raycast interaction state (replaces RayControl states) */
export interface InteractionState {
  name: string;
  meshes: AbstractMesh[];
  onHoverStart?: (mesh: AbstractMesh) => void;
  onHoverEnd?: (mesh: AbstractMesh) => void;
  onSelectStart?: (mesh: AbstractMesh) => void;
  onSelectEnd?: (mesh: AbstractMesh) => void;
}

/** Element data shape (matches existing elements.js export) */
export interface ElementData {
  symbol: string;
  name: string;
  nameDE?: string;
  atomicNumber: number;
  mass: number;
  group: string;
  period: number;
  color: string;
  description: string;
  descriptionDE?: string;
  theme?: string;
  experiments?: string[];
}

/** Experimental room data shape */
export interface ExperimentalRoomData {
  id: string;
  name: string;
  nameDE?: string;
  description: string;
  descriptionDE?: string;
  elements?: string[];
  difficulty?: string;
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No errors (only this file exists in src/)

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript interfaces for rooms, context, elements"
```

---

### Task 3: Port element data

**Files:**
- Create: `src/data/elements.ts`
- Source: `src/data/elements.js` (copy and add type annotations)

- [ ] **Step 1: Copy elements.js to elements.ts with types**

Copy the entire contents of `src/data/elements.js` to `src/data/elements.ts`. Add this import at the top:

```typescript
import type { ElementData, ExperimentalRoomData } from '../types/index.js';

// Type annotations for existing exports
export const ELEMENTS: ElementData[] = [
  // ... existing element data unchanged
];

export const EXPERIMENTAL_ROOMS: ExperimentalRoomData[] = [
  // ... existing room data unchanged
];

export const GROUP_COLORS: Record<string, number> = {
  // ... existing data unchanged
};

export const NOBLE_GAS_COLORS: Record<string, number> = {
  // ... existing data unchanged
};
```

The data values themselves remain **identical** — only the file extension and type annotations change.

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: Possible type errors on individual element objects (missing optional fields) — fix by making optional fields truly optional or adding defaults.

- [ ] **Step 3: Commit**

```bash
git add src/data/elements.ts
git commit -m "feat: port element data to TypeScript with type annotations"
```

---

### Task 4: Create RoomManager

**Files:**
- Create: `src/rooms/RoomManager.ts`

- [ ] **Step 1: Write RoomManager**

```typescript
import type { AppContext, RoomModule } from '../types/index.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';

export const ROOM_LOBBY = 0;
export const ROOM_ELEMENTS_START = 1;

export class RoomManager {
  private rooms: (RoomModule | null)[] = [];
  private setupCalledRooms = new Set<number>();
  private roomRoot: TransformNode;
  private _currentRoomIndex = 0;

  constructor(
    private scene: import('@babylonjs/core').Scene
  ) {
    this.roomRoot = new TransformNode('roomRoot', this.scene);
  }

  get currentRoomIndex(): number {
    return this._currentRoomIndex;
  }

  get roomCount(): number {
    return this.rooms.length;
  }

  registerRoom(index: number, room: RoomModule): void {
    this.rooms[index] = room;
  }

  getRoom(index: number): RoomModule | null {
    return this.rooms[index] ?? null;
  }

  setupRoom(index: number, ctx: AppContext, param?: string): void {
    const room = this.rooms[index];
    if (!room) {
      console.error(`No room registered at index ${index}`);
      return;
    }
    if (!this.setupCalledRooms.has(index)) {
      room.setup(ctx, param);
      this.setupCalledRooms.add(index);
    }
  }

  enterRoom(index: number, ctx: AppContext, param?: string): void {
    const room = this.rooms[index];
    if (!room) return;

    // Dispose all children of roomRoot (previous room's meshes)
    this.roomRoot.getChildMeshes().forEach(m => m.dispose());
    this.roomRoot.getChildTransformNodes().forEach(n => {
      if (n !== this.roomRoot) n.dispose();
    });

    this._currentRoomIndex = index;
    room.enter(ctx, param);
  }

  exitRoom(index: number, ctx: AppContext): void {
    const room = this.rooms[index];
    if (!room) return;
    room.exit(ctx);
  }

  get roomRootNode(): TransformNode {
    return this.roomRoot;
  }
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/rooms/RoomManager.ts
git commit -m "feat: add RoomManager for room lifecycle orchestration"
```

---

### Task 5: Create main entry point (index.ts)

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: Write the Babylon.js entry point**

```typescript
import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { Vector3, Color3, Color4 } from '@babylonjs/core/Maths/math.js';
import { HemisphericLight, PointLight } from '@babylonjs/core/Lights/index.js';
import { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { ActionManager } from '@babylonjs/core/Actions/actionManager.js';
import { ExecuteCodeAction } from '@babylonjs/core/Actions/codeAction.js';

import type { AppContext } from './types/index.js';
import { ELEMENTS, EXPERIMENTAL_ROOMS } from './data/elements.js';
import { RoomManager, ROOM_LOBBY, ROOM_ELEMENTS_START } from './rooms/RoomManager.js';
import * as Lobby from './rooms/Lobby.js';
import * as ElementRoom from './rooms/ElementRoom.js';
import * as ExperimentalRoom from './rooms/ExperimentalRoom.js';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const loadingEl = document.getElementById('loading');
const noWebGLEl = document.getElementById('no-webgl');

// Room indices
const ROOM_ELEMENTS_END = ROOM_ELEMENTS_START + ELEMENTS.length - 1;
const ROOM_EXP_START = ROOM_ELEMENTS_END + 1;

// URL params
const urlParams = new URLSearchParams(window.location.search);
const roomName = urlParams.get('room');
const handedness = (urlParams.get('handedness') as 'left' | 'right') || 'right';

let engine: Engine;
let scene: Scene;
let camera: ArcRotateCamera;
let xrExperience: WebXRDefaultExperience | null = null;
let roomManager: RoomManager;
let context: AppContext;

async function init() {
  // Engine
  engine = new Engine(canvas, true, {
    preserveDrawingBuffer: false,
    stencil: true,
    antialias: true
  });
  engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio, 2));

  // Scene
  scene = new Scene(engine);
  scene.clearColor = new Color4(0.04, 0.04, 0.1, 1);

  // Camera (desktop fallback)
  camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, 8, Vector3.Zero(), scene);
  camera.lowerRadiusLimit = 0.5;
  camera.upperRadiusLimit = 50;
  camera.wheelPrecision = 20;
  camera.attachControl(canvas, true);

  // Lights
  const hemiLight = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.3;

  // Room manager
  roomManager = new RoomManager(scene);

  // Register rooms
  roomManager.registerRoom(ROOM_LOBBY, Lobby);
  ELEMENTS.forEach((_, i) => {
    roomManager.registerRoom(ROOM_ELEMENTS_START + i, ElementRoom);
  });
  EXPERIMENTAL_ROOMS.forEach((_, i) => {
    roomManager.registerRoom(ROOM_EXP_START + i, ExperimentalRoom);
  });

  // Context object
  context = {
    scene,
    engine,
    camera,
    xr: null,
    room: ROOM_LOBBY,
    vrMode: false,
    roomRoot: roomManager.roomRootNode,
    handedness,
    goto: null,
    GotoRoom: gotoRoom,
    assets: {}
  };

  // Expose for debugging
  (window as any).context = context;

  // Setup lobby
  roomManager.setupRoom(ROOM_LOBBY, context);

  // Try WebXR
  try {
    xrExperience = await scene.createDefaultXRExperienceAsync({
      floorMeshes: [createFloorMesh()],
      optionalFeatures: true
    });
    context.xr = xrExperience;

    xrExperience.baseExperience.onStateChangedObservable.add((state) => {
      const wasVrMode = context.vrMode;
      context.vrMode = state === import('@babylonjs/core/XR/webXRTypes').WebXRState.IN_XR;

      if (context.vrMode && !wasVrMode) {
        roomManager.exitRoom(context.room, context);
      } else if (!context.vrMode && wasVrMode) {
        roomManager.enterRoom(context.room, context);
      }
    });
  } catch (e) {
    console.warn('WebXR not available:', e);
  }

  // Desktop keyboard controls
  setupDesktopControls();

  // Navigate to initial room
  let initialRoom = ROOM_LOBBY;
  let initialParam: string | undefined;

  if (roomName) {
    const elementIndex = ELEMENTS.findIndex(e => e.symbol === roomName);
    if (elementIndex !== -1) {
      initialRoom = ROOM_ELEMENTS_START + elementIndex;
      initialParam = roomName;
    } else {
      const expIndex = EXPERIMENTAL_ROOMS.findIndex(r => r.id === roomName);
      if (expIndex !== -1) {
        initialRoom = ROOM_EXP_START + expIndex;
        initialParam = EXPERIMENTAL_ROOMS[expIndex].id;
      }
    }
  }

  gotoRoom(initialRoom, initialParam);

  // Hide loading
  if (loadingEl) loadingEl.style.display = 'none';

  // Render loop
  engine.runRenderLoop(() => {
    const delta = engine.getDeltaTime() / 1000;
    const time = performance.now() / 1000;

    // Execute current room
    const currentRoom = roomManager.getRoom(context.room);
    if (currentRoom) {
      currentRoom.execute(context, delta, time);
    }

    // Check for room change request
    if (context.goto !== null) {
      gotoRoom(context.goto);
      context.goto = null;
    }

    scene.render();
  });

  window.addEventListener('resize', () => engine.resize());
}

function createFloorMesh() {
  const floor = MeshBuilder.CreateGround('teleportFloor', { width: 30, height: 30 }, scene);
  floor.isVisible = false;
  floor.isPickable = false;
  return floor;
}

function gotoRoom(roomIndex: number, elementSymbol?: string, expRoomId?: string): void {
  roomManager.exitRoom(context.room, context);

  // Resolve params if not provided
  if (roomIndex >= ROOM_ELEMENTS_START && roomIndex <= ROOM_ELEMENTS_END && !elementSymbol) {
    elementSymbol = ELEMENTS[roomIndex - ROOM_ELEMENTS_START].symbol;
  }
  if (roomIndex >= ROOM_EXP_START && !expRoomId) {
    expRoomId = EXPERIMENTAL_ROOMS[roomIndex - ROOM_EXP_START].id;
  }

  const param = elementSymbol || expRoomId;
  roomManager.setupRoom(roomIndex, context, param);

  // Reset camera position
  if (context.vrMode && xrExperience?.baseExperience.camera) {
    xrExperience.baseExperience.camera.position = new Vector3(0, 1.6, 6.8);
  } else {
    camera.position = Vector3.Zero();
    camera.target = Vector3.Zero();
  }

  context.room = roomIndex;
  roomManager.enterRoom(roomIndex, context, param);
}

function setupDesktopControls() {
  const keys: Record<string, boolean> = {};
  const velocity = 0.1;

  window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

  scene.onBeforeRenderObservable.add(() => {
    if (context.vrMode) return;
    const forward = camera.getDirection(Vector3.Forward());
    const right = camera.getDirection(Vector3.Right());
    forward.y = 0;
    forward.normalize();
    right.y = 0;
    right.normalize();

    if (keys['w'] || keys['arrowup']) camera.position.addInPlace(forward.scale(velocity));
    if (keys['s'] || keys['arrowdown']) camera.position.addInPlace(forward.scale(-velocity));
    if (keys['a'] || keys['arrowleft']) camera.position.addInPlace(right.scale(-velocity));
    if (keys['d'] || keys['arrowright']) camera.position.addInPlace(right.scale(velocity));
  });
}

// Start
try {
  init();
} catch (e) {
  console.error('Failed to initialize:', e);
  if (loadingEl) loadingEl.style.display = 'none';
  if (noWebGLEl) noWebGLEl.classList.remove('hidden');
}
```

- [ ] **Step 2: Verify it compiles (rooms don't exist yet, expect import errors)**

Run: `npx tsc --noEmit`
Expected: Errors for missing room modules — that's fine, we'll create them next.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: add Babylon.js entry point with XR, camera, room manager"
```

---

### Task 6: Port Lobby room

**Files:**
- Create: `src/rooms/Lobby.ts`
- Source: `src/rooms/Lobby.js` (reference for features)

This is the largest room. Key features to port:
- Periodic table hologram (3D grid of element tiles)
- Atom nucleus with electron orbits (animated)
- Element buttons (clickable → goto element room)
- Experimental room buttons (clickable → goto exp room)
- Info panel (hover → show element details)
- Floor + teleport zone

- [ ] **Step 1: Write Lobby.ts**

Read `src/rooms/Lobby.js` (378 lines) for the full feature set. Rewrite using Babylon.js:
- `THREE.Scene` → use `ctx.roomRoot` TransformNode as parent
- `THREE.Mesh` → `MeshBuilder.CreateBox/CreateSphere/etc`
- `THREE.MeshBasicMaterial` → `StandardMaterial` or `PBRMaterial`
- `THREE.Raycaster` → `scene.onPointerObservable` with `PointerEventTypes`
- `ctx.raycontrol.addState()` → Babylon `ActionManager` with `OnPickTrigger`
- Electron orbit animation → `scene.onBeforeRenderObservable` or room's `execute()`
- Element buttons → Create box meshes with ActionManager, set `context.goto` on pick

The room must export: `setup(ctx, param)`, `enter(ctx, param)`, `exit(ctx)`, `execute(ctx, delta, time)`.

Key mapping from Three.js to Babylon.js:
| Three.js | Babylon.js |
|----------|-----------|
| `new THREE.Scene()` | Use `ctx.roomRoot` (TransformNode) |
| `scene.add(mesh)` | `mesh.parent = ctx.roomRoot` |
| `scene.remove(mesh)` | `mesh.dispose()` |
| `new THREE.Mesh(geo, mat)` | `MeshBuilder.CreateX('name', opts, ctx.scene)` |
| `new THREE.MeshBasicMaterial({color})` | `new StandardMaterial('name', ctx.scene); mat.diffuseColor = Color3.FromHexString(hex)` |
| `THREE.Raycaster` | `scene.pick(scene.pointerX, scene.pointerY)` |
| `mesh.material.emissive` | `mat.emissiveColor` |
| `new THREE.PointLight(color, intensity, distance)` | `new PointLight('name', pos, ctx.scene); light.intensity = n; light.range = d` |

The Lobby creates ~150 meshes (118 element tiles + nucleus + orbits + floor + buttons + info panel). Keep the same visual layout.

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: Errors only from missing ElementRoom/ExperimentalRoom

- [ ] **Step 3: Visual verification**

Run: `npx vite`
Open https://localhost:3000 — should see the lobby with periodic table hologram, element tiles, atom nucleus.

- [ ] **Step 4: Commit**

```bash
git add src/rooms/Lobby.ts
git commit -m "feat: port Lobby room to Babylon.js"
```

---

### Task 7: Port ElementRoom

**Files:**
- Create: `src/rooms/ElementRoom.ts`
- Source: `src/rooms/ElementRoom.js` (740 lines)

Key features:
- Per-element themed room (background color from element data)
- Atom model (sphere + orbiting electrons)
- Info panel (name, symbol, atomic number, mass, description)
- Navigation panel (back to lobby, prev/next element)
- Experiment stations (placeholder meshes for now)
- Audio guide (SpeechSynthesis — browser API, framework-agnostic)

- [ ] **Step 1: Write ElementRoom.ts**

Port from `src/rooms/ElementRoom.js`. Key changes:
- `createAtomModel()` → Babylon sphere + torus for electron orbits
- Info panel → GUI `AdvancedDynamicTexture.CreateFullscreenUI()` with `TextBlock`, `StackPanel` (works in both desktop and VR)
- Nav panel → GUI buttons with `OnPickTrigger` → `context.GotoRoom()`
- Floor → `MeshBuilder.CreateCylinder('floor', {diameter: 20, height: 0.2})`
- Audio → `new AudioManager(ctx)` (port in Task 9) or raw SpeechSynthesis

Each element room is created on demand (not all 118 at startup). Same lazy setup pattern as current code.

- [ ] **Step 2: Test navigation**

Run: `npx vite`
Navigate from lobby to an element room. Verify:
- Room transitions (lobby → element → back to lobby)
- Info panel displays element data
- Nav buttons work (lobby, prev, next)

- [ ] **Step 3: Commit**

```bash
git add src/rooms/ElementRoom.ts
git commit -m "feat: port ElementRoom to Babylon.js"
```

---

### Task 8: Port ExperimentalRoom

**Files:**
- Create: `src/rooms/ExperimentalRoom.ts`
- Source: `src/rooms/ExperimentalRoom.js` (673 lines)

Key features:
- 10 experiment rooms with unique setups per room ID
- Room-specific decorations (beakers, reactors, etc.)
- Same nav panel pattern as ElementRoom

- [ ] **Step 1: Write ExperimentalRoom.ts**

Port from `src/rooms/ExperimentalRoom.js`. The 10 room-specific setups (`createAlchemistWorkshop`, `createNuclearControlRoom`, etc.) create decorative meshes. Port these using Babylon.js mesh builders:

| Three.js | Babylon.js |
|----------|-----------|
| `CylinderGeometry` | `MeshBuilder.CreateCylinder` |
| `SphereGeometry` | `MeshBuilder.CreateSphere` |
| `BoxGeometry` | `MeshBuilder.CreateBox` |
| `TorusGeometry` | `MeshBuilder.CreateTorus` |
| `PlaneGeometry` | `MeshBuilder.CreatePlane` |
| `TubeGeometry` | `MeshBuilder.CreateTube` |
| `MeshStandardMaterial` | `StandardMaterial` or `PBRMaterial` |

The room-specific functions are decorative — focus on getting the structure right, visual polish can come later.

- [ ] **Step 2: Test navigation**

Run: `npx vite`
Navigate from lobby to an experimental room. Verify room transitions work.

- [ ] **Step 3: Commit**

```bash
git add src/rooms/ExperimentalRoom.ts
git commit -m "feat: port ExperimentalRoom to Babylon.js"
```

---

### Task 9: Port AudioManager

**Files:**
- Create: `src/lib/AudioManager.ts`
- Source: `src/lib/AudioManager.js` (525 lines)

Key features:
- Procedural sound generation (oscillator-based)
- Spatial audio (3D positioned sounds)
- Voice guide via SpeechSynthesis (browser API, no framework dependency)

- [ ] **Step 1: Write AudioManager.ts**

Port from `src/lib/AudioManager.js`:
- `THREE.PositionalAudio` → Babylon `Sound` class with `spatialAudio: true`
- `AudioListener` → Babylon's built-in audio engine
- `THREE.Audio` → `new Sound('name', url, scene, null, { spatialSound: true, maxDistance: 20 })`
- SpeechSynthesis → keep as-is (browser API)
- Procedural sounds → use Web Audio API directly (no framework dependency)

- [ ] **Step 2: Commit**

```bash
git add src/lib/AudioManager.ts
git commit -m "feat: port AudioManager to Babylon.js Sound API"
```

---

### Task 10: Port AssetLoader

**Files:**
- Create: `src/lib/AssetLoader.ts`
- Source: `src/lib/assetManager.js`, `src/lib/modelLoader.js` (1059 lines)

- [ ] **Step 1: Write AssetLoader.ts**

Port from `src/lib/assetManager.js` and `src/lib/modelLoader.js`:
- `THREE.GLTFLoader` → `SceneLoader.ImportMeshAsync('', url, scene)`
- `THREE.DRACOLoader` → `SceneLoader.ImportMeshAsync` with DRACO support built into Babylon
- Progress callbacks → Babylon's `onProgress` callback
- `createElementDisplay()` → Build element 3D models with Babylon meshes (sphere for nucleus, rings for orbits)

- [ ] **Step 2: Commit**

```bash
git add src/lib/AssetLoader.ts
git commit -m "feat: port AssetLoader to Babylon SceneLoader"
```

---

### Task 11: Port ColorUtils and helpers

**Files:**
- Create: `src/lib/ColorUtils.ts`

- [ ] **Step 1: Write ColorUtils.ts**

```typescript
import { Color3 } from '@babylonjs/core/Maths/math.color.js';

export function hsvToRgb(h: number, s: number, v: number): Color3 {
  // Standard HSV to RGB conversion
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return new Color3(r, g, b);
}

export function rgbToHsv(color: Color3): [number, number, number] {
  const max = Math.max(color.r, color.g, color.b);
  const min = Math.min(color.r, color.g, color.b);
  const d = max - min;
  let h = 0, s = max === 0 ? 0 : d / max, v = max;
  if (d !== 0) {
    switch (max) {
      case color.r: h = ((color.g - color.b) / d + (color.g < color.b ? 6 : 0)) / 6; break;
      case color.g: h = ((color.b - color.r) / d + 2) / 6; break;
      case color.b: h = ((color.r - color.g) / d + 4) / 6; break;
    }
  }
  return [h, s, v];
}

export function hexToColor3(hex: number): Color3 {
  return Color3.FromHexString('#' + hex.toString(16).padStart(6, '0'));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ColorUtils.ts
git commit -m "feat: port ColorUtils to Babylon Color3"
```

---

### Task 12: Update Dockerfile and deployment

**Files:**
- Modify: `Dockerfile`
- Modify: `nginx.conf`
- Delete: `sw.js`
- Modify: `docker-deploy.sh`

- [ ] **Step 1: Update Dockerfile for Vite build**

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache gzip

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY --from=build /app/assets/ /usr/share/nginx/html/assets/
COPY --from=build /app/src/vendor/ /usr/share/nginx/html/src/vendor/

COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R 755 /usr/share/nginx/html/
```

- [ ] **Step 2: Update nginx.conf for SPA routing**

Add try_files fallback:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

- [ ] **Step 3: Delete sw.js**

```bash
rm sw.js
```

- [ ] **Step 4: Update docker-deploy.sh**

Remove any references to `sw.js`, `bundle.js`, `vendors.bundle.js`, `three.bundle.js`. Update build artifact references to `dist/`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: update Dockerfile and nginx for Vite build output"
```

---

### Task 13: Update Playwright tests

**Files:**
- Modify: `tests/*.spec.js`

- [ ] **Step 1: Update test assertions**

Existing tests check `window.context.room`, `window.context.vrMode`, etc. The context object structure is preserved, so most tests should work with minimal changes:
- Update any references to Three.js-specific internals
- `window.context.scene` is now a Babylon.js Scene (different API)
- `window.context.xr` replaces old VR session detection
- Verify room navigation still works: lobby (0), element rooms (1-118), exp rooms (119+)

- [ ] **Step 2: Run tests**

Run: `npx playwright test`
Expected: Tests pass (or identify which need updating)

- [ ] **Step 3: Commit**

```bash
git add tests/
git commit -m "test: update Playwright tests for Babylon.js context"
```

---

### Task 14: Cleanup old files

**Files:**
- Delete: `src/index.js` (replaced by index.ts)
- Delete: `src/components/` (ECSY)
- Delete: `src/systems/` (ECSY)
- Delete: `src/lib/RayControl.js` (replaced)
- Delete: `src/lib/Teleport.js` (replaced by Babylon built-in)
- Delete: `src/lib/AudioManager.js` (replaced)
- Delete: `src/lib/modelLoader.js` (replaced)
- Delete: `src/lib/assetManager.js` (replaced)
- Delete: `src/lib/shaders.js` (replace inline if needed)
- Delete: `src/lib/VRButton.js` (Babylon built-in)
- Delete: `src/lib/ParticleSys.js` (Babylon built-in)
- Delete: `src/lib/slideshow.js` (inline if needed)
- Delete: `src/lib/EventDispatcher.js` (Babylon Observable)
- Delete: `src/lib/VoiceCommander.js` (was disabled)
- Delete: `src/lib/PositionalAudioPolyphonic.js` (Three.js specific)
- Delete: `src/assets.js` (rewrite if needed)
- Delete: `src/rooms/Lobby.js` (replaced by .ts)
- Delete: `src/rooms/ElementRoom.js` (replaced by .ts)
- Delete: `src/rooms/ExperimentalRoom.js` (replaced by .ts)
- Delete: `src/rooms/Audio.js`, `Controllers.js`, `Interaction.js`, `Landing.js`, `Models.js`, `Teleport.js` (legacy tutorial rooms)
- Delete: `src/data/elements.js` (replaced by .ts)

- [ ] **Step 1: Delete old files**

```bash
rm -rf src/components/ src/systems/
rm -f src/index.js src/assets.js
rm -f src/lib/RayControl.js src/lib/Teleport.js src/lib/AudioManager.js
rm -f src/lib/modelLoader.js src/lib/assetManager.js src/lib/shaders.js
rm -f src/lib/VRButton.js src/lib/ParticleSys.js src/lib/slideshow.js
rm -f src/lib/EventDispatcher.js src/lib/VoiceCommander.js
rm -f src/lib/PositionalAudioPolyphonic.js
rm -f src/rooms/Lobby.js src/rooms/ElementRoom.js src/rooms/ExperimentalRoom.js
rm -f src/rooms/Audio.js src/rooms/Controllers.js src/rooms/Interaction.js
rm -f src/rooms/Landing.js src/rooms/Models.js src/rooms/Teleport.js
rm -f src/data/elements.js
rm -f webpack.config.js .babelrc sw.js
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build to `dist/`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old Three.js/ECSY/webpack files"
```

---

### Task 15: Full integration test

**Files:** None (verification only)

- [ ] **Step 1: Build and serve locally**

```bash
npm run build
npx vite preview
```

- [ ] **Step 2: Verify all rooms**

Open in browser:
1. Lobby loads with periodic table hologram ✓
2. Click an element → navigates to element room ✓
3. Element room shows atom model, info panel ✓
4. Back to lobby button works ✓
5. Click experimental room → navigates correctly ✓
6. URL parameter `?room=H` navigates to Hydrogen room ✓
7. Desktop keyboard controls (WASD) work ✓
8. `window.context` accessible in console ✓

- [ ] **Step 3: Docker build test**

```bash
docker build -t pse-vr .
docker run -d -p 8443:443 pse-vr
```

Verify https://pse-vr:8443/ loads correctly.

- [ ] **Step 4: Run Playwright tests**

```bash
npx playwright test
```

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: integration test fixes"
```

---

## Execution Order Summary

| Task | Description | Depends On | Est. Time |
|------|-------------|-----------|-----------|
| 1 | Scaffold Vite + Babylon.js | — | 10 min |
| 2 | TypeScript interfaces | Task 1 | 5 min |
| 3 | Port element data | Task 2 | 5 min |
| 4 | RoomManager | Task 2 | 10 min |
| 5 | Entry point (index.ts) | Tasks 2-4 | 15 min |
| 6 | Lobby room | Tasks 4-5 | 60 min |
| 7 | ElementRoom | Tasks 4-5 | 45 min |
| 8 | ExperimentalRoom | Tasks 4-5 | 45 min |
| 9 | AudioManager | Task 5 | 20 min |
| 10 | AssetLoader | Task 5 | 20 min |
| 11 | ColorUtils | Task 2 | 5 min |
| 12 | Docker/deploy update | Task 1 | 10 min |
| 13 | Playwright tests | Tasks 5-8 | 15 min |
| 14 | Cleanup old files | Tasks 6-11 | 5 min |
| 15 | Integration test | All | 20 min |

**Parallelizable:** Tasks 6, 7, 8 (rooms) can be done in parallel after Task 5.
Tasks 9, 10, 11 (utilities) can be done in parallel after Task 5.
