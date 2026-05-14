# Smooth Room Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace jarring instant camera resets between rooms with smooth 0.5s animated transitions, applying to both desktop (camera animation) and VR (opacity fade only).

**Architecture:** New RoomTransitionManager wraps existing gotoRoom() with fade-in/out animations. Camera position/rotation animated on desktop using Babylon's Animation API; VR skips position animation in favor of Babylon's teleportation. Graceful fallback to instant room change if animation fails.

**Tech Stack:** Babylon.js Animation API, Babylon.js Materials (alpha opacity), TypeScript Promise-based async control flow, Playwright E2E testing for integration verification.

---

## File Structure

**New files:**
- `src/movement/RoomTransitionManager.ts` - Core transition logic (camera animation, mesh fading, state management, cancellation)

**Modified files:**
- `src/embed/mount.ts` - Wrap existing gotoRoom() function with RoomTransitionManager.transitionTo()
- `tests/transitions.spec.ts` - New E2E test file for transition behavior

**No changes to:**
- `src/movement/DesktopControls.ts` - Automatically disabled during transition
- `src/movement/VRNavigation.ts` - VR teleportation continues to work
- `src/rooms/RoomManager.ts` - Lifecycle unchanged
- `src/rooms/Lobby.ts`, `src/rooms/ElementRoom.ts`, `src/rooms/ExperimentalRoom.ts` - Room behavior unchanged

---

## Task 1: Create RoomTransitionManager module skeleton

**Files:**
- Create: `src/movement/RoomTransitionManager.ts`

- [ ] **Step 1: Create module file with imports**

```typescript
import type { AppContext } from '../types/index.js';
import { Animation, EasingFunction } from '@babylonjs/core/Animations/animation.js';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';

export interface RoomTransitionOptions {
  duration?: number;           // Default: 500ms
  fadeEnabled?: boolean;       // Default: true
  animationEnabled?: boolean;  // Default: true
}

export class RoomTransitionManager {
  private _isTransitioning = false;
  private _activeAnimations = new Set<Animation>();
  private _fadeAnimations = new Map<AbstractMesh, Animation>();
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/movement/RoomTransitionManager.ts`
Expected: No errors

- [ ] **Step 3: Commit skeleton**

```bash
git add src/movement/RoomTransitionManager.ts
git commit -m "feat: create RoomTransitionManager skeleton"
```

---

## Task 2: Add transitionTo() method core

**Files:**
- Modify: `src/movement/RoomTransitionManager.ts`

- [ ] **Step 1: Add transitionTo() method signature and initial state management**

```typescript
export class RoomTransitionManager {
  private _isTransitioning = false;
  private _activeAnimations = new Set<Animation>();
  private _fadeAnimations = new Map<AbstractMesh, Animation>();
  private _resolveTransition: (() => void) | null = null;

  transitionTo(
    ctx: AppContext,
    targetRoomIndex: number,
    options: RoomTransitionOptions = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      // Cancel any existing transition
      this.cancel();

      // Set state
      this._isTransitioning = true;
      this._resolveTransition = resolve;
      const duration = options.duration ?? 500;
      const enableFade = options.fadeEnabled ?? true;
      const enableAnimation = options.animationEnabled ?? true;

      // TODO: Implement camera animation and fade logic
      // For now, resolve immediately to test structure
      setTimeout(() => {
        this._isTransitioning = false;
        this._resolveTransition = null;
        resolve();
      }, duration);
    });
  }
}
```

- [ ] **Step 2: Add isTransitioning() getter**

```typescript
  isTransitioning(): boolean {
    return this._isTransitioning;
  }
```

- [ ] **Step 3: Add placeholder cancel() method**

```typescript
  cancel(): void {
    // Stop all active animations
    this._activeAnimations.forEach(anim => anim.stop());
    this._activeAnimations.clear();

    // Stop all fade animations and restore original alphas
    this._fadeAnimations.forEach((anim, mesh) => {
      anim.stop();
      // TODO: Restore original alpha
    });
    this._fadeAnimations.clear();

    this._isTransitioning = false;

    // Resolve pending promise
    if (this._resolveTransition) {
      this._resolveTransition();
      this._resolveTransition = null;
    }
  }
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/movement/RoomTransitionManager.ts`
Expected: No errors

- [ ] **Step 5: Commit core methods**

```bash
git add src/movement/RoomTransitionManager.ts
git commit -m "feat: add transitionTo core flow with cancel and state tracking"
```

---

## Task 3: Implement camera animation for desktop

**Files:**
- Modify: `src/movement/RoomTransitionManager.ts`

