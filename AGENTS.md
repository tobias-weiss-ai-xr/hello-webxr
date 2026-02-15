# PSE - Periodic Table VR Experience

**Generated:** 2026-02-15
**Commit:** 128d8e7
**Branch:** docker-deployment

Immersive WebXR educational visualization for exploring the Periodic Table of Elements in Virtual Reality.

**Status:** Active development. Based on WebXR/Three.js/ECSY architecture.

---

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Entry point, room navigation | `src/index.js` |
| Interaction system | `src/lib/RayControl.js` |
| Room logic | `src/rooms/*.js` |
| ECS components | `src/components/index.js` |
| Asset loading | `src/lib/assetManager.js` |
| 3D models | `src/lib/modelLoader.js` |
| Audio system | `src/lib/AudioManager.js` |

---

## STRUCTURE

```
src/
├── lib/          # Core libraries (RayControl, Teleport, assetManager, shaders)
├── rooms/        # VR room modules
├── systems/      # ECSY entity-component systems
├── stations/     # Interactive stations within rooms
├── components/   # ECSY component definitions
└── shaders/      # GLSL shader sources

tests/            # Playwright e2e tests
assets/           # 3D models, textures, audio (oggs/, blender/)
```

---

## COMMANDS

```bash
# Development
npm install
npm start              # Dev server at http://localhost:8080

# Build
npm run build          # Production bundle

# Testing
npm test               # All Playwright tests
npm run test:ui        # Browser UI
npm run test:headed    # Headed mode
npm run test:a11y      # Accessibility tests

# Shaders
python packshaders.py  # Repack GLSL into src/lib/shaders.js
```

---

## NOTES

- WebXR/Three.js/ECSY architecture with immersive VR rooms
- Uses single `bundle.js` for production build
- Additional accessibility tests in package.json (`test:a11y`)
- Enhanced with particles, starfields, and atmospheric lighting across all rooms