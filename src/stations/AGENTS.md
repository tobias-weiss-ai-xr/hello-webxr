# src/stations - Interactive Stations

Self-contained interaction modules within rooms.

---

## KEY FILES
| File | Purpose |
|------|---------|
| `Xylophone.js` | Musical xylophone |
| `Paintings.js` | Painting display |
| `Graffiti.js` | Graffiti drawing |
| `PanoBalls.js` | 360° panorama viewing |
| `NewsTicker.js` | Scrolling text ticker |
| `InfoPanels.js` | Info display panels |
| `InfoPanelsData.js` | Static panel data |

---

## STATION PATTERN

**Exports:** `setup(ctx, hall)`, `enter(ctx)`, `exit(ctx)`, `execute(ctx, delta, time)`

```javascript
xylophone.setup(ctx, hall);  // hall = parent THREE.Group
xylophone.enter(ctx);
xylophone.execute(ctx, delta, time);
xylophone.exit(ctx);
```

---

## INTERACTION SETUP

```javascript
export function setup(ctx, hall) {
  const mesh = new THREE.Mesh(geo, mat);
  hall.add(mesh);

  ctx.raycontrol.addState('myStation', {
    colliderMesh: [mesh],
    controller: 'primary',
    onHover: (intersection, active) => { },
    onSelectStart: (intersection, e) => { }
  });
}
```

---

## NOTES

- `hall` = parent THREE.Group to add objects to
- Stations use `ctx.assets` for models/textures/audio
- Stations scoped to room, not globally active
- Some stations skip `enter()`/`exit()`