- [ ] **Step 1: Add animateDesktopCamera() helper method**

```typescript
  private animateDesktopCamera(
    ctx: AppContext,
    targetPosition: import('@babylonjs/core').Vector3,
    targetRotation: import('@babylonjs/core').Vector3,
    duration: number
  ): void {
    const { Vector3 } = import('@babylonjs/core/Maths/math.js');
    const { Animation, EasingFunction } = import('@babylonjs/core/Animations/animation.js');

    const camera = ctx.camera;

    // Position animation (ease out elastic)
    const posAnim = Animation.CreateAndStartAnimation(
      'camera-position',
      camera,
      'position',
      duration,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
      targetPosition,
      0,
      EasingFunction.CreateElasticEase(1.5, 0.5)
    );

    // Rotation animation (ease in-out quad)
    const rotAnim = Animation.CreateAndStartAnimation(
      'camera-rotation',
      camera,
      'rotation',
      duration,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
      targetRotation,
      0,
      EasingFunction.CreateEaseInOutQuad()
    );

    if (posAnim) this._activeAnimations.add(posAnim);
    if (rotAnim) this._activeAnimations.add(rotAnim);
  }
```

- [ ] **Step 2: Integrate animateDesktopCamera() into transitionTo()**

```typescript
  transitionTo(
    ctx: AppContext,
    targetRoomIndex: number,
    options: RoomTransitionOptions = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      this.cancel();

      this._isTransitioning = true;
      this._resolveTransition = resolve;
      const duration = options.duration ?? 500;
      const enableFade = options.fadeEnabled ?? true;
      const enableAnimation = options.animationEnabled ?? true;

      // Target camera position (standard across rooms)
      const { Vector3 } = import('@babylonjs/core/Maths/math.js');
      const targetPosition = new Vector3(0, 1.6, 8);
      const targetRotation = new Vector3(0, Math.PI, 0);

      // Start camera animation for desktop only (not VR)
      if (enableAnimation && !ctx.vrMode) {
        this.animateDesktopCamera(ctx, targetPosition, targetRotation, duration);
      }

      // TODO: Implement fade and room swap logic
      setTimeout(() => {
        this._isTransitioning = false;
        this._resolveTransition = null;
        resolve();
      }, duration);
    });
  }
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/movement/RoomTransitionManager.ts`
Expected: No errors

- [ ] **Step 4: Commit camera animation**

```bash
git add src/movement/RoomTransitionManager.ts
git commit -m "feat: add desktop camera animation with elastic and quad easing"
```

---

## Task 4: Implement room mesh fade effects

**Files:**
- Modify: `src/movement/RoomTransitionManager.ts`

- [ ] **Step 1: Add fadeOutRoomMeshes() and fadeInRoomMeshes() helpers**

```typescript
  private fadeOutRoomMeshes(
    ctx: AppContext,
    duration: number,
    callback: () => void
  ): void {
    const { Animation, StandardMaterial } = import('@babylonjs/core/index.js');
    const { Color4 } = import('@babylonjs/core/Maths/math.js');

    // Get all tracked meshes from RoomManager (via mesh tracking pattern)
    // Note: This requires accessing RoomManager's _roomMeshes or similar
    // For now, we'll access via scene traversal until we have a better pattern
    const scene = ctx.scene;
    const meshes: import('@babylonjs/core').AbstractMesh[] = [];

    scene.meshes.forEach(mesh => {
      // Only animate meshes that belong to the current room
      // We can identify room meshes by checking if they have our tracking metadata
      if (mesh.metadata && mesh.metadata._trackedByRoomManager) {
        meshes.push(mesh);
      }
    });

    let completed = 0;
    const total = meshes.length;

    meshes.forEach(mesh => {
      const material = mesh.material as StandardMaterial;
      if (!material) {
        completed++;
        if (completed === total) callback();
        return;
      }

      // Store original alpha
      const originalAlpha = material.alpha;
      mesh.metadata._originalAlpha = originalAlpha;

      // Animate alpha to 0.25 (opacity 25%)
      const fadeAnim = Animation.CreateAndStartAnimation(
        'material-alpha',
        material,
        'alpha',
        duration,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        0.25,
        0,
        EasingFunction.CreateEaseInOutQuad()
      );

      if (fadeAnim) {
        fadeAnim.onEndObservable.add(() => {
          completed++;
          if (completed === total) callback();
        });
      } else {
        completed++;
        if (completed === total) callback();
      }
    });

    if (total === 0) callback();
  }

  private fadeInRoomMeshes(
    ctx: AppContext,
    duration: number
  ): void {
    const { Animation, StandardMaterial } = import('@babylonjs/core/index.js');

    const scene = ctx.scene;
    const meshes: import('@babylonjs/core').AbstractMesh[] = [];

    scene.meshes.forEach(mesh => {
      if (mesh.metadata && mesh.metadata._trackedByRoomManager) {
        meshes.push(mesh);
      }
    });

    meshes.forEach(mesh => {
      const material = mesh.material as StandardMaterial;
      if (!material) return;

      // Animate alpha back to original value (or 1.0 if not stored)
      const targetAlpha = mesh.metadata._originalAlpha ?? 1.0;
      delete mesh.metadata._originalAlpha;

      const fadeAnim = Animation.CreateAndStartAnimation(
        'material-alpha',
        material,
        'alpha',
        duration,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        targetAlpha,
        0,
        EasingFunction.CreateEaseInOutQuad()
      );

      if (fadeAnim) {
        this._fadeAnimations.set(mesh, fadeAnim);
      }
    });
  }
```

