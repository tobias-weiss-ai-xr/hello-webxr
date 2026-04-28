# Landing Room Redesign Design

**Date**: 2026-04-28
**Project**: PSE in VR - Virtuelles Periodensystem
**Goal**: Transform chaotic landing room into elegant, educational introduction to chemistry

---

## Problem Statement

The current landing room includes 118 element buttons arranged in a circle, 10 experimental room buttons, an animated atom with orbiting electrons, and a rotating periodic table hologram. This creates visual chaos and doesn't provide a structured introduction to the application. Users are overwhelmed with choices and immediately confronted with options without understanding what they're looking at.

## Solution Overview

Redesign the landing experience into **three interconnected rooms**:

1. **Landing Room** - Primary introduction with 6 featured element exhibits
2. **Periodic Pavilion** - Full interactive periodic table to browse all 118 elements
3. **Lab Wing** - Dedicated space for experimental rooms

This provides a gentle onboarding experience (6 featured elements) while maintaining full access to all content (periodic table) and specialized features (experiments).

---

## Room 1: Landing Room

### Purpose

Elegant introduction showcasing 6 essential elements through museum-style exhibits. Teaches users what the application is about by example, not explanation.

### Featured Elements (Essential 6)

1. **Hydrogen (H)** - Elements of the universe
2. **Carbon (C)** - Foundations of life
3. **Oxygen (O)** - Breath of life
4. **Iron (Fe)** - Industry and civilization
5. **Gold (Au)** - Precious metals
6. **Uranium (U)** - Nuclear energy

### Layout

```
[Door to Periodic Pavilion]
  |
  |  ╔══════════════════════════════╗
  |  ║                              ║
  |  ║  [Periodic Table Hologram]   ║
  |  ║   (rotating, artistic)       ║
  |  ║                              ║
  |  ║    Exibit 1    Exhibit 2     ║
  |  ║    Exhibit 3    Exhibit 4    ║
  |  ║    Exhibit 5    Exhibit 6    ║
  |  ║                              ║
[VR]                               [Door to Lab Wing]
```

### Exhibit Station Design

Each featured element station includes:

1. **Display Case**: Glass-enclosed platform with element symbol above
2. **Atom Model**: Interactive 3D atom visualization (scaled-down ElementRoom)
3. **Real-World Artifacts**: 2-3 items representing actual applications
4. **Info Panel**: Element name, symbol, atomic number, brief description
5. **"Explore More" Button**: Opens full ElementRoom for detailed exploration

### Artifact Examples

| Element | Artifacts |
|---------|-----------|
| H | Fuel cell, water molecule model, star icon (cosmic abundance) |
| C | Diamond model, DNA strand graphic, fossil fuel barrel (stylized) |
| O | Oxygen mask, water droplet, rusted iron (oxidation) |
| Fe | Steel beam model, horseshoe magnet, rust sample |
| Au | Gold coin, jewelry ring, computer memory chip |
| U | Nuclear reactor model (stylized), Geiger counter, fossil icon |

### Interactions

- **Hover over atom**: Slows rotation, highlights orbit path
- **Click artifact**: Shows popup with context (e.g., "Gold in electronics - excellent conductor")
- **Click "Explore"**: Opens ElementRoom with full visualization

---

## Room 2: Periodic Pavilion

### Purpose

Focused space to browse and access all 118 elements in an organized, non-chaotic way.

### Layout

```
┌─────────────────────────────────────┐
│                                     │
│     [Large Flat Periodic Table]      │
│           (Interactive)              │
│                                     │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
          [Door back to Lobby]
```

### Features

- **Large flat periodic table hologram**: Floating at eye level, interactive
- **Group-based color coding**: Visible using existing GROUP_COLORS
- **Minimal interface**: Hover for info, click to explore
- **Visual feedback**: Glow and scale up on hover

### Interactions

- **Hover**: Shows symbol, name, atomic number in tooltip
- **Click**: Opens ElementRoom with full visualization
- **Optional**: Filter toggles (show only metals, non-metals, etc.)

### Design Notes

- Simplifies current periodic table (no rotation, fixed position)
- Focuses on discovery and browsing, not chaotic 118-buttons circle
- Keeps ElementRoom functionality intact
- Periodic table becomes a tool, not decorative chaos

