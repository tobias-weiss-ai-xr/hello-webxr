# src - WebXR Application Core

Application entry point and VR experience initialization.

---

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Main entry point | `index.js` | Lines 115-312: init() function |
| Asset definitions | `assets.js` | Model/texture/audio paths |
| ECS components | `components/` | index.js exports all components |
| Experiments | `experiments/` | 6 experiment types with state machines |
| Themes | `lib/RoomThemeManager.js` | 8 themed room templates |
| i18n | `lib/I18nManager.js` | DE/EN translations |
| Translations | `locales/` | en.json, de.json |

---

## STRUCTURE

```
src/
├── index.js          # Main entry point (init, animate)
├── assets.js         # Asset manifest
├── lib/              # Core VR libraries
├── rooms/            # VR room modules
├── experiments/      # Interactive chemistry experiments
├── locales/          # i18n translation files
├── systems/          # ECSY systems
├── stations/         # Interactive stations
├── components/       # ECSY components
└── shaders/          # GLSL shader sources
```

---

## INITIALIZATION FLOW

```javascript
// 1. window.onload → init() (line 425)
// 2. detectWebXR() - VR support check
// 3. ECSY World + Three.js renderer setup
// 4. loadAssets() callback → assets ready
// 5. RayControl, Teleport initialized
// 6. I18nManager.init() - load translations
// 7. room.setup() for all rooms (includes theme application)
// 8. First room.enter() → renderer.setAnimationLoop()
```

---

## EXPERIMENT INTEGRATION

Experiments are standalone classes in `src/experiments/` that extend `ExperimentBase`:

```javascript
import ReactionExperiment from '../experiments/ReactionExperiment.js';

// Create experiment with audio/haptic dependencies
const experiment = new ReactionExperiment({
  audioManager: ctx.audioManager
});

// Configure for specific element
experiment.configure('Na', 'water');

// Wire to RayControl interaction
ctx.raycontrol.addState('reaction', {
  colliderMesh: stationMesh,
  onSelectStart: () => experiment.start()
});

// Update in room execute loop
experiment.update(delta);
```

---

## CONVENTIONS

- Use `.js` extension for imports (e.g., `import RayControl from './lib/RayControl.js'`)
- Global `window.context` holds runtime state
- Room modules export setup/enter/exit/execute functions
- Experiments use state machine: IDLE -> PREPARING -> RUNNING -> COMPLETE
- Themes applied via `RoomThemeManager.applyTheme(scene, themeName, elementData)`
- Translations via `I18nManager.t('key.path')`