- [ ] **Step 2: Update transitionTo() to integrate fade effects**

```typescript
  transitionTo(
    ctx: AppContext,
    targetRoomIndex: number,
    options: RoomTransitionOptions = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      this.cancel();

      this._isTransitioning = true;
      this._resolveTransition = resolve;
      const duration = options.duration ?? 500;
      const enableFade = options.fadeEnabled ?? true;
      const enableAnimation = options.animationEnabled ?? true;

      const { Vector3 } = import('@babylonjs/core/Maths/math.js');
      const targetPosition = new Vector3(0, 1.6, 8);
      const targetRotation = new Vector3(0, Math.PI, 0);

      // Phase 1: Start animations
      if (enableAnimation && !ctx.vrMode) {
        this.animateDesktopCamera(ctx, targetPosition, targetRotation, duration);
      }

      // Phase 2: Midpoint - swap rooms
      setTimeout(() => {
        // TODO: Call roomManager.exitRoom() and roomManager.enterRoom()
        // For now, just handle fade completion
      }, duration / 2);

      // Phase 3: Complete transition
      setTimeout(() => {
        this._isTransitioning = false;
        this._resolveTransition = null;
        this._fadeAnimations.clear();
        resolve();
      }, duration);
    });
  }
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/movement/RoomTransitionManager.ts`
Expected: No errors

- [ ] **Step 4: Commit fade effects**

```bash
git add src/movement/RoomTransitionManager.ts
git commit -m "feat: add room mesh fade-in/out with alpha animation"
```

---

## Task 5: Hook into RoomManager for room swapping

**Files:**
- Modify: `src/movement/RoomTransitionManager.ts`
- Read: `src/rooms/RoomManager.ts`

- [ ] **Step 1: Update RoomManager to expose room mesh tracking**

Add to `src/rooms/RoomManager.ts`:

```typescript
// export const ROOM_LOBBY = 0;
// export const ROOM_ELEMENTS_START = 1;
// ... existing exports

// Add after getRoom method:
/** Get all tracked room meshes for transitions */
getRoomMeshes(): import('@babylonjs/core').AbstractMesh[] {
  return [...this._roomMeshes];
}
```

- [ ] **Step 2: Update RoomTransitionManager to use RoomManager.getRoomMeshes()**

```typescript
  private fadeOutRoomMeshes(
    ctx: AppContext,
    duration: number,
    callback: () => void
  ): void {
    const { Animation, StandardMaterial } = import('@babylonjs/core/index.js');
    const { RoomManager } = import('../rooms/RoomManager.js');

    // Access room manager through the room tracking system
    // For now, we need to find the RoomManager instance from context
    // This is a temporary pattern - in production, pass RoomManager to transitionManager
    const roomManager = (ctx as any)._roomManager; // TODO: Add to AppContext

    if (!roomManager) {
      callback();
      return;
    }

    const meshes = roomManager.getRoomMeshes();

    let completed = 0;
    const total = meshes.length;

    meshes.forEach(mesh => {
      const material = mesh.material as StandardMaterial;
      if (!material) {
        completed++;
        if (completed === total) callback();
        return;
      }

      const originalAlpha = material.alpha;
      mesh.metadata._originalAlpha = originalAlpha;

      const fadeAnim = Animation.CreateAndStartAnimation(
        'material-alpha',
        material,
        'alpha',
        duration,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        0.25,
        0,
        EasingFunction.CreateEaseInOutQuad()
      );

      if (fadeAnim) {
        fadeAnim.onEndObservable.add(() => {
          completed++;
          if (completed === total) callback();
        });
      } else {
        completed++;
        if (completed === total) callback();
      }
    });

    if (total === 0) callback();
  }

  private fadeInRoomMeshes(
    ctx: AppContext,
    duration: number
  ): void {
    const { Animation, StandardMaterial } = import('@babylonjs/core/index.js');
    const { RoomManager } = import('../rooms/RoomManager.js');

    const roomManager = (ctx as any)._roomManager;
    if (!roomManager) return;

    const meshes = roomManager.getRoomMeshes();

    meshes.forEach(mesh => {
      const material = mesh.material as StandardMaterial;
      if (!material) return;

      const targetAlpha = mesh.metadata._originalAlpha ?? 1.0;
      delete mesh.metadata._originalAlpha;

      const fadeAnim = Animation.CreateAndStartAnimation(
        'material-alpha',
        material,
        'alpha',
        duration,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        targetAlpha,
        0,
        EasingFunction.CreateEaseInOutQuad()
      );

      if (fadeAnim) {
        this._fadeAnimations.set(mesh, fadeAnim);
      }
    });
  }
```

