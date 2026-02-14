# Arachnophobia - Spider VR Experience

**Generated:** 2026-02-13
**Commit:** 251ed62
**Branch:** spider-room-only

Arachnophobia spider VR experience with immersive 3D spider visualization and interaction.

**Status:** Identity/structure copy from hello-webxr. Refer to `arachnophobia/AGENTS.md` for full documentation.

---

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Full documentation | `../arachnophobia/AGENTS.md` |
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
npm start              # HTTPS dev server at :3000

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

## ANTI-PATTERNS (THIS PROJECT)

- Misleading folder name: `pse/` = spider room (NOT Periodic Table)
- Package name still `"name": "hello-webxr"` (copy-paste artifact from Mozilla)
- Branch name `spider-room-only` indicates subset of functionality
- No project-specific AGENTS.md - mirrors hello-webxr structure exactly

---

## NOTES

- Identical codebase structure to `hello-webxr/` and `arachnophobia/` (same WebXR/ECSY/Three.js patterns)
- Uses single `bundle.js` (arachnophobia has 3-way code splitting)
- Additional accessibility tests in package.json (`test:a11y`)
- Refer to `arachnophobia/AGENTS.md` for detailed room patterns, code style, and conventions