# src - WebXR Application Core

Application entry point and VR experience initialization.

---

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Main entry point | `index.js` | Lines 115-312: init() function |
| Asset definitions | `assets.js` | Model/texture/audio paths |
| ECS components | `components/` | index.js exports all components |

---

## STRUCTURE

```
src/
├── index.js          # Main entry point (init, animate)
├── assets.js         # Asset manifest
├── lib/              # Core VR libraries
├── rooms/            # VR room modules
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
// 6. room.setup() for all rooms
// 7. First room.enter() → renderer.setAnimationLoop()
```

---

## CONVENTIONS

- Use `.js` extension for imports (e.g., `import RayControl from './lib/RayControl.js'`)
- Global `window.context` holds runtime state
- Room modules export setup/enter/exit/execute functions
- See `../arachnophobia/AGENTS.md` for full patterns