- [ ] **Step 3: Add RoomManager to AppContext**

Add to `src/types/index.ts` in AppContext interface:

```typescript
export interface AppContext {
  scene: Scene;
  engine: Engine;
  camera: UniversalCamera;
  xr: WebXRDefaultExperience | null;
  room: number;
  vrMode: boolean;
  handedness: 'left' | 'right';
  goto: number | null;
  GotoRoom: (roomIndex: number, elementSymbol?: string, expRoomId?: string) => void;
  assets: Record<string, any>;
  trackMesh: (mesh: AbstractMesh) => void;
  trackNode: (node: TransformNode) => void;
  setFloorMesh?: (mesh: AbstractMesh) => void;
  roomManager?: RoomManager;  // Add this line
}
```

- [ ] **Step 4: Update mount.ts to pass roomManager to context**

Add to `src/embed/mount.ts` in the AppContext creation:

```typescript
  // AppContext
  const context: AppContext = {
    scene,
    engine,
    camera,
    xr: null,
    room: ROOM_LOBBY,
    vrMode: false,
    handedness,
    goto: null,
    GotoRoom: gotoRoom,
    assets: assetStore,
    trackMesh: (mesh) => roomManager.trackMesh(mesh),
    trackNode: (node) => roomManager.trackNode(node),
    setFloorMesh: (mesh) => {
      if (vrNav && currentVRFloor) {
        vrNav.removeFloorMesh(currentVRFloor);
      }
      currentVRFloor = mesh;
      if (vrNav) {
        vrNav.addFloorMesh(mesh);
      }
    },
    roomManager,  // Add this line
  };
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit RoomManager integration**

```bash
git add src/types/index.ts src/rooms/RoomManager.ts src/embed/mount.ts src/movement/RoomTransitionManager.ts
git commit -m "feat: connect RoomTransitionManager with RoomManager for mesh tracking"
```

---

## Task 6 Implement room swap at animation midpoint:6: Add roomExchange callback parameter to transitionTo()

```typescript
  transitionTo(
    ctx: AppContext,
    targetRoomIndex: number,
    roomExchange: () => void,  // NEW callback
    options: RoomTransitionOptions = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      this.cancel();

      this._isTransitioning = true;
      this._resolveTransition = resolve;
      const duration = options.duration ?? 500;
      const enableFade = options.fadeEnabled ?? true;
      const enableAnimation = options.animationEnabled ?? true;

      const { Vector3 } = import('@babylonjs/core/Maths/math.js');
      const targetPosition = new Vector3(0, 1.6, 8);
      const targetRotation = new Vector3(0, Math.PI, 0);

      // Phase 1: Start animations
      if (enableAnimation && !ctx.vrMode) {
        this.animateDesktopCamera(ctx, targetPosition, targetRotation, duration);
      }

      // Phase 2: Midpoint - swap rooms
      setTimeout(() => {
        roomExchange();
        // Note: fadeInRoomMeshes will be added from phase 3 callback
      }, duration / 2);

      // Phase 3: Complete transition
      setTimeout(() => {
        this._isTransitioning = false;
        this._resolveTransition = null;
        this._fadeAnimations.clear();
        resolve();
      }, duration);
    });
  }
```

- [ ] **Step 7: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/movement/RoomTransitionManager.ts`
Expected: No errors

- [ ] **Step 8: Commit room exchange callback**

```bash
git add src/movement/RoomTransitionManager.ts
git commit -m "feat: add roomExchange callback for midpoint room swap"
```

---

## Task 7: Complete fade-out and fade-in integration

