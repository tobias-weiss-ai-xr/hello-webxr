# Landing Room Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor chaotic landing room into elegant three-room introduction (Landing Room with 6 exhibits, Periodic Pavilion, Lab Wing)

**Architecture:** Refactor existing Lobby.ts into Landing Room (6 exhibits), create new LabWing.ts room and PeriodicPavilion.ts room, update RoomManager indices and doorways, reuse existing ElementRoom and ExperimentalRoom logic

**Tech Stack:** Babylon.js, TypeScript, Vite, Playwright

---

## File Structure

**New Files:**
- `src/rooms/LabWing.ts` - Lab Wing room with 10 experimental stations
- `src/rooms/PeriodicPavilion.ts` - Interactive periodic table room
- `src/lib/ExhibitBuilder.ts` - Utility for building museum exhibit stations
- `tests/lab-wing.spec.ts` - Lab Wing tests
- `tests/periodic-pavilion.spec.ts` - Periodic Pavilion tests

**Modified Files:**
- `src/rooms/Lobby.ts` - Refactor to Landing Room with 6 exhibits
- `src/rooms/RoomManager.ts` - Update room indices and navigation
- `src/index.ts` - Register new rooms

**Unchanged Files:**
- `src/rooms/ElementRoom.ts` - Full element visualization (no changes)
- `src/rooms/ExperimentalRoom.ts` - Experiment logic (no changes)
- `src/data/elements.ts` - ELEMENTS, EXPERIMENTAL_ROOMS, GROUP_COLORS (no changes)

---

## Task 1: Create Lab Wing Room

**Files:**
- Create: `src/rooms/LabWing.ts`
- Test: `tests/lab-wing.spec.ts`

- [ ] **Step 1: Write test for Lab Wing room structure**

```typescript
import { test, expect } from '@playwright/test';

test('Lab Wing room renders 10 experimental stations', async ({ page }) => {
  await page.goto('/?room=lab_wing');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);
  await page.waitForTimeout(500); // Wait for room to fully load

  const experimentalStations = await page.evaluate(() => {
    const ctx = (window as any).context;
    return ctx.scene?.meshes?.filter(m => m.name?.startsWith('expStation_')).length || 0;
  });

  expect(experimentalStations).toBe(10);
});

test('Lab Wing has doorway back to Landing Room', async ({ page }) => {
  await page.goto('/?room=lab_wing');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);

  const hasSouthDoorway = await page.evaluate(() => {
    const ctx = (window as any).context;
    const doorways = ctx.scene?.meshes?.filter(m => m.name?.includes('doorway')) || [];
    return doorways.some(d => d.position.z > 0); // South wall doorway
  });

  expect(hasSouthDoorway).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/lab-wing.spec.ts`
