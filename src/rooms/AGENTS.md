# src/rooms - VR Rooms

Self-contained VR environments and interaction spaces.

---

## KEY FILES
| File | Purpose |
|------|---------|
| `Landing.js` | Main lobby (spider room introduction) |
| `Controllers.js` | VR controller tutorial room |
| `Teleport.js` | Teleportation learning room |
| `Models.js` | 3D model viewing room (spider models) |
| `Audio.js` | Spatial audio learning room |
| `Interaction.js` | Ray-control interaction tutorial |
| `Drone.js` | Flying object control demo |
| `Gate.js` | Portal mechanics demo |

---

## PATTERNS

Export 4 functions: `setup(ctx)`, `enter(ctx)`, `exit(ctx)`, `execute(ctx, delta, time)`

```javascript
export function setup(ctx) {
  scene = new THREE.Scene();
  ctx.raycontrol.addState('name', {
    colliderMesh: [mesh],
    controller: 'primary',
    onSelectStart: (e) => { }
  });
}

export function enter(ctx) {
  ctx.scene.add(scene);
  ctx.raycontrol.activateState('name');
}

export function exit(ctx) {
  ctx.raycontrol.deactivateState('name');
  ctx.scene.remove(scene);
}

export function execute(ctx, delta, time) {
  material.uniforms.time.value = time;
}
```

---

## CONVENTIONS

- Use `ctx.raycontrol` for interactions
- Use `ctx.assets` for models/textures/audio (oggs/, blender/)
- Use `ctx.GotoRoom(index)` to navigate
- Cleanup in `exit()` (remove event listeners, stop animations)