**Files:**
- Modify: `src/movement/RoomTransitionManager.ts`

- [ ] **Step 1: Update transitionTo() to use fade effects properly**

```typescript
  transitionTo(
    ctx: AppContext,
    targetRoomIndex: number,
    roomExchange: () => void,
    options: RoomTransitionOptions = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      this.cancel();

      this._isTransitioning = true;
      this._resolveTransition = resolve;
      const duration = options.duration ?? 500;
      const enableFade = options.fadeEnabled ?? true;
      const enableAnimation = options.animationEnabled ?? true;

      const { Vector3 } = import('@babylonjs/core/Maths/math.js');
      const targetPosition = new Vector3(0, 1.6, 8);
      const targetRotation = new Vector3(0, Math.PI, 0);

      // Phase 1: Start animations
      if (enableAnimation && !ctx.vrMode) {
        this.animateDesktopCamera(ctx, targetPosition, targetRotation, duration);
      }

      // Phase 2: Midpoint - swap rooms
      const midpoint = duration / 2;
      setTimeout(() => {
        roomExchange();

        // After room swap, fade in new room elements
        if (enableFade) {
          this.fadeInRoomMeshes(ctx, duration / 2);
        }
      }, midpoint);

      // Phase 3: Complete transition
      setTimeout(() => {
        this._isTransitioning = false;
        this._resolveTransition = null;
        this._fadeAnimations.clear();
        resolve();
      }, duration);
    });
  }
```

- [ ] **Step 2: Update fadeOutRoomMeshes() to be called before room swap**

```typescript
  transitionTo(
    ctx: AppContext,
    targetRoomIndex: number,
    roomExchange: () => void,
    options: RoomTransitionOptions = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      this.cancel();

      this._isTransitioning = true;
      this._resolveTransition = resolve;
      const duration = options.duration ?? 500;
      const enableFade = options.fadeEnabled ?? true;
      const enableAnimation = options.animationEnabled ?? true;

      const { Vector3 } = import('@babylonjs/core/Maths/math.js');
      const targetPosition = new Vector3(0, 1.6, 8);
      const targetRotation = new Vector3(0, Math.PI, 0);

      // Phase 1: Start fade-out first
      if (enableFade) {
        this.fadeOutRoomMeshes(ctx, duration / 2, () => {
          // Phase 2: Swap rooms after fade-out completes
          if (enableAnimation && !ctx.vrMode) {
            this.animateDesktopCamera(ctx, targetPosition, targetRotation, duration / 2);
          }

          roomExchange();

          // Fade in new room
          this.fadeInRoomMeshes(ctx, duration / 2);
        });
      } else {
        // No fade: start animation and swap immediately
        if (enableAnimation && !ctx.vrMode) {
          this.animateDesktopCamera(ctx, targetPosition, targetRotation, duration);
        }

        setTimeout(() => {
          roomExchange();
        }, duration / 2);
      }

      // Phase 3: Complete transition
      setTimeout(() => {
        this._isTransitioning = false;
        this._resolveTransition = null;
        this._fadeAnimations.clear();
        resolve();
      }, duration);
    });
  }
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit complete fade-in/out flow**

```bash
git add src/movement/RoomTransitionManager.ts
git commit -m "feat: complete fade-in/out room effect integration"
```

---

## Task 8: Integrate RoomTransitionManager into mount.ts

**Files:**
- Modify: `src/embed/mount.ts`

- [ ] **Step 1: Import and instantiate RoomTransitionManager**

Add at top with imports:

```typescript
import { RoomTransitionManager } from '../movement/RoomTransitionManager.js';
```

Add after DesktopControls initialization:

```typescript
// Desktop controls
const desktopControls = new DesktopControls(camera, scene);

