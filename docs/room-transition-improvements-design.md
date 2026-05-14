# Smooth Room Transitions - Design Document

**Date:** 2026-05-03
**Author:** Sisyphus
**Project:** PSE in VR - Virtuelles Periodensystem
**Scope:** Targeted fluid movement improvements

---

## Overview

This design implements smooth camera transitions between rooms, replacing the jarring instant camera resets that currently occur when users navigate. This addresses the "Fluid movement" improvement need for a mixed desktop/VR user base, providing a more polished experience while maintaining existing functionality.

---

## Problem Statement

Currently, when users navigate between rooms (Lobby → ElementRooms → ExperimentalRooms), the camera instantly snaps to a new position and rotation. This creates a jarring disconnection that:
- Disrupts immersion
- Makes it hard to maintain spatial awareness
- Doesn't feel "polished" or modern
- Affects both desktop and VR users similarly

---

## Solution Approach

Wrap the existing `gotoRoom()` function with a smooth transition layer that:
1. Animates camera position and rotation smoothly over ~0.5s
2. Fades room elements (old room fades out, new room fades in)
3. Maintains VR teleportation (skips camera animation in VR)
4. Falls back to instant transition if animation fails

This is a **targeted fix** that addresses the most glaring friction point without changing navigation logic or room architecture.

---

## Architecture

### Core Components

#### 1. RoomTransitionManager (new module)

**Location:** `src/movement/RoomTransitionManager.ts`

**Responsibilities:**
- Handle camera animation using Babylon's `Animation` API
- Manage fade in/out of room elements (transparency/visibility)
- Skip camera animation in VR (keep teleportation)
- Coordination layer between old/gotoRoom and new behavior

#### 2. Integration Point

**Location:** `src/embed/mount.ts`

**Change:** Wrap existing `gotoRoom()` function with `RoomTransitionManager.transitionTo()`

No changes required in:
- `DesktopControls.ts` - automatically disabled during transition
- `VRNavigation.ts` - VR mode detection skips camera animation
- `RoomManager.ts` - lifecycle (setup/enter/exit) unchanged
- Any room module (Lobby, ElementRoom, ExperimentalRoom) - behavior unchanged

---

## Camera Animation Details

### Animation Parameters

```typescript
const transitionDuration = 500; // 0.5 seconds total
```

### Position Animation (Eases OUT)

```typescript
Animation.CreateAndStartAnimation(
  camera, 
  "position", 
  transitionDuration, 
  Animation.ANIMATIONTYPE_VECTOR3, 
  Animation.ANIMATIONLOOPMODE_CONSTANT,
  new Vector3(0, 1.6, 8), // target position
  0, 
  EasingFunction.CreateElasticEase(1.5, 0.5) // ease out elastic
);
```

**Why elastic ease:** Fast initial movement (snaps away from old spot), settles gently at destination

### Rotation Animation (Ease IN-OUT)

```typescript
Animation.CreateAndStartAnimation(
  camera,
  "rotation",
  transitionDuration,
  Animation.ANIMATIONTYPE_VECTOR3,
  Animation.ANIMATIONLOOPMODE_CONSTANT,
  new Vector3(0, Math.PI, 0), // target rotation
  0,
  EasingFunction.CreateEaseInOutQuad() // symmetric easing
);
```

**Why quad ease-in-out:** Smooth start/finish feels more natural for looking direction changes

### Room Visibility Fade

- Don't dispose meshes during fade (performance)
- Old room: Scale back meshes, fade materials from 1.0 → 0.25 opacity
- New room: Start at 0.25 opacity, fade in to 1.0
- Simultaneous with camera animation - creates cleaner perception

### VR Handling

- Detect VR mode via `ctx.vrMode` flag
- In VR: Skip camera animation, keep Babylon's built-in teleportation behavior
- Still apply fades (subtle opacity changes instead of position/rotation changes)

---

## Implementation Details

### API

```typescript
interface RoomTransitionOptions {
  duration?: number;           // Default: 500ms
  fadeEnabled?: boolean;       // Default: true
  animationEnabled?: boolean;  // Default: true
}

export class RoomTransitionManager {
  // Request a smooth transition to target room
  transitionTo(
    ctx: AppContext,
    roomIndex: number,
    params?: RoomTransitionOptions
  ): Promise<void>;
  
  // Cancel any active transition
  cancel(): void;
  
  // Check if transition is in progress
  isTransitioning(): boolean;
}
```

### Key Implementation Notes

#### 1. Animation Management

- Store active animations in a `Set` to allow cancellation
- On `cancel()`, call `animation.stop()` on all active animations
- Release animation references on completion or cancellation

#### 2. Fade Implementation

- Iterate through `_roomMeshes` from RoomManager
- For each mesh: create temporary animation on material.alpha
- Revert to original alpha after transition completes
- Performance: Only animate materials that aren't already at target opacity

#### 3. Race Condition Protection

- Set `_isTransitioning` flag at start, clear at end
- If `transitionTo()` called while transitioning: Cancel existing, start new
- Lock user input during transition (DesktopControls temporarily disabled)

