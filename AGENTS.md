# PSE - Periodic Table VR Experience

**Generated:** 2026-02-16
**Commit:** auto-generated
**Branch:** docker-deployment

Immersive WebXR educational visualization for exploring the Periodic Table of Elements in Virtual Reality with interactive chemistry experiments.

**Status:** Active development. Based on WebXR/Three.js/ECSY architecture.

---

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Entry point, room navigation | `src/index.js` |
| Interaction system | `src/lib/RayControl.js` |
| Room logic | `src/rooms/*.js` |
| Experiments | `src/experiments/*.js` |
| Themes | `src/lib/RoomThemeManager.js` |
| i18n | `src/lib/I18nManager.js`, `src/locales/` |
| ECS components | `src/components/index.js` |
| Asset loading | `src/lib/assetManager.js` |
| Audio system | `src/lib/AudioManager.js` |

---

## STRUCTURE

```
src/
├── lib/              # Core libraries (RayControl, Teleport, assetManager, shaders)
├── rooms/            # VR room modules
├── experiments/      # Interactive chemistry experiments
├── locales/          # i18n translation files (en.json, de.json)
├── systems/          # ECSY entity-component systems
├── stations/         # Interactive stations within rooms
├── components/       # ECSY component definitions
└── shaders/          # GLSL shader sources

tests/                # Playwright e2e tests
assets/               # 3D models, textures, audio (oggs/, blender/)
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
npm run test:unit      # Vitest unit tests (experiments)
npm run test:a11y      # Accessibility tests

# Shaders
python packshaders.py  # Repack GLSL into src/lib/shaders.js
```

---

## FEATURES

### Interactive Experiments (6 types)
- **ReactionExperiment**: Alkali metal water reactions (Li, Na, K)
- **ElectricalExperiment**: Circuits, conductivity, magnetism
- **ElectrochemicalExperiment**: Batteries, electrolysis, galvanic cells
- **NuclearExperiment**: Fission, fusion, decay visualization
- **OrganicExperiment**: DNA helix, proteins, polymers
- **CrystalExperiment**: Lattice structures, crystal formation

### Themed Room Templates (8 themes)
| Theme | Description | Elements |
|-------|-------------|----------|
| cosmic | Space/starfield atmosphere | H, He |
| energy | Battery/power station | Li |
| life | Organic/nature | C, N, O |
| forge | Metal/industrial | Fe |
| electric | Circuit/neon | Cu |
| treasure | Gold/vault | Au |
| nuclear | Reactor/glow | U |
| default | Standard PSE colors | All others |

### Internationalization (i18n)
- German (DE) and English (EN) support
- Browser language auto-detection
- Extensible translation system via i18next

---

## NOTES

- WebXR/Three.js/ECSY architecture with immersive VR rooms
- Uses single `bundle.js` for production build
- Experiments use state machine pattern (IDLE -> PREPARING -> RUNNING -> COMPLETE)
- Unit tests with Vitest for chemistry logic, Playwright for e2e
- Enhanced with particles, starfields, and atmospheric lighting across all rooms