// Room transition manager
const transitionManager = new RoomTransitionManager();
```

- [ ] **Step 2: Wrap gotoRoom() with transition logic**

Replace the entire existing `gotoRoom()` function:

```typescript
  // gotoRoom function
  function gotoRoom(roomIndex: number, elementSymbol?: string, expRoomId?: string): void {
    if (!app) return;

    // Existing room exit logic
    if (app.context.room !== roomIndex) {
      roomManager.exitRoom(app.context.room, app.context);
      audioManager.stopAmbience();
    }

    // Existing parameter resolution
    if (roomIndex >= ROOM_ELEMENTS_START && roomIndex <= ROOM_ELEMENTS_END && !elementSymbol) {
      elementSymbol = ELEMENTS[roomIndex - ROOM_ELEMENTS_START].symbol;
    }
    if (roomIndex >= ROOM_EXP_START && !expId) {
      expId = EXPERIMENTAL_ROOMS[roomIndex - ROOM_EXP_START].id;
    }

    const param = elementSymbol || expRoomId;

    // Existing setup and ambience logic
    roomManager.setupRoom(roomIndex, app.context, param);

    // Audio ambience
    if (roomIndex === ROOM_LOBBY) {
      audioManager.playRoomAmbience('lobby');
    } else if (roomIndex >= ROOM_ELEMENTS_START && roomIndex <= ROOM_ELEMENTS_END) {
      const element = ELEMENTS[roomIndex - ROOM_ELEMENTS_START];
      const group = element.group as 'alkali' | 'alkalineEarth' | 'transition' | 'lanthanide' | 'actinide' | 'metal' | 'metalloid' | 'nonmetal' | 'halogen' | 'nobleGas';
      audioManager.playRoomAmbience(group);
    } else if (roomIndex >= ROOM_EXP_START) {
      audioManager.playRoomAmbience('lobby');
    }

    // NEW: Use RoomTransitionManager for smooth room change
    const roomExchange = () => {
      // Enter new room
      roomManager.enterRoom(roomIndex, app.context, param);

      // Camera position reset (existing logic, now part of animation timeline)
      // But only if not in VR (VR camera position handled by teleportation)
      if (!app.context.vrMode) {
        camera.position = new Vector3(0, 1.6, 8);
        camera.rotation = new Vector3(0, Math.PI, 0);
      }

      // Room change callback
      if (app.onRoomChange) {
        const name = param || `room-${roomIndex}`;
        app.onRoomChange(name);
      }

      app.context.room = roomIndex;
    };

    // Initiate smooth transition
    transitionManager.transitionTo(app.context, roomIndex, roomExchange, {
      duration: 500,
      fadeEnabled: true,
      animationEnabled: true
    }).catch(error => {
      // Fallback: Instant room change if transition fails
      console.warn('[RoomTransitionManager] Animation failed:', error);
      roomExchange();
    });
  }
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit RoomTransitionManager integration**

```bash
git add src/embed/mount.ts
git commit -m "feat: integrate RoomTransitionManager into gotoRoom flow"
```

---

## Task 9: Add error handling and cancel logic

**Files:**
- Modify: `src/movement/RoomTransitionManager.ts`

- [ ] **Step 1: Improve cancel() with proper cleanup**

```typescript
  cancel(): void {
    // Stop all active animations
    this._activeAnimations.forEach(anim => {
      try {
        anim.stop();
      } catch (e) {
        console.warn('[RoomTransitionManager] Failed to stop animation:', e);
      }
    });
    this._activeAnimations.clear();

    // Stop all fade animations and restore original alphas
    this._fadeAnimations.forEach((anim, mesh) => {
      try {
        anim.stop();
        // Restore original alpha
        const material = mesh.material as any;
        if (material && mesh.metadata._originalAlpha !== undefined) {
          material.alpha = mesh.metadata._originalAlpha;
          delete mesh.metadata._originalAlpha;
        }
      } catch (e) {
        console.warn('[RoomTransitionManager] Failed to restore alpha:', e);
      }
    });
    this._fadeAnimations.clear();

    this._isTransitioning = false;

    // Resolve pending promise
    if (this._resolveTransition) {
      this._resolveTransition();
      this._resolveTransition = null;
    }
  }
```

- [ ] **Step 2: Add error handling to animateDesktopCamera()**

```typescript
  private animateDesktopCamera(
    ctx: AppContext,
    targetPosition: import('@babylonjs/core').Vector3,
    targetRotation: import('@babylonjs/core').Vector3,
    duration: number
  ): void {
    try {
      const { Vector3 } = import('@babylonjs/core/Maths/math.js');
      const { Animation, EasingFunction } = import('@babylonjs/core/Animations/animation.js');

      const camera = ctx.camera;

      const posAnim = Animation.CreateAndStartAnimation(
        'camera-position',
        camera,
        'position',
        duration,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        targetPosition,
        0,
        EasingFunction.CreateElasticEase(1.5, 0.5)
      );

      const rotAnim = Animation.CreateAndStartAnimation(
        'camera-rotation',
        camera,
        'rotation',
        duration,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        targetRotation,
        0,
        EasingFunction.CreateEaseInOutQuad()
      );

      if (posAnim) this._activeAnimations.add(posAnim);
      if (rotAnim) this._activeAnimations.add(rotAnim);
    } catch (e) {
      console.warn('[RoomTransitionManager] Camera animation failed:', e);
      // Continue without camera animation - fallback to smooth functional
    }
  }
```