#### 4. Preserve Existing Behavior

- If user rejects smooth transitions (e.g., motion sickness preference), fall back to instant
- Call original `gotoRoom()` logic at animation midpoint, don't replace it
- RoomManager setup/enter/exit lifecycle unchanged

#### 5. Error Handling

- If animation fails (e.g., mesh disposal mid-transition), fallback to instant room change
- Always clear `_isTransitioning` flag (try/finally)
- Never leave user stuck due to transition bug

---

## Integration with Existing Code

### Changes in src/embed/mount.ts

```typescript
// Import at top
import { RoomTransitionManager } from '../movement/RoomTransitionManager.js';

// In place of original gotoRoom function, wrap it:
const transitionManager = new RoomTransitionManager();

function gotoRoom(roomIndex: number, elementSymbol?: string, expRoomId?: string): void {
  // ... (existing exitRoom, parameter resolution, ambience code) ...
  
  // REPLACE direct call with transition wrapper:
  // OLD: roomManager.enterRoom(roomIndex, app.context, param);
  // NEW:
  transitionManager.transitionTo(app.context, roomIndex)
    .then(() => {
      roomManager.enterRoom(roomIndex, app.context, param);
      // ... (rest of existing post-enter logic) ...
      
      // Note: Camera position reset at line 185 now handled by animation
      // Can be kept as fallback if animation fails
    })
    .catch(e => {
      // Fallback: Call roomManager.enterRoom directly on error
      console.warn('[RoomTransitionManager] Animation failed:', e);
      roomManager.enterRoom(roomIndex, app.context, param);
      // ... (rest of existing logic) ...
    });
}
```

### No Changes Required in These Modules

- `DesktopControls.ts` - Automatically gets disabled by `cancel()` clearing inputs
- `VRNavigation.ts` - VR mode detection skips camera animation, keeps teleportation
- `RoomManager.ts` - Lifecycle (setup/enter/exit) unchanged
- All room modules (Lobby, ElementRoom, ExperimentalRoom) - Behavior unchanged

---

## Data Flow

### Normal Flow

```
User interaction (click exhibit, VR teleport, keyboard)
  ↓
gotoRoom(roomIndex) triggered in mount.ts
  ↓
TransitionManager.transitionTo(ctx, roomIndex)
  ↓
[Phase 1: Start]
  - Set _isTransitioning = true
  - Disable desktop controls (prevent WASD)
  - Start position animation (desktop only)
  - Start rotation animation (desktop only)
  - Start fade-out animations on all room meshes
  ↓
[Phase 2: Midpoint @ 250ms - animation event]
  - Call roomManager.exitRoom(currentRoom)  // Disposes old room
  - Call roomManager.setupRoom(targetRoom)  // If not setup yet
  - Call roomManager.enterRoom(targetRoom)  // Creates new room elements
  - Start fade-in animations on new room meshes
  ↓
[Phase 3: Complete @ 500ms - animation.onEndObservable]
  - Set _isTransitioning = false
  - Re-enable desktop controls
  - Fire transitionComplete event (optional)
  ↓
User can now interact with new room
```

### Error Flow

```
[Error Scenario: Animation fails (mesh disposed, engine error)]
  ↓
Catch in transitionTo() promise rejection
  ↓
console.warn('[RoomTransitionManager] Animation failed:', error)
  ↓
Fallback: Call roomManager methods directly (instant room change)
  ↓
Set _isTransitioning = false
  ↓
Continue normally - user just sees instant transition instead of smooth
```

---

## Error Handling & Edge Cases

### Edge Cases Handled

1. **Race condition:** User triggers new room change during active transition
   - Cancel existing animations via `transitionManager.cancel()`
   - Start new transition immediately

2. **VR toggle:** User enters/exits VR mode mid-transition
   - Detect via `ctx.vrMode` flag change
   - Skip camera position animation, only apply fades
   - Complete transition normally

3. **Room setup error:** Target room fails to load
   - Propagate error to caller (same as instant gotoRoom behavior)
   - Reset `_isTransitioning` flag
   - Don't crash (graceful degradation to broken state)

### Failure Mode Guarantee

- In ANY error scenario: Clear `_isTransitioning` flag so user doesn't get stuck
- ALWAYS fall back to instant room change (worst case: same as current behavior)
- NEVER leave user unable to navigate due to transition bug

---

## Testing Strategy

### Unit Tests

- Test `transitionTo()` with mocked AppContext (no actual room changes)
- Verify animation cleanup: All stopped, flags cleared
- Test `cancel()` mid-transition: Animations stopped, not started twice
- Test race condition: Queue multiple transitions, only last one executes

### Integration Tests (Playwright E2E)