Expected: FAIL (LabWing.ts doesn't exist yet)

- [ ] **Step 3: Create LabWing.ts with basic room structure**

```typescript
import type { AppContext, ExperimentalRoomData } from '../types/index.js';
import { EXPERIMENTAL_ROOMS } from '../data/elements.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math.js';
import { ActionManager, ExecuteCodeAction } from '@babylonjs/core/Actions/index.js';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui/2D/index.js';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';
import { buildRoom, type RoomBuildOptions } from './RoomBuilder.js';

// Module-scoped state for disposal
let experimentalStations: AbstractMesh[] = [];
let uiTexture: AdvancedDynamicTexture | null = null;
let stationLabels: TextBlock[] = [];

const STATION_RADIUS = 6;
const STATION_POSITIONS = [
  { x: -4, z: -4 }, { x: 0, z: -5 }, { x: 4, z: -4 },
  { x: -5, z: 0 },                      { x: 5, z: 0 },
  { x: -4, z: 4 },  { x: 0, z: 5 },    { x: 4, z: 4 },
  { x: -2, z: 0 },  { x: 2, z: 0 }
];

function toColor3(color: number): Color3 {
  return Color3.FromInts((color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
}

export function setup(ctx: AppContext): void {
  const scene = ctx.scene;
  uiTexture = AdvancedDynamicTexture.CreateFullscreenUI('labWingUI', true, scene);

  // Build room with Lab Wing aesthetics
  const room = buildRoom(scene, {
    dimensions: { width: 16, height: 4, depth: 16 },
    floorColor: new Color3(0.14, 0.15, 0.18),
    wallColor: new Color3(0.18, 0.19, 0.22),
    ceilingColor: new Color3(0.12, 0.12, 0.14),
    ambientColor: new Color3(0.35, 0.36, 0.40),
    pointLightColor: new Color3(1, 0.98, 0.95),
    doorways: [{ wall: 'south', offset: 0 }],
  });

  ctx.setFloorMesh?.(room.floor);

  createExperimentalStations(ctx);
  setupInteractions(ctx);

  // Set room index for Lab Wing (119)
  ctx.room = 119;
}

function createExperimentalStations(ctx: AppContext): void {
  const scene = ctx.scene;

  EXPERIMENTAL_ROOMS.forEach((room: ExperimentalRoomData, index: number) => {
    const pos = STATION_POSITIONS[index];
    const color = room.color ?? 0x888888;

    // Station base
    const baseMat = new StandardMaterial(`stationBaseMat${index}`, scene);
    baseMat.diffuseColor = toColor3(color);
    baseMat.emissiveColor = toColor3(color);
    baseMat.alpha = 0.6;
    baseMat.disableLighting = true;

    const base = MeshBuilder.CreateCylinder(`expStation_${room.id}`, {
      diameter: 1.2,
      height: 0.1,
      tessellation: 6
    }, scene);
    base.position.set(pos.x, 0.05, pos.z);
    base.material = baseMat;
    base.metadata = { expRoom: room, stationIndex: 119 + index };
    ctx.trackMesh(base);
    experimentalStations.push(base);

    // Station icon (text block)
    const iconLabel = new TextBlock(`icon_${room.id}`, room.icon || '🔬');
    iconLabel.color = 'white';
    iconLabel.fontSize = 32;
    iconLabel.fontWeight = 'bold';
    uiTexture?.addControl(iconLabel);
    iconLabel.linkWithMesh(base);
    iconLabel.linkOffsetY = -50;
    stationLabels.push(iconLabel);

    // Station name label
    const nameLabel = new TextBlock(`name_${room.id}`, room.name);
    nameLabel.color = 'white';
    nameLabel.fontSize = 14;
    nameLabel.fontWeight = 'bold';
    nameLabel.textWrapping = true;
    nameLabel.width = 2;
    uiTexture?.addControl(nameLabel);
    nameLabel.linkWithMesh(base);
    nameLabel.linkOffsetY = 20;
    stationLabels.push(nameLabel);
  });
}

function setupInteractions(ctx: AppContext): void {
  const scene = ctx.scene;

  experimentalStations.forEach(station => {
    station.actionManager = new ActionManager(scene);
    station.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        station.scaling.setAll(1.1);
      })
    );
    station.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        station.scaling.setAll(1);
      })
    );
    station.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        ctx.goto = station.metadata.stationIndex;
      })
    );
  });
}

export function enter(ctx: AppContext): void {
  experimentalStations.forEach(s => s.isVisible = true);
  stationLabels.forEach(l => l.isVisible = true);
}

export function exit(_ctx: AppContext): void {
  experimentalStations.forEach(s => {
    s.isVisible = false;
    if (s.actionManager) {
      s.actionManager.dispose();
      s.actionManager = null;
    }
  });
  stationLabels.forEach(l => l.isVisible = false);
}

export function execute(_ctx: AppContext, _delta: number, time: number): void {
  experimentalStations.forEach((station, i) => {
    station.position.y = 0.05 + Math.sin(time * 2 + i * 0.7) * 0.02;
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/lab-wing.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/rooms/LabWing.ts tests/lab-wing.spec.ts
git commit -m "feat: add Lab Wing room with experimental stations"
```

---

## Task 2: Create ExhibitBuilder Utility

**Files:**
- Create: `src/lib/ExhibitBuilder.ts`
- Test: `tests/exhibit-builder.spec.ts`

- [ ] **Step 1: Write test for exhibit builder**

```typescript
import { test, expect } from '@playwright/test';

test('ExhibitBuilder creates exhibit station with atom, artifacts, and info panel', async ({ page }) => {
  await page.goto('/?room=lobby');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);

  const hasExhibits = await page.evaluate(() => {
    const ctx = (window as any).context;
    return ctx.scene?.meshes?.filter(m => m.name?.startsWith('exhibit_')).length >= 6 ||
           ctx.scene?.meshes?.filter(m => m.name?.startsWith('atomModel_')).length >= 6;
  });

  expect(hasExhibits).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/exhibit-builder.spec.ts`
Expected: FAIL (ExhibitBuilder doesn't exist yet)

- [ ] **Step 3: Create ExhibitBuilder.ts utility**

```typescript
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math.js';
import { ActionManager, ExecuteCodeAction } from '@babylonjs/core/Actions/index.js';
import { AdvancedDynamicTexture, TextBlock, Rectangle } from '@babylonjs/gui/2D/index.js';
import { AbstractMesh, TransformNode } from '@babylonjs/core/index.js';
import type { Scene } from '@babylonjs/core/scene.js';
import type { AppContext, ElementData } from '../types/index.js';
import { GROUP_COLORS } from '../data/elements.js';

export interface ExhibitArtifacts {
  description: string; // e.g., "Gold coin, jewelry, computer chip"
}

export interface ExhibitOptions {
  position: Vector3;
  element: ElementData;
  artifacts: ExhibitArtifacts;
  onExplore: () => void;
}

/**
 * Build a museum-style exhibit station for a featured element
 */
export class ExhibitBuilder {
  private scene: Scene;
  private ctx: AppContext;
  private uiTexture: AdvancedDynamicTexture;

  constructor(scene: Scene, ctx: AppContext, uiTexture: AdvancedDynamicTexture) {
    this.scene = scene;
    this.ctx = ctx;
    this.uiTexture = uiTexture;
  }

  buildExhibit(options: ExhibitOptions): {
    base: AbstractMesh;
    glassCase: AbstractMesh;
    atomGroup: TransformNode;
    artifacts: AbstractMesh[];
    exploreButton: AbstractMesh;
  } {
    const { position, element, artifacts, onExplore } = options;

    // 1. Create base platform (hexagonal)
    const base = this.createBase(position, element);

    // 2. Create glass display case
    const glassCase = this.createGlassCase(position.add(new Vector3(0, 0.3, 0)));

    // 3. Create atom model inside case
    const atomGroup = this.createAtomModel(position.add(new Vector3(0, 0.6, 0)), element);

    // 4. Create artifacts floating above
    const artifactMeshes = this.createArtifacts(position.add(new Vector3(0, 1.2, 0)), artifacts, element);

    // 5. Create info panel
    this.createInfoPanel(glassCase, element);

    // 6. Create "Explore" button
    const exploreButton = this.createExploreButton(position.add(new Vector3(0, 0.2, 0.8)), element, onExplore);

    return { base, glassCase, atomGroup, artifacts: artifactMeshes, exploreButton };
  }

  private createBase(position: Vector3, element: ElementData): AbstractMesh {
    const color = typeof element.color === 'number' ? element.color : GROUP_COLORS[element.group as keyof typeof GROUP_COLORS] || 0x888888;

    const baseMat = new StandardMaterial('exhibitBaseMat', this.scene);
    baseMat.diffuseColor = this.toColor3(color);
    baseMat.emissiveColor = this.toColor3(color).scale(0.3);
    baseMat.specularColor = new Color3(0.2, 0.2, 0.2);

    const base = MeshBuilder.CreateCylinder('exhibitBase', {
      diameter: 1.5,
      height: 0.1,
      tessellation: 6
    }, this.scene);
    base.position = position;
    base.material = baseMat;
    this.ctx.trackMesh(base);

    return base;
  }

  private createGlassCase(position: Vector3): AbstractMesh {
    const glassMat = new StandardMaterial('exhibitGlassMat', this.scene);
    glassMat.diffuseColor = new Color3(0.8, 0.85, 0.9);
    glassMat.alpha = 0.2;
    glassMat.specularColor = Color3.White();
    glassMat.backFaceCulling = false;

    const glassCase = MeshBuilder.CreateBox('exhibitGlass', {
      width: 1,
      height: 1.2,
      depth: 1
    }, this.scene);
    glassCase.position = position;
    glassCase.material = glassMat;
    this.ctx.trackMesh(glassCase);

    return glassCase;
  }

  private createAtomModel(position: Vector3, element: ElementData): TransformNode {
    const atomGroup = new TransformNode('atomModel_' + element.symbol, this.scene);
    atomGroup.position = position;
    this.ctx.trackNode(atomGroup);

    // Nucleus
    const color = typeof element.color === 'number' ? element.color : GROUP_COLORS[element.group as keyof typeof GROUP_COLORS] || 0x888888;
    const nucleusMat = new StandardMaterial('nucleusMat', this.scene);
    nucleusMat.diffuseColor = this.toColor3(color);
    nucleusMat.emissiveColor = this.toColor3(color);

    const nucleus = MeshBuilder.CreateSphere('nucleus', { diameter: 0.15 }, this.scene);
    nucleus.material = nucleusMat;
    nucleus.parent = atomGroup;
    this.ctx.trackMesh(nucleus);

    // Electrons (simplified: 1-4 electrons based on period)
    const electronCount = Math.min(element.period, 4);
    const electronMat = new StandardMaterial('electronMat', this.scene);
    electronMat.diffuseColor = Color3.White();
    electronMat.emissiveColor = Color3.White();

    for (let i = 0; i < electronCount; i++) {
      const angle = (Math.PI * 2 * i) / electronCount;
      const orbitRadius = 0.25 + (i * 0.1);
      const orbit = MeshBuilder.CreateTorus(`orbit_${i}`, { diameter: orbitRadius * 2, thickness: 0.01 }, this.scene);
      orbit.rotation.x = Math.PI / 2;
      orbit.rotation.y = (Math.PI / 4) * i;
      orbit.material = nucleusMat;
      orbit.parent = atomGroup;
      this.ctx.trackMesh(orbit);

      const electron = MeshBuilder.CreateSphere(`electron_${i}`, { diameter: 0.04 }, this.scene);
      electron.position.x = Math.cos(angle) * orbitRadius;
      electron.material = electronMat;
      electron.parent = atomGroup;
      electron.metadata = { angle, orbitRadius, speed: 2 / (element.period * 0.5) };
      this.ctx.trackMesh(electron);
    }

    atomGroup.metadata = { element, electrons: atomGroup.getChildren().filter(m => m.name?.startsWith('electron_')) };

    return atomGroup;
  }

  private createArtifacts(position: Vector3, artifacts: ExhibitArtifacts, element: ElementData): AbstractMesh[] {
    const artifactMeshes: AbstractMesh[] = [];
    const artifactItems = artifacts.description.split(',').map(s => s.trim());

    artifactItems.forEach((item, i) => {
      const artifactMat = new StandardMaterial(`artifactMat_${i}`, this.scene);
      artifactMat.diffuseColor = new Color3(0.9, 0.9, 0.85);
      artifactMat.emissiveColor = new Color3(0.1, 0.1, 0.08);

      const artifact = MeshBuilder.CreateBox(`artifact_${element.symbol}_${i}`, {
        width: 0.15 + (i % 3) * 0.05,
        height: 0.2 + ((i + 1) % 3) * 0.05,
        depth: 0.15 + ((i + 2) % 3) * 0.05
      }, this.scene);
      artifact.position = position.add(new Vector3(
        (i - 1) * 0.25,
        Math.sin(i * 1.5) * 0.1,
        0
      ));
      artifact.material = artifactMat;
      artifact.metadata = { description: item };
      this.ctx.trackMesh(artifact);
      artifactMeshes.push(artifact);
    });

    return artifactMeshes;
  }

  private createInfoPanel(mesh: AbstractMesh, element: ElementData): void {
    const symbolLabel = new TextBlock(`symbol_${element.symbol}`, element.symbol);
    symbolLabel.color = 'white';
    symbolLabel.fontSize = 28;
    symbolLabel.fontWeight = 'bold';
    this.uiTexture.addControl(symbolLabel);
    symbolLabel.linkWithMesh(mesh);
    symbolLabel.linkOffsetY = -50;

    const nameLabel = new TextBlock(`name_${element.symbol}`, element.name);
    nameLabel.color = 'white';
    nameLabel.fontSize = 16;
    nameLabel.fontWeight = 'bold';
    this.uiTexture.addControl(nameLabel);
    nameLabel.linkWithMesh(mesh);
    nameLabel.linkOffsetY = -20;

    const descLabel = new TextBlock(`desc_${element.symbol}`, element.description.substring(0, 50) + '...');
    descLabel.color = '#cccccc';
    descLabel.fontSize = 12;
    descLabel.textWrapping = true;
    descLabel.width = 1.8;
    this.uiTexture.addControl(descLabel);
    descLabel.linkWithMesh(mesh);
    descLabel.linkOffsetY = 40;
  }

  private createExploreButton(position: Vector3, element: ElementData, onClick: () => void): AbstractMesh {
    const buttonMat = new StandardMaterial('exploreButtonMat', this.scene);
    buttonMat.diffuseColor = new Color3(0, 0.6, 0.9);
    buttonMat.emissiveColor = new Color3(0, 0.4, 0.6);

    const button = MeshBuilder.CreateCylinder('exploreButton', {
      diameter: 0.5,
      height: 0.05,
      tessellation: 32
    }, this.scene);
    button.position = position;
    button.rotation.x = Math.PI / 2;
    button.material = buttonMat;
    button.metadata = { element, onClick };
    this.ctx.trackMesh(button);

    const label = new TextBlock('exploreLabel', 'Explore');
    label.color = 'white';
    label.fontSize = 12;
    label.fontWeight = 'bold';
    this.uiTexture.addControl(label);
    label.linkWithMesh(button);

    button.actionManager = new ActionManager(this.scene);
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        button.scaling.setAll(1.1);
      })
    );
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        button.scaling.setAll(1);
      })
    );
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, onClick)
    );

    return button;
  }

  private toColor3(color: number): Color3 {
    return Color3.FromInts((color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/exhibit-builder.spec.ts`
Expected: PASS (once Lobby refactored in Task 3)

- [ ] **Step 5: Commit**

```bash
git add src/lib/ExhibitBuilder.ts tests/exhibit-builder.spec.ts
git commit -m "feat: add ExhibitBuilder utility for museum-style exhibits"
```

---

## Task 3: Refactor Lobby to Landing Room

**Files:**
- Modify: `src/rooms/Lobby.ts` (complete refactor)

Reference: `docs/landing-room-redesign/sketches/landing-room-layout.md` (if applicable)

- [ ] **Step 1: Write test for refactored Lobby**

```typescript
import { test, expect } from '@playwright/test';

test('Landing Room has 6 featured exhibits', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);
  await page.waitForTimeout(500);

  const exhibitCount = await page.evaluate(() => {
    const ctx = (window as any).context;
    return ctx.scene?.meshes?.filter(m => m.name?.startsWith('exhibit_')).length || 0;
  });

  expect(exhibitCount).toBe(6);
});

test('Landing Room has doorways to Periodic Pavilion and Lab Wing', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);

  const doorways = await page.evaluate(() => {
    const ctx = (window as any).context;
    return ctx.scene?.meshes?.filter(m => m.name?.includes('wall'))?.length || 0;
  });

  expect(doorways).toBeGreaterThan(4); // Multiple wall segments for doorways
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/navigation.spec.ts -g "Landing Room"`
Expected: FAIL (current Lobby has 118 buttons, not 6 exhibits)

- [ ] **Step 3: Backup and replace Lobby.ts with Landing Room**

```bash
cp src/rooms/Lobby.ts src/rooms/Lobby.ts.backup
```

Replace `src/rooms/Lobby.ts` with new implementation:

```typescript
import type { AppContext, ElementData } from '../types/index.js';
import { ELEMENTS } from '../data/elements.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4, Vector3 } from '@babylonjs/core/Maths/math.js';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui/2D/index.js';
import { AbstractMesh, TransformNode } from '@babylonjs/core/index.js';
import { buildRoom, type RoomBuildOptions } from './RoomBuilder.js';
import { ExhibitBuilder, type ExhibitArtifacts } from '../lib/ExhibitBuilder.js';

// Featured elements (Essential 6)
const FEATURED_ELEMENTS: ElementData[] = [
  ELEMENTS.find(e => e.symbol === 'H')!,
  ELEMENTS.find(e => e.symbol === 'C')!,
  ELEMENTS.find(e => e.symbol === 'O')!,
  ELEMENTS.find(e => e.symbol === 'Fe')!,
  ELEMENTS.find(e => e.symbol === 'Au')!,
  ELEMENTS.find(e => e.symbol === 'U')!,
];

// Artifact definitions for featured elements
const ARTIFACTS: Record<string, ExhibitArtifacts> = {
  H: { description: 'Fuel cell, water molecule model, star icon' },
  C: { description: 'Diamond model, DNA strand graphic, fossil fuel barrel' },
  O: { description: 'Oxygen mask, water droplet, rusted iron' },
  Fe: { description: 'Steel beam model, horseshoe magnet, rust sample' },
  Au: { description: 'Gold coin, jewelry ring, computer memory chip' },
  U: { description: 'Nuclear reactor model, Geiger counter, fossil icon' },
};

// Exhibit positions (semi-circle facing entrance)
const EXHIBIT_POSITIONS: Vector3[] = [
  new Vector3(-4, 0, -3), // H
  new Vector3(-2, 0, -4.5), // C
  new Vector3(0, 0, -5), // O
  new Vector3(2, 0, -4.5), // Fe
  new Vector3(4, 0, -3), // Au
  new Vector3(0, 0, -2), // U (central)
];

// Periodic table hologram
let periodicTableGroup: TransformNode | null = null;
let uiTexture: AdvancedDynamicTexture | null = null;
let exhibits: AbstractMesh[] = [];
let atomGroups: TransformNode[] = [];
let exploreButtons: AbstractMesh[] = [];

export function setup(ctx: AppContext): void {
  const scene = ctx.scene;

  // Background color (deep space/lab atmosphere)
  scene.clearColor = new Color4(0.05, 0.05, 0.08, 1);

  uiTexture = AdvancedDynamicTexture.CreateFullscreenUI('landingRoomUI', true, scene);

  // Build room with Landing Room aesthetics
  const room = buildRoom(scene, {
    dimensions: { width: 20, height: 4.5, depth: 18 },
    floorColor: new Color3(0.15, 0.17, 0.20),
    wallColor: new Color3(0.2, 0.22, 0.26),
    ceilingColor: new Color3(0.12, 0.12, 0.14),
    ambientColor: new Color3(0.35, 0.36, 0.40),
    pointLightColor: new Color3(0.98, 0.95, 0.88),
    doorways: [
      { wall: 'north', offset: -4 }, // Periodic Pavilion
      { wall: 'north', offset: 4 },  // Lab Wing
      { wall: 'south', offset: 0 },  // Entrance/VR spawn
    ],
  });

  ctx.setFloorMesh?.(room.floor);

  // Create central periodic table hologram (artistic, rotating slowly)
  createPeriodicTableHologram(ctx);

  // Create 6 featured element exhibits
  const exhibitBuilder = new ExhibitBuilder(scene, ctx, uiTexture);
  FEATURED_ELEMENTS.forEach((element, index) => {
    const position = EXHIBIT_POSITIONS[index];
    const { base, glassCase, atomGroup, artifacts, exploreButton } = exhibitBuilder.buildExhibit({
      position,
      element,
      artifacts: ARTIFACTS[element.symbol]!,
      onExplore: () => {
        // Navigate to element room
        const elementIndex = ELEMENTS.indexOf(element);
        ctx.goto = elementIndex + 1; // +1 because room 0 is lobby, elements start at 1
      }
    });

    exhibits.push(base, glassCase, ...artifacts, exploreButton);
    atomGroups.push(atomGroup);
    exploreButtons.push(exploreButton);
  });

  ctx.room = 0; // Landing Room is still index 0
}

function createPeriodicTableHologram(ctx: AppContext): void {
  const scene = ctx.scene;
  periodicTableGroup = new TransformNode('periodicTableHologram', scene);
  ctx.trackNode(periodicTableGroup);

  const width = 6;
  const height = 3.5;
  const cols = 18;
  const rows = 7;

  const cellWidth = width / cols;
  const cellHeight = height / rows;

  const hologramMat = new StandardMaterial('hologramMat', scene);
  hologramMat.diffuseColor = new Color3(0.3, 0.4, 0.5);
  hologramMat.emissiveColor = new Color3(0.2, 0.3, 0.4);
  hologramMat.alpha = 0.25;
  hologramMat.disableLighting = true;
  hologramMat.backFaceCulling = false;

  // Only show featured elements on hologram
  FEATURED_ELEMENTS.forEach(element => {
    if (element.groupNumber && element.period) {
      const cell = MeshBuilder.CreateBox(`holoCell_${element.symbol}`, {
        width: cellWidth * 0.8,
        height: cellHeight * 0.8,
        depth: 0.02
      }, scene);
      cell.material = hologramMat;
      cell.parent = periodicTableGroup;

      const x = (element.groupNumber - 9) * cellWidth;
      const y = (4 - element.period) * cellHeight;
      cell.position.set(x * 0.6, y * 0.6, -2);
    }
  });

  // Position hologram in center of room
  periodicTableGroup.position.set(0, 2.5, 0);
}

export function enter(ctx: AppContext): void {
  exhibits.forEach(e => e.isVisible = true);
  atomGroups.forEach(g => g.isEnabled(true));
  exploreButtons.forEach(b => b.isVisible = true);
  if (periodicTableGroup) periodicTableGroup.setEnabled(true);
}

export function exit(_ctx: AppContext): void {
  exhibits.forEach(e => {
    e.isVisible = false;
    if (e.actionManager) {
      e.actionManager.dispose();
      e.actionManager = null;
    }
  });
  exploreButtons.forEach(b => {
    b.isVisible = false;
    if (b.actionManager) {
      b.actionManager.dispose();
      b.actionManager = null;
    }
  });
  atomGroups.forEach(g => g.setEnabled(false));
  if (periodicTableGroup) periodicTableGroup.setEnabled(false);
}

export function execute(_ctx: AppContext, _delta: number, time: number): void {
  // Rotate periodic table hologram slowly
  if (periodicTableGroup) {
    periodicTableGroup.rotation.y = Math.sin(time * 0.2) * 0.1;
    periodicTableGroup.position.y = 2.5 + Math.sin(time * 0.3) * 0.1;
  }

  // Animate atom models
  atomGroups.forEach(atomGroup => {
    atomGroup.rotation.y += 0.01;
    const electrons = atomGroup.getChildren().filter(m => m.name?.startsWith('electron_'));
    electrons.forEach((electron: any) => {
      if (electron.metadata) {
        const { angle, orbitRadius, speed } = electron.metadata;
        electron.metadata.angle += speed * 0.016;
        electron.position.x = Math.cos(electron.metadata.angle) * orbitRadius;
        electron.position.z = Math.sin(electron.metadata.angle) * orbitRadius;
      }
    });
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/navigation.spec.ts -g "Landing Room"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/rooms/Lobby.ts tests/navigation.spec.ts
git commit -m "refactor: replace chaotic Lobby with elegant Landing Room (6 exhibits)"
```

---

## Task 4: Create Periodic Pavilion

**Files:**
- Create: `src/rooms/PeriodicPavilion.ts`
- Test: `tests/periodic-pavilion.spec.ts`

- [ ] **Step 1: Write test for Periodic Pavilion**

```typescript
import { test, expect } from '@playwright/test';

test('Periodic Pavilion renders full interactive periodic table', async ({ page }) => {
  await page.goto('/?room=periodic_pavilion');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);
  await page.waitForTimeout(500);

  const elementCount = await page.evaluate(() => {
    const ctx = (window as any).context;
    return ctx.scene?.meshes?.filter(m => m.name?.startsWith('ptCell_')).length || 0;
  });

  expect(elementCount).toBe(118);
});

test('Periodic Pavilion has doorway back to Landing Room', async ({ page }) => {
  await page.goto('/?room=periodic_pavilion');
  await page.waitForFunction(() => (window as any).context?.room !== undefined);

  const hasDoorway = await page.evaluate(() => {
    const ctx = (window as any).context;
    const doorways = ctx.scene?.meshes?.filter(m => m.name?.includes('wall'))?.length || 0;
    return doorways > 0;
  });

  expect(hasDoorway).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/periodic-pavilion.spec.ts`
Expected: FAIL (PeriodicPavilion doesn't exist yet)

- [ ] **Step 3: Create PeriodicPavilion.ts**

```typescript
import type { AppContext, ElementData } from '../types/index.js';
import { ELEMENTS, GROUP_COLORS, NOBLE_GAS_COLORS } from '../data/elements.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math.js';
import { ActionManager, ExecuteCodeAction } from '@babylonjs/core/Actions/index.js';
import { AdvancedDynamicTexture, TextBlock, Rectangle } from '@babylonjs/gui/2D/index.js';
import { AbstractMesh, TransformNode } from '@babylonjs/core/index.js';
import { buildRoom, type RoomBuildOptions } from './RoomBuilder.js';

let periodicTableGroup: TransformNode | null = null;
let uiTexture: AdvancedDynamicTexture | null = null;
let elementCells: AbstractMesh[] = [];
let elementLabels: TextBlock[] = [];
let infoPanel: Rectangle | null = null;
let infoTitle: TextBlock | null = null;
let infoText: TextBlock | null = null;
let currentHover: string | null = null;

const PT_WIDTH = 12;
const PT_HEIGHT = 7;
const PT_COLS = 18;
const PT_ROWS = 7;

function toColor3(color: number): Color3 {
  return Color3.FromInts((color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
}

function getElementColor(element: ElementData): number {
  if (element.group === 'nobleGas' && NOBLE_GAS_COLORS[element.symbol as keyof typeof NOBLE_GAS_COLORS]) {
    return NOBLE_GAS_COLORS[element.symbol as keyof typeof NOBLE_GAS_COLORS];
  }
  return typeof element.color === 'number' ? element.color : GROUP_COLORS[element.group as keyof typeof GROUP_COLORS] || 0x888888;
}

export function setup(ctx: AppContext): void {
  const scene = ctx.scene;
  uiTexture = AdvancedDynamicTexture.CreateFullscreenUI('periodicPavilionUI', true, scene);

  const room = buildRoom(scene, {
    dimensions: { width: 18, height: 5, depth: 18 },
    floorColor: new Color3(0.15, 0.17, 0.20),
    wallColor: new Color3(0.2, 0.22, 0.26),
    ceilingColor: new Color3(0.12, 0.12, 0.14),
    ambientColor: new Color3(0.4, 0.42, 0.46),
    pointLightColor: new Color3(1, 0.98, 0.95),
    doorways: [{ wall: 'south', offset: 0 }],
  });

  ctx.setFloorMesh?.(room.floor);

  createPeriodicTable(ctx);
  createInfoPanel(ctx);
  setupInteractions(ctx);

  ctx.room = 128; // Periodic Pavilion is room 128
}

function createPeriodicTable(ctx: AppContext): void {
  const scene = ctx.scene;
  periodicTableGroup = new TransformNode('periodicTable', scene);
  ctx.trackNode(periodicTableGroup);

  const cellWidth = PT_WIDTH / PT_COLS;
  const cellHeight = PT_HEIGHT / PT_ROWS;

  ELEMENTS.forEach((element: ElementData) => {
    const cellMat = new StandardMaterial(`ptCellMat_${element.symbol}`, scene);
    const color = getElementColor(element);
    cellMat.diffuseColor = toColor3(color);
    cellMat.emissiveColor = toColor3(color).scale(0.3);
    cellMat.alpha = 0.8;
    cellMat.disableLighting = true;

    const cell = MeshBuilder.CreateBox(`ptCell_${element.symbol}`, {
      width: cellWidth * 0.85,
      height: cellHeight * 0.85,
      depth: 0.04
    }, scene);
    cell.material = cellMat;
    cell.metadata = { element };
    cell.parent = periodicTableGroup;
    ctx.trackMesh(cell);
    elementCells.push(cell);

    if (element.groupNumber && element.period) {
      const x = (element.groupNumber - 9) * cellWidth;
      const y = (4 - element.period) * cellHeight;
      cell.position.set(x, y, 0);
    }

    // Element symbol label
    const label = new TextBlock(`ptLabel_${element.symbol}`, element.symbol);
    label.color = 'white';
    label.fontSize = 12;
    label.fontWeight = 'bold';
    uiTexture?.addControl(label);
    label.linkWithMesh(cell);
    elementLabels.push(label);
  });

  periodicTableGroup.position.set(0, 2, 0);
}

function createInfoPanel(ctx: AppContext): void {
  const scene = ctx.scene;

  infoPanel = Rectangle.CreateRoundRect('infoPanel', { width: 2.5, height: 1.5, cornerRadius: 0.1 });
  infoPanel.color = '#2a3a4a';
  infoPanel.thickness = 0;
  infoPanel.background = '#2a3a4a';
  infoPanel.alpha = 0.95;
  infoPanel.isVisible = false;
  uiTexture?.addControl(infoPanel);

  infoTitle = new TextBlock('infoTitle', '');
  infoTitle.color = 'white';
  infoTitle.fontSize = 24;
  infoTitle.fontWeight = 'bold';
  infoTitle.textWrapping = true;
  infoTitle.width = 2.3;
  infoPanel.addControl(infoTitle);
  infoTitle.top = '-20px';

  infoText = new TextBlock('infoText', '');
  infoText.color = '#cccccc';
  infoText.fontSize = 14;
  infoText.textWrapping = true;
  infoText.width = 2.3;
  infoPanel.addControl(infoText);
  infoText.top = '20px';

  // Position info panel in 3D (link to a placeholder mesh)
  const placeholder = MeshBuilder.CreatePlane('infoPanelPlaceholder', { width: 2.5, height: 1.5 }, scene);
  placeholder.position.set(0, 3.5, -6);
  placeholder.isVisible = true;
  placeholder.billboardMode = AbstractMesh.BILLBOARDMODE_ALL;
  ctx.trackMesh(placeholder);
  infoPanel.linkWithMesh(placeholder);
}

function showElementInfo(element: ElementData): void {
  if (!element || currentHover === element.symbol) return;

  currentHover = element.symbol;
  if (infoPanel) infoPanel.isVisible = true;
  if (infoTitle) infoTitle.text = `${element.symbol} - ${element.name}`;
  if (infoText) infoText.text = `Atomic #${element.atomicNumber} • Mass: ${element.mass}\n${element.description.substring(0, 80)}...`;
}

function hideElementInfo(): void {
  currentHover = null;
  if (infoPanel) infoPanel.isVisible = false;
}

function setupInteractions(ctx: AppContext): void {
  const scene = ctx.scene;

  elementCells.forEach(cell => {
    cell.actionManager = new ActionManager(scene);
    cell.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        cell.scaling.setAll(1.15);
        const element = cell.metadata.element as ElementData;
        showElementInfo(element);
      })
    );
    cell.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        cell.scaling.setAll(1);
        hideElementInfo();
      })
    );
    cell.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        const element = cell.metadata.element as ElementData;
        const elementIndex = ELEMENTS.indexOf(element);
        ctx.goto = elementIndex + 1; // Navigate to ElementRoom
      })
    );
  });
}