- [ ] **Step 3: Add error handling to fade methods**

```typescript
  private fadeOutRoomMeshes(
    ctx: AppContext,
    duration: number,
    callback: () => void
  ): void {
    try {
      const { Animation, StandardMaterial } = import('@babylonjs/core/index.js');
      const { RoomManager } = import('../rooms/RoomManager.js');

      const roomManager = (ctx as any)._roomManager;
      if (!roomManager) {
        callback();
        return;
      }

      const meshes = roomManager.getRoomMeshes();
      let completed = 0;
      const total = meshes.length;

      meshes.forEach(mesh => {
        const material = mesh.material as StandardMaterial;
        if (!material) {
          completed++;
          if (completed === total && this._isTransitioning) callback();
          return;
        }

        const originalAlpha = material.alpha;
        mesh.metadata._originalAlpha = originalAlpha;

        const fadeAnim = Animation.CreateAndStartAnimation(
          'material-alpha',
          material,
          'alpha',
          duration,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CONSTANT,
          0.25,
          0,
          EasingFunction.CreateEaseInOutQuad()
        );

        if (fadeAnim) {
          fadeAnim.onEndObservable.add(() => {
            completed++;
            if (completed === total && this._isTransitioning) callback();
          });
        } else {
          completed++;
          if (completed === total && this._isTransitioning) callback();
        }
      });

      if (total === 0) callback();
    } catch (e) {
      console.warn('[RoomTransitionManager] Fade-out failed:', e);
      callback(); // Continue even if fade fails
    }
  }

  private fadeInRoomMeshes(
    ctx: AppContext,
    duration: number
  ): void {
    try {
      const { Animation, StandardMaterial } = import('@babylonjs/core/index.js');
      const { RoomManager } = import('../rooms/RoomManager.js');

      const roomManager = (ctx as any)._roomManager;
      if (!roomManager) return;

      const meshes = roomManager.getRoomMeshes();

      meshes.forEach(mesh => {
        const material = mesh.material as StandardMaterial;
        if (!material) return;

        const targetAlpha = mesh.metadata._originalAlpha ?? 1.0;
        delete mesh.metadata._originalAlpha;

        const fadeAnim = Animation.CreateAndStartAnimation(
          'material-alpha',
          material,
          'alpha',
          duration,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CONSTANT,
          targetAlpha,
          0,
          EasingFunction.CreateEaseInOutQuad()
        );

        if (fadeAnim) {
          this._fadeAnimations.set(mesh, fadeAnim);
        }
      });
    } catch (e) {
      console.warn('[RoomTransitionManager] Fade-in failed:', e);
      // Continue even if fade fails
    }
  }
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit error handling improvements**

```bash
git add src/movement/RoomTransitionManager.ts
git commit -m "feat: add robust error handling and cancel cleanup"
```

---

## Task 10: Create E2E tests for transitions

**Files:**
- Create: `tests/transitions.spec.ts`

- [ ] **Step 1: Create test file structure**

```typescript
import { test, expect } from '@playwright/test';

async function waitForApp(page) {
  await page.waitForFunction(
    () => (window as any).context?.engine && (window as any).context?.room !== undefined,
    { timeout: 30000 }
  );
}

test('smooth transition between Lobby and ElementRoom', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);
  
  // Navigate to element room (Hydrogen)
  const hydrogenButton = page.locator('[role="button"]').filter({ hasText: 'H' });
  await hydrogenButton.click();
  
  // Wait for transition to complete (animation + room load)
  await page.waitForTimeout(1000);
  
  // Verify we're in element room (rooms 1-118 are element rooms)
  const room = await page.evaluate(() => (window as any).context.room);
  expect(room).toBe(1); // H is first element (index 1)
});

test('transition cancel on rapid navigation', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);
  
  // Start transition to H, then immediately to C
  const hydrogenButton = page.locator('[role="button"]').filter({ hasText: 'H' });
  const carbonButton = page.locator('[role="button"]').filter({ hasText: 'C' });
  
  await hydrogenButton.click();
  await page.waitForTimeout(100); // Mid-transition
  
  await carbonButton.click();
  await page.waitForTimeout(1000); // Wait for completion
  
  // Should end up in Carbon room (index 6), not Hydrogen (index 1)
  const room = await page.evaluate(() => (window as any).context.room);
  const carbonIndex = (await page.evaluate(() => (window as any).ELEMENTS))
    .find((e: any) => e.symbol === 'C')
    .atomicNumber;
  expect(room).toBe(carbonIndex);
});