---

## Room 3: Lab Wing

### Purpose

Dedicated space for experimental chemistry simulations. Separates experiments from element exploration to reduce cognitive load.

### Layout

```
[Door to Lobby]
     |
  ┌──┴──┐
  │ Lab │  [10 Experimental Stations]
  │ Wing│  One per EXPERIMENTAL_ROOMS
  └─────┘
```

### Experimental Station Design

Each experimental station includes:

1. **Icon**: Emoji from EXPERIMENTAL_ROOMS (e.g., 🧪, ☢️)
2. **Name**: Room name (e.g., "Reaktionslabor")
3. **Description**: 1-2 sentences from existing EXPERIMENTAL_ROOMS data
4. **"Enter Lab" Button**: Navigates to ExperimentalRoom
5. **Color**: Themed color from EXPERIMENTAL_ROOMS.color

### Stations List

1. Reaktionslabor (reaction_lab) 🧪 - Die Alchemistenwerkstatt
2. Nuklearphysik (nuclear_chamber) ☢️ - Kernkraftwerk-Kontrollraum
3. Elektrochemie (electrochem_lab) 🔋 - Batterien und Elektrolyse
4. Organische Chemie (organic_chem) 🧬 - Das Kohlenstoff-Universum
5. Extreme Bedingungen (extreme_conditions) 🌡️ - Grenzen der Materie
6. Industrielle Anwendungen (industrial_apps) 🏭 - Großindustrie der Chemie
7. Historisches Labor (historical_lab) 🏛️ - Meilensteine der Entdeckung
8. Weltraumchemie (space_chem) 🚀 - Chemie im Kosmos
9. Nano-Welt (nano_world) 🔬 - Die atomare Perspektive
10. Challenge-Arena (challenge_arena) 🏆 - Quiz und Wettkampf

### Benefits of Separation

- Reduces landing room clutter
- Groups related functionality
- Sets expectations: experiments are distinct from element exploration
- Allows future expansion of lab features without main room redesign

---

## Visual Style & Atmosphere

### Color Palette

- **Floor**: Dark slate (0.15, 0.17, 0.20) — anchor space, not distraction
- **Walls**: Cool gray-blue (0.2, 0.22, 0.26) — neutral backdrop
- **Lighting**: Warm white point lights (0.98, 0.95, 0.88) on exhibits, soft ambient (0.4, 0.42, 0.48)
- **Accents**: Element group colors preserved in exhibits and periodic table

### Materials

- **Floor**: Matte, low-specular (0.1)
- **Exhibits**: Glass display cases, metallic frames, subtle reflections
- **Walls**: Matte, non-reflective

### Audio

- **Subtle ambient hum**: Faint laboratory sound (low volume)
- **Soft reverb**: Feeling of larger, professional space
- **No electron orbit noise**: These are in exhibits only, not background

### Typography

- **Style**: Clean sans-serif for readability
- **Sizing**: Hierarchical (symbols large, names medium, descriptions small)
- **Contrast**: High (white text on dark backgrounds) for VR readability

---

## Technical Implementation Strategy

### Architecture Alignment

1. **Room System**: Use existing `RoomModule` interface (setup, enter, exit, execute)
2. **ElementRoom**: Reuse unchanged for full element exploration
3. **Lab Wing**: Create new room type (wraps ExperimentalRoom.ts logic)
4. **Periodic Pavilion**: Simplified version of current `createPeriodicTableHologram()`

### Room Index Extension

Current system:
```
0         = Lobby
1-118     = Element rooms
119+      = Experimental rooms
```

New system:
```
0         = Landing Room (repurposed)
1-118     = Element rooms (unchanged)
119-128   = Lab Wing exhibitions (prepares user for experiments)
129+      = Experimental rooms (actual simulations)
```

### Data Reuse

- **ELEMENTS array**: All element data already present
- **EXPERIMENTAL_ROOMS**: Keep existing, use for Lab Wing stations
- **GROUP_COLORS, NOBLE_GAS_COLORS**: Preserve in Periodic Pavilion
- **ElementRoom.ts**: No changes needed
- **ExperimentalRoom.ts**: No changes needed (wraps existing logic)

### Mesh Tracking