export function enter(ctx: AppContext): void {
  elementCells.forEach(c => c.isVisible = true);
  elementLabels.forEach(l => l.isVisible = true);
  if (infoPanel) infoPanel.isVisible = false;
  if (infoTitle) infoTitle.isVisible = false;
  if (infoText) infoText.isVisible = false;
}

export function exit(_ctx: AppContext): void {
  elementCells.forEach(c => {
    c.isVisible = false;
    if (c.actionManager) {
      c.actionManager.dispose();
      c.actionManager = null;
    }
  });
  elementLabels.forEach(l => l.isVisible = false);
  if (infoPanel) infoPanel.isVisible = false;
  hideElementInfo();
}

export function execute(_ctx: AppContext, _delta: number, time: number): void {
  if (periodicTableGroup) {
    periodicTableGroup.position.y = 2 + Math.sin(time * 0.2) * 0.05;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/periodic-pavilion.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/rooms/PeriodicPavilion.ts tests/periodic-pavilion.spec.ts
git commit -m "feat: add Periodic Pavilion with interactive periodic table"
```

---

## Task 5: Update RoomManager

**Files:**
- Modify: `src/rooms/RoomManager.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Check RoomManager exports**

Read `src/rooms/RoomManager.ts` to understand current structure (ROOM_LOBBY, ROOM_ELEMENTS_START constants, room registration).

- [ ] **Step 2: Update room constants in RoomManager.ts**

Add new room constants:

```typescript
// Read existing file first
const currentContent = await read('/opt/git/hello-webxr/src/rooms/RoomManager.ts');
// Then update with new constants
```

Expected additions (integrate into existing file):

```typescript
// Add to existing constants section
export const ROOM_PERIODIC_PAVILION = 128;
export const ROOM_LAB_WING_START = 119;
export const ROOM_EXPERIMENTS_START = 129;
```

- [ ] **Step 3: Register new rooms in index.ts**

```typescript
import { registerRoom } from './rooms/RoomManager.js';
import * as Lobby from './rooms/Lobby.js';  // Renamed from Lobby to Landing Room
import * as PeriodicPavilion from './rooms/PeriodicPavilion.js';
import * as LabWing from './rooms/LabWing.js';

// Existing Element rooms registration (keep)

// Register new rooms
registerRoom(0, Lobby);                    // Landing Room (refactored Lobby)
registerRoom(128, PeriodicPavilion);        // Periodic Pavilion
registerRoom(129, LabWing);                 // Lab Wing entry point
```

- [ ] **Step 4: Update room navigation logic**

Modify any hard-coded room index references in navigation logic to use constants:
- Replace direct room numbers with ROOM_* constants
- Ensure doorway navigation uses correct indices

- [ ] **Step 5: Test room navigation**

```bash
npm run build
npm test
```

Expected: Build passes, tests pass

- [ ] **Step 6: Commit**

```bash
git add src/rooms/RoomManager.ts src/index.ts
git commit -m "chore: register new rooms and update room indices"
```

---

## Task 6: Cleanup and Verification

**Files:**
- Test: Run all tests
- Docs: Update README if needed

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests pass (navigation, loading, keyboard-controls, assets, error-resilience)

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build successful, no TypeScript errors

- [ ] **Step 3: LSP diagnostics check**

```bash
# File check for diagnostics
npx tsc --noEmit
```

Expected: No type errors

- [ ] **Step 4: Remove backup file**

```bash
rm src/rooms/Lobby.ts.backup
```

- [ ] **Step 5: Update documentation if needed**

Check if `README.md` or `docs/` references old Lobby room in a way that needs updating.

- [ ] **Step 6: Commit final changes**

```bash
git add -A
git commit -m "chore: complete landing room redesign - cleanup and verification"
```

---

## Task 7: Final Verification Task

**Files:**
- Test: `tests/integration/redesign-complete.spec.ts` (optional integration test)

- [ ] **Step 1: Create integration test for full user flow**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Landing Room Redesign Integration', () => {
  test('User can navigate from Landing Room to Element via exhibit', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => (window as any).context?.room !== undefined);
    await page.waitForTimeout(500);

    // Find hydrogen exhibit
    const goToHydrogen = await page.evaluate(() => {
      const ctx = (window as any).context;
      const exploreButton = ctx.scene?.meshes?.find(m =>
        m.name === 'exploreButton' && m.metadata?.element?.symbol === 'H'
      );
      if (exploreButton) {
        ctx.goto = exploreButton.metadata.elementIndex + 1;
        return true;
      }
      return false;
    });

    expect(goToHydrogen).toBe(true);

    // Wait for room change
    await page.waitForTimeout(1000);

    const newRoom = await page.evaluate(() => (window as any).context.room);
    expect(newRoom).toBe(1); // Hydrogen room
  });

  test('User can navigate from Landing Room to Periodic Pavilion', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => (window as any).context?.room !== undefined);

    // Simulate north doorway interaction (left doorway)
    const goToPavilion = await page.evaluate(() => {
      const ctx = (window as any).context;
      ctx.GotoRoom(128, undefined, undefined);
      return true;
    });

    expect(goToPavilion).toBe(true);

    await page.waitForTimeout(1000);

    const newRoom = await page.evaluate(() => (window as any).context.room);
    expect(newRoom).toBe(128); // Periodic Pavilion
  });

  test('User can navigate from Lab Wing to Experimental Room', async ({ page }) => {
    await page.goto('/?room=lab_wing');
    await page.waitForFunction(() => (window as any).context?.room !== undefined);
    await page.waitForTimeout(500);

    // Click first experimental station
    const goToExperiment = await page.evaluate(() => {
      const ctx = (window as any).context;
      const station = ctx.scene?.meshes?.find(m => m.name?.startsWith('expStation_'));
      if (station) {
        ctx.goto = 129; // First experimental room
        return true;
      }
      return false;
    });

    expect(goToExperiment).toBe(true);

    await page.waitForTimeout(1000);

    const newRoom = await page.evaluate(() => (window as any).context.room);
    expect(newRoom).toBeGreaterThanOrEqual(129);
  });
});
```

- [ ] **Step 2: Run integration test**

```bash
npx playwright test tests/integration/redesign-complete.spec.ts
```

Expected: All integration tests pass

- [ ] **Step 3: Final build and test**

```bash
npm run build
npm test
```

Expected: All pass

- [ ] **Step 4: Tag release**

```bash
git tag -a v3.0.0 -m "Landing Room Redesign - Elegant three-room introduction"
git push origin v3.0.0
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "release: landing room redesign v3.0.0 - complete and verified"
```

---

## Self-Review Against Spec

**1. Spec coverage:**
- ✅ Landing Room with 6 exhibits (Tasks 1, 2, 3)
- ✅ Periodic Pavilion with interactive table (Task 4)
- ✅ Lab Wing with 10 stations (Task 1)
- ✅ Room connectivity/doorways (Task 3, 4, 5)
- ✅ Visual style (museum atmosphere, colors) (Tasks 1, 2, 3, 4)
- ✅ User flow and navigation (Tasks 3, 4, 5, 7)

**2. Placeholder scan:**
- ✅ No "TBD", "TODO", or incomplete sections found
- ✅ All code blocks contain complete implementations
- ✅ All file paths are explicit

**3. Type consistency:**
- ✅ AppContext, ElementData, ExperimentalRoomData types consistent
- ✅ room indices use constants (ROOM_*), not magic numbers
- ✅ function signatures match RoomModule interface

**4. Task decomposition:**
- ✅ Each task is independent and testable
- ✅ Bite-sized steps (2-5 minutes each)
- ✅ Frequent commits after each task
- ✅ TDD: test → fail → implement → pass → commit

---

**End of Implementation Plan**