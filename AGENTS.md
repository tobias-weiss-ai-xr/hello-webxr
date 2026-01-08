# PSE in VR - Virtuelles Periodensystem

WebXR-basiertes virtuelles Periodensystem mit 118 Element-Räumen und 10 Experimentierräumen. Immersives Chemie-Lernerlebnis.

**Stack:** Three.js (3D), ECSY (ECS), Playwright (tests), Webpack (build), WebXR Polyfill

**Deployed:** https://chemie-lernen.org/pse-in-vr/

---

## STRUCTURE
```
/opt/git/hello-webxr/
├── src/
│   ├── data/         # Element data & room definitions
│   │   └── elements.js    # 118 elements + 10 exp rooms
│   ├── lib/          # Core libraries (RayControl, Teleport, shaders)
│   ├── systems/      # ECSY entity-component systems
│   ├── rooms/        # VR room modules (Lobby, ElementRoom, ExperimentalRoom)
│   ├── stations/     # Legacy: Interactive stations within rooms
│   └── components/   # ECSY component definitions
├── tests/            # Playwright e2e tests
├── assets/           # 3D models, textures, sounds
└── shaders/          # GLSL shader sources
```

---

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Entry point | `src/index.js` | Main init, room navigation (118+10 rooms), render loop |
| Interaction system | `src/lib/RayControl.js` | Raycasting, grab/ddrop mechanics |
| Room logic | `src/rooms/*.js` | Each exports: `setup()`, `enter()`, `exit()`, `execute()` |
| ECS components | `src/components/index.js` | All ECSY component definitions |
| Asset loading | `src/lib/assetManager.js` | Loads models, textures, audio from `assets/` |
| Element data | `src/data/elements.js` | 118 elements, colors, experiments, helpers |
| 3D models | `src/lib/modelLoader.js` | GLTF/DRACO loaders, placeholder models |
| Audio system | `src/lib/AudioManager.js` | Sound effects, music, spatial audio |
| Test runner | `tests/` | Playwright accessing `window.context` |

---

## ROOM TYPES

**Room 0: Lobby (src/rooms/lobby.js)**
- Hauptlobby als gigantisches Atom mit pulsierendem Kern
- 3D-Hologramm des Periodensystems an den Wänden
- 3 Elektronenbahnen mit animierten Elektronen
- 22 Element-Buttons (Phase 1 MVP) im Kreis angeordnet
- 10 Experimentierraum-Buttons im äußeren Ring
- Info-Panel für Element-Details bei Hover
- Teleportationszone

**Rooms 1-22: Element-Räume (src/rooms/ElementRoom.js)**
- Jedes Element hat thematisch gestalteten Raum
- Informationstafel: Symbol, Name, Ordnungszahl, Masse, Beschreibung
- 3D-Atom-Modell (Kern + Elektronen in Schalen)
- 2-3 interaktive Experiment-Stationen pro Raum
- Teleportation zurück zur Lobby
- Dynamische Bodenfarbe nach Elementgruppe

**Rooms 23+: Experimentierräume (src/rooms/ExperimentalRoom.js)**
- Reaktionslabor (Alchemistenwerkstatt)
- Nuklearphysik-Kammer (Kernkraftwerk-Kontrollraum)
- Elektrochemie-Labor (Batterien + Terminal)
- Organische Chemie (DNA-Doppelhelix)
- Extreme Bedingungen (Generisches Labor)
- Industrielle Anwendungen (Werkbank)
- Historisches Labor (Generisches Labor)
- Weltraumchemie (Generisches Labor)
- Nano-Welt (Generisches Labor)
- Challenge-Arena (Podest + Trophäe)

---

## COLOR CODING

