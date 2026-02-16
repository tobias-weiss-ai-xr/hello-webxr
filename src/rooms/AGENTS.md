# src/rooms - VR Rooms

Self-contained VR environments and interaction spaces.

---

## KEY FILES
| File | Purpose |
|------|---------|
| `ElementRoom.js` | Main element room with experiments and themed visuals |
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

## THEMED ROOMS

ElementRoom uses `RoomThemeManager` to apply visual themes based on element data:

```javascript
import roomThemeManager from '../lib/RoomThemeManager.js';

// In setupElement()
const themeResult = roomThemeManager.applyTheme(scene, element.theme, element);

// Store cleanup function for exit
themeCleanup = themeResult.cleanup;
```

### Available Themes
| Theme | Visual Style | Elements |
|-------|-------------|----------|
| cosmic | Deep space, starfield, blue accent | H, He |
| energy | Electric grid, orange glow | Li |
| life | Green gradient, organic particles | C, N, O |
| forge | Industrial, orange/red glow | Fe |
| electric | Circuit traces, cyan accent | Cu |
| treasure | Vault interior, gold dust | Au |
| nuclear | Reactor aesthetic, green glow | U |
| default | Standard PSE colors | All others |

---

## EXPERIMENT STATIONS

ElementRoom creates experiment stations based on `element.experiments[]` array:

```javascript
// Each element has experiments defined in src/data/elements.js
// Example: Na has ['water', 'flame'] experiments

// Station creation pattern
const station = createExperimentStation(experimentType, position);
station.userData.experimentType = experimentType;
scene.add(station);

// Wire to experiment class
import ReactionExperiment from '../experiments/ReactionExperiment.js';

const experiment = new ReactionExperiment({ audioManager: ctx.audioManager });
experiment.configure(element.symbol, 'water');

// RayControl interaction
ctx.raycontrol.addState('experiment-water', {
  colliderMesh: station,
  onSelectStart: () => {
    if (experiment.state === 'IDLE') {
      experiment.start();
    }
  }
});
```

---

## CONVENTIONS

- Use `ctx.raycontrol` for interactions
- Use `ctx.assets` for models/textures/audio (oggs/, blender/)
- Use `ctx.GotoRoom(index)` to navigate
- Use `roomThemeManager.applyTheme()` for themed visuals
- Use `I18nManager.t('key')` for translated strings
- Cleanup in `exit()` (remove event listeners, stop animations, call themeCleanup)