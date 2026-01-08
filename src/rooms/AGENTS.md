# src/rooms - VR Räume

Selbstständige VR-Umgebungen für Hauptlobby, Element-Räume und Experimentierräume.

---

## KEY FILES
| File | Purpose |
|------|---------|
| `Landing.js` | Hauptlobby - Periodensystem-Übersicht, Teleportation zu Elementen |
| `Controllers.js` | VR-Controller Tutorial-Raum |
| `Teleport.js` | Teleportations-Lernraum |
| `Models.js` | 3D-Modell-Betrachtungsraum (Element-Modelle) |
| `Audio.js` | Spatial Audio Lernraum |
| `Interaction.js` | Ray-Control Interaktions-Lernraum |

---

## RAUM-TYPEN

**1. Hauptlobby (Landing.js):**
- Zentraler Raum als gigantisches Atom
- 3D-Hologramm des Periodensystems
- Schwebende Elektronenbahnen als Teleportationspfade
- Filter: Elementfamilie, Aggregatzustand, Entdeckungsjahr
- Sprachsuche: "Zeige mir Eisen"

**2. Element-Räume (118 Stück - zukünftig):**
- Thematisch gestaltet nach Elementeigenschaften
- Informationstafel: Symbol, Name, Ordnungszahl, Masse
- 3D-Atom-Modell (Bohr oder Orbitale)
- Audio-Guide für Barrierefreiheit
- 2-3 interaktive Experimente

**3. Experimentierräume (10 Stück - zukünftig):**
- Reaktionslabor (Alkalimetalle, Thermit)
- Nuklearphysik-Kammer (Kernspaltung, Fusion)
- Elektrochemie-Labor (Batterien, Elektrolyse)
- Organische Chemie (DNA, Proteine)
- Extreme Bedingungen (Superfluid-He, Plasma)
- Industrielle Anwendungen (Haber-Bosch, Hochofen)
- Historisches Labor (Marie Curie, Lavoisier)
- Weltraumchemie (Sternennukleosynthese)
- Nano-Welt (Kristallgitter, Orbitale)
- Challenge-Arena (Quiz, Multiplayer)

---

## PATTERN

Export 4 Funktionen: `setup(ctx)`, `enter(ctx)`, `exit(ctx)`, `execute(ctx, delta, time)`

```javascript
export function setup(ctx) {
  // Szene, Lichter, Objekte erstellen
  ctx.raycontrol.addState('element', {
    colliderMesh: [elementMesh],
    controller: 'primary',
    onSelectStart: (e) => {
      ctx.goto = elementRoomIndex;
    }
  });
}

export function enter(ctx) {
  ctx.scene.add(scene);
  ctx.raycontrol.activateState('element');
}

export function exit(ctx) {
  ctx.raycontrol.deactivateState('element');
  ctx.scene.remove(scene);
}

export function execute(ctx, delta, time) {
  // Animationen, Shader-Uniforms
  material.uniforms.time.value = time;
}
```

---

## RAUM-TRANSITION

Set `context.room` in `src/index.js`:

```javascript
context.room = elementIndex;  // 0-117 für Elemente
context.room = lobbyIndex;   // Hauptlobby
```

---

## KONSTANTE FEATURES PRO RAUM

- Informationstafel (Symbol, Name, OZ, Masse)
- 3D-Atom-Modell (Bohr für Anfänger, Orbitale für Fortgeschrittene)
- Audio-Guide
- Teleportation zum nächsten/vorherigen Element
- 2-3 interaktive Experimente
- Quiz-Station