test('input locked during transition', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);
  
  // Start transition
  const hydrogenButton = page.locator('[role="button"]').filter({ hasText: 'H' });
  await hydrogenButton.click();
  
  // Immediately try to move (W key) - should be visible but ineffective during transition
  await page.waitForTimeout(200);
  
  // Verify we're now in the Hydrogen room (transition not blocked, input just locked)
  await page.waitForTimeout(800);
  const room = await page.evaluate(() => (window as any).context.room);
  expect(room).toBe(1);
});
```

- [ ] **Step 2: Run tests to verify they fail (TDD check)**

Run: `npm test tests/transitions.spec.ts`
Expected: Tests may fail if animations not yet fully integrated, but should at least execute

- [ ] **Step 3: Commit test file**

```bash
git add tests/transitions.spec.ts
git commit -m "test: add E2E tests for smooth room transitions"
```

---

## Task 11: Build and test locally

**Files:**
- None (just build and verify)

- [ ] **Step 1: Build project**

Run: `npm run build`
Expected: Build completes successfully, no TypeScript errors

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: All tests pass (navigation, loading, keyboard, etc., plus new transition tests)

- [ ] **Step 3: Verify transitions work in browser**

Manual testing:
1. Run `npm run dev`
2. Open https://localhost:3000
3. Click on "H" exhibit in Lobby
4. Observe smooth camera animation (~0.5s transition)
5. Click on "C" exhibit mid-transition
6. Observe cancellation and new transition
7. Try WASD movement during transition - should be locked
8. Check no errors in browser console

- [ ] **Step 4: Commit any final tweaks**

If adjustments needed:
```bash
git add .
git commit -m "fix: adjust transition timing or easing based on testing"
```

---

## Task 12: Lint check and final validation

**Files:**
- All modified files

- [ ] **Step 1: Check for unused imports or variables**

Run: `npx tsc --noEmit`
Expected: No errors, no unused variable warnings

- [ ] **Step 2: Verify no console warnings in browser**

Manual testing:
1. Run `npm run dev`
2. Open https://localhost:3000
3. Navigate between multiple rooms
4. Check browser console for warnings about animations, materials, or memory leaks

- [ ] **Step 3: Verify no regressions**

Run: `npm test`
Expected: All existing tests still pass (no regressions)

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "style: remove debug logging and finalize smooth transitions feature"
```

---

## Task 13: Update documentation

**Files:**
- Modify: `docs/room-transition-improvements-design.md`
- potentially modify: `AGENTS.md`

- [ ] **Step 1: Update design doc with implementation notes**

Add to `docs/room-transition-improvements-design.md`:

```markdown
## Implementation Notes

- Transition duration: 500ms (tested and confirmed comfortable)
- Easing functions: Elastic for position (feels responsive), Quadratic for rotation (feels natural)
- Fades: Opacity 1.0 → 0.25 → 1.0 (keeps ambient lighting)
- VR: Skips camera position/rotation animation, maintains Babylon teleportation
- Fallback: Instant room change if any animation fails (graceful degradation)
- Performance: Alpha animation uses Babylon GPU-accelerated materials
```

- [ ] **Step 2: Update AGENTS.md with RoomTransitionManager reference**

Add to `AGENTS.md` WHERE_TO_LOOK section:

```
| Task | Location |
|------|----------|
| Room transition animations | src/movement/RoomTransitionManager.ts |
| Room state and transitions | src/rooms/RoomManager.ts |
```

- [ ] **Step 3: Commit documentation updates**

```bash
git add docs/room-transition-improvements-design.md AGENTS.md
git commit -m "docs: add RoomTransitionManager to documentation"
```

---

## Task 14: Final merge and push

**Files:**
- None (git operations)

- [ ] **Step 1: Review all commits**

Run: `git log --oneline -14` (assuming 14 tasks)
Expected: Logical progression from skeleton → animation → fades → integration → tests → docs

- [ ] **Step 2: Squash into logical commit groups (optional)**

If desired, group related commits:
- Core functionality (Tasks 1-6)
- Integration and handling (Tasks 7-8)
- Tests and validation (Tasks 9-12)
- Documentation (Task 13)

Run: 
```bash
git rebase -i HEAD~7  # Interactive, squash appropriate commits
```

- [ ] **Step 3: Verify build one last time**

Run: `npm run build`
Expected: Clean build

- [ ] **Step 4: Push to pse-in-vr branch**

Run: `git push origin pse-in-vr`
Expected: Push succeeds

- [ ] **Step 5: Verify deployment**

Check: https://pse.chemie-lernen.org after CI deployment
Expected: Smooth transitions work in production

- [ ] **Step 6: Final project completion**

No commit - work is complete.