| Gruppe | Farbe |
|--------|--------|
| Alkalimetalle | #FF6B6B |
| Erdalkalimetalle | #FFA94D |
| Übergangsmetalle | #74B9FF |
| Lanthanoide | #D63384 |
| Actinoide | #4A69BD |
| Metalle (13-16) | #20C997 |
| Metalloide | #17A2B8 |
| Nichtmetalle | #FFC107 |
| Halogene | #00D9FF |
| Edelgase | Gasentladungsfarbe (He: #FFE4E1, Ne: #FF6B00, Ar: #7B68EE, etc.) |

---

## COMMANDS

```bash
# Development
npm install
npm start              # HTTPS dev server at :8080

# Build
npm run build          # Production bundle
npm run watch          # Watch mode

# Testing
npm test              # All Playwright tests
npx playwright test tests/navigation.spec.js    # Single file
npx playwright test navigation.spec.js:10     # Specific line
npm run test:ui       # Browser UI
npm run test:headed    # Headed mode

# Shaders (if modifying .vert/.frag files)
python packshaders.py [seconds]  # Repack into src/lib/shaders.js
```

---

## ROOM NAVIGATION

```javascript
// In src/index.js
context.goto = roomIndex;  // Triggers room change

// Room indices:
// 0 = Lobby
// 1-22 = Element rooms (H, He, Li, Be, B, C, N, O, F, Ne, Na, Mg, Al, Si, P, S, Cl, Ar, Ca, Fe, Cu, Au, U)
// 23+ = Experimental rooms

// Direct navigation via URL:
// http://localhost:8080/?room=H  (Go to Hydrogen room)
// http://localhost:8080/?room=0  (Go to lobby)

// Element room creation (example):
ElementRoom.setup(ctx, 'H');  // Pass element symbol
ElementRoom.enter(ctx, 'H');
ElementRoom.exit(ctx, 'H');
ElementRoom.execute(ctx, delta, time, 'H');

// Experimental room creation (example):
ExperimentalRoom.setup(ctx, 0);  // Pass room index
ExperimentalRoom.enter(ctx, 0);
ExperimentalRoom.exit(ctx, 0);
ExperimentalRoom.execute(ctx, delta, time, 0);
```

---

## CONVENTIONS

**Module Patterns:**
- Lobby: Export 4 functions (`setup`, `enter`, `exit`, `execute`)
- ElementRoom: Same pattern, takes `elementSymbol` parameter
- ExperimentalRoom: Same pattern, takes `roomId` parameter
- Data files: Named exports (ELEMENTS, EXPERIMENTAL_ROOMS, helper functions)

**Room Structure:**
```javascript
export function setup(ctx, param) {   // param = elementSymbol or roomId
  // Create scene, lights, objects
  ctx.raycontrol.addState('name', {...});
}

export function enter(ctx, param) {
  ctx.scene.add(scene);
  ctx.raycontrol.activateState('name');
}

export function exit(ctx, param) {
  ctx.raycontrol.deactivateState('name');
  ctx.scene.remove(scene);
}

export function execute(ctx, delta, time, param) {
  // Update animations
  material.uniforms.time.value = time;
}
```

**Variable declarations:**
- `var` for module-scoped (traditional pattern here)
- `const` for constants
- `let` for block-scoped

**Imports:** Always use `.js` extension for relative paths

---

## ANTI-PATTERNS

- `as any` or type suppression (no TypeScript here, but don't add)
- Empty catch blocks - use `console.warn()`
- Direct `three/examples/jsm/...` imports - use established patterns

**Known workarounds** (preserve):
- Oculus Browser <8 controller event skips (`@FIXME` in `src/index.js`)

---

## NOTES

**WebXR:** HTTPS required, polyfill auto-initialized, check `ctx.vrMode` flag

**Context object (`ctx`) passed everywhere:**
- `ctx.scene`, `ctx.renderer`, `ctx.camera`
- `ctx.world` (ECSY), `ctx.raycontrol`, `ctx.teleport`
- `ctx.assets`, `ctx.shaders`, `ctx.audioListener`
- `ctx.GotoRoom` - Function reference for room navigation
- `ctx.cameraRig`, `ctx.controllers`, `ctx.handedness`

**Room Generation:** Dynamic room array from ELEMENTS data structure, not hardcoded

**Scalability:** ElementRoom template works for all 118 elements via symbol parameter

**Testing:** Tests inspect `window.context` for runtime state

**Performance:** `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` caps at 2x

**Pädagogische Features:**
- Drei Schwierigkeitsstufen: Anfänger, Fortgeschritten, Experte
- Mehrsprachigkeit: DE, EN
- Barrierefreiheit: Untertitel, Audio, Farbblindheits-Modi