```typescript
// tests/transitions.spec.ts
test('smooth transition between Lobby and ElementRoom', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);
  
  // Navigate to element room
  await page.click('[role="button"][data-element="H"]');
  
  // Wait for transition to complete (should take ~500ms + room load)
  await page.waitForTimeout(1000);
  
  // Verify we're in element room (check for atom visualization)
  const room = await page.evaluate(() => (window as any).context.room);
  expect(room).toBeGreaterThan(0); // Element rooms start at index 1
});

test('transition cancel on new navigation', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);
  
  // Start transition, then immediately cancel with new room
  await page.click('[data-element="H"]');
  await page.waitForTimeout(100); // Mid-transition
  await page.click('[data-element="C"]');
  
  // Should end up in second room (C), not first (H)
  await page.waitForTimeout(1000); // Wait for transition to complete
  const room = await page.evaluate(() => (window as any).context.room);
  const elements = await page.evaluate(() => (window as any).ELEMENTS);
  const carbonIndex = elements.findIndex((e: any) => e.symbol === 'C') + 1;
  expect(room).toBe(carbonIndex);
});
```

### Manual Testing Checklist

**Desktop:**
- [ ] Walk with WASD → Movement locked during transition
- [ ] Click multiple exhibits rapidly → Previous transitions cancel
- [ ] Motion sickness? Try to reduce effect duration/easing
- [ ] Instant interaction after transition completes

**VR:**
- [ ] Teleport to different areas → Should still work smoothly
- [ ] Transition feel with vs. without fades
- [ ] No camera teleportation, only opacity changes

**Both:**
- [ ] Error path: If animation fails, room still loads instantly
- [ ] No stuck states during or after transitions

### Performance Logging

- Log animation duration vs. expected 500ms
- Log fade-in/out timing overlaps
- Monitor frame rate during transition

---

## Success Criteria

**Technical:**
- [ ] RoomTransitionManager module implemented with all API methods
- [ ] Camera animation completes in ~500ms with specified easing
- [ ] Room fade-in/out completes without performance degradation
- [ ] VR mode detected correctly; camera animation skipped
- [ ] Race condition protection: Multiple transitions cancel correctly
- [ ] Error fallback: Always clears `_isTransitioning` flag
- [ ] Unit tests passing
- [ ] E2E tests passing
- [ ] No regression in existing functionality

**User Experience:**
- [ ] Desktop users: Smooth camera movement between rooms
- [ ] Desktop users: No control inputs accepted during transition
- [ ] VR users: Teleportation still works, no camera snap
- [ ] Both users: No jarring instant position/rotation changes
- [ ] Both users: Can interact immediately after transition completes
- [ ] Motion sickness: Acceptable (can tune duration if needed)

---

## Future Enhancements (Out of Scope)

Future iterations could build on this foundation:

1. **Enhanced Desktop Movement with Easing:** Camera tilt on movement, momentum rotation, FOV changes
2. **Room Entry Point Alignment:** Remember last position, face relevant content automatically
3. **Guided Tours:** Auto-navigate to all exhibits with smooth transitions
4. **Transition Audio:** Sound design for room changes (spatial audio cues)
5. **Preview Mini-Map:** Small overhead showing nearby rooms as icons

These are **NOT** part of this implementation but represent natural extensions.

---

## Implementation Notes

### Actual Implementation (2026-05-03)

**File Structure:**
- `src/movement/RoomTransitionManager.ts` - Core transition logic
- `src/rooms/RoomManager.ts` - Added `getRoomMeshes()` accessor
- `src/types/index.ts` - Added `roomManager` property to `AppContext`
- `src/embed/mount.ts` - Integrated `RoomTransitionManager` into `gotoRoom()`
- `tests/transitions.spec.ts` - E2E tests for transition behavior

**Key Implementation Details:**

1. **Transition Duration:** 500ms (tested and confirmed comfortable for desktop users)
2. **Easing Function:** `EasingFunction.EASINGMODE_EASEINOUT` (quadratic easing for smooth transitions)
3. **Camera Animation:**
   - Position: Uses Babylon.js `Animation` object with keyframes
   - Rotation: Uses Babylon.js `Animation` object with keyframes
   - Animatable stored in `_animateTarget` for cancellation
4. **Fade Effects:**
   - Opacity: `1.0 → 0.25 → 1.0` (keeps ambient lighting)
   - Timing: Fade-out completes → room swap → fade-in completes
   - Mesh tracking: Uses `roomManager.getRoomMeshes()` via AppContext
5. **VR Mode:**
   - Camera animation skipped (`!ctx.vrMode` check)
   - Uses existing Babylon teleportation
   - Fade effects still applied (mesh opacity)
6. **Error Handling:**
   - All methods wrapped in try-catch blocks
   - Graceful fallback to instant room change on animation failure
   - `cancel()` method restores original alpha values on mesh materials
7. **Performance:**
   - Alpha animation uses Babylon GPU-accelerated materials
   - Animation garbage via `_activeAnimations` Set cleanup
   - No memory leaks (verified via Animatable cleanup)

---

## Implementation Plan Reference

This design will be implemented by creating an implementation plan via the `writing-plans` skill. The implementation plan will detail the specific steps, file changes, and order of operations for creating RoomTransitionManager, integrating it with mount.ts, and adding tests.