- Use existing `ctx.trackMesh()` for all exhibit components
- Proper disposal on `exit()` via RoomManager
- Follow Babylon.js convention: module-scoped `let` variables for scene objects

### UI Framework

- **AdvancedDynamicTexture**: For text panels (existing usage)
- **ActionManager**: For interactions (hover, click)
- **TextBlock**: For labels and info panels
- No new dependencies required

---

## User Journey

### Step 1: Spawn → Landing Room

User enters the application and sees:
- 6 elegant exhibit stations in a semi-circle
- Central rotating periodic table hologram (artistic, not overwhelming)
- Clear doorways to Periodic Pavilion (left) and Lab Wing (right)

### Step 2: Exploration Options

User has three pathways:

1. **Quick Exploration (Recommended)**:
   - Click an exhibit's "Explore" button
   - Opens ElementRoom with full visualization
   - Return to Lazy via room exit

2. **Browse All Elements**:
   - Enter Periodic Pavilion
   - Hover/click elements from periodic table
   - Open ElementRoom for any element

3. **Run Experiments**:
   - Enter Lab Wing
   - Choose experiment station
   - Navigate to ExperimentalRoom

### Step 3: Room Navigation

- Doorways always connect back to previous room
- No dead ends or confusing layouts
- Visual indicators for doorways (lighting, signage)
- Landing Room acts as central hub

### Step 4: Experience Flow

```
[VR Spawn]
    ↓
[Landing Room] ← → [Periodic Pavilion] → [ElementRooms]
    ↓
[Lab Wing] → [ExperimentalRooms]

Users can always return to Landing Room via doorways or GotoRoom(0).
```

---

## Success Criteria

### User Experience

- **Onboarding time**: Users understand layout within 30 seconds
- **Navigation clarity**: No confusion about where to go or what to do
- **Cognitive load**: Reduced chaos, focused choices
- **Discovery**: Easy to find specific elements or experiments

### Performance

- **Frame rate**: Maintain 90fps in VR (no degradation vs current)
- **Memory**: Comparable or lower than current implementation
- **Load time**: No increase in initial load time

### Maintainability

- **Code organization**: Clear separation of rooms, focused responsibilities
- **Data reuse**: Leverage existing ELEMENTS and EXPERIMENTAL_ROOMS
- **Testing**: Playwright tests verify navigation and basic interactions

---

## Future Considerations

### Potential Enhancements

1. **Guided Tour**: Optional narrator intro for first-time users
2. **Search Functionality**: Search elements by name or symbol in Periodic Pavilion
3. **Favorites/Recent**: Quick access to recently viewed elements
4. **Achievement System**: Unlock bonus elements after completing certain ones
5. **VR Hand Tracking**: Enhanced interactions with exhibits

### Scalability

- **Room system**: Designed to add more rooms easily
- **Exhibit expansion**: Could add more featured elements to Landing Room
- **Lab expansion**: New experimental rooms can be added without redesign
- **A/B testing**: Different exhibit arrangements can be tested

---

## References

- **Existing Code**:
  - `src/rooms/Lobby.ts` - Current landing room (to be refactored)
  - `src/rooms/ElementRoom.ts` - Full element visualization (unchanged)
  - `src/rooms/ExperimentalRoom.ts` - Experiment logic (wrapped in Lab Wing)
  - `src/data/elements.ts` - ELEMENTS, EXPERIMENTAL_ROOMS, GROUP_COLORS
  - `src/rooms/RoomBuilder.ts` - Room construction utilities

- **Babylon.js Features**:
  - AdvancedDynamicTexture for UI
  - ActionManager for interactions
  - SceneLoader for asset loading
  - MeshBuilder for geometry

- **TypeScript Patterns**:
  - Modular room exports (setup, enter, exit, execute)
  - Type-safe event handling
  - Shared type definitions (AppContext, ElementData, ExperimentalRoomData)

---

## Implementation Phases

See separate implementation plan document for detailed steps.

**Phase 1**: Create Lab Wing room (simplest, independent)
**Phase 2**: Refactor Landing Room (remove chaos, add 6 exhibits)
**Phase 3**: Create Periodic Pavilion (interactive periodic table)
**Phase 4**: Update RoomManager (new indices, connectivity)
**Phase 5**: Testing & verification (Playwright tests, VR testing)

---

**End of Design Document**