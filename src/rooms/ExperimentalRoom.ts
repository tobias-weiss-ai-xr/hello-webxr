import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4, Vector3 } from '@babylonjs/core/Maths/math.js';
import { HemisphericLight, PointLight } from '@babylonjs/core/Lights/index.js';
import { ActionManager, ExecuteCodeAction } from '@babylonjs/core/Actions/index.js';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui/2D/index.js';
import { buildRoom } from './RoomBuilder.js';
import { createDoorwayTrigger } from './DoorwayTrigger.js';

import type { AppContext, ExperimentalRoomData } from '../types/index.js';
import { EXPERIMENTAL_ROOMS } from '../data/elements.js';
import { ROOM_LOBBY } from './RoomManager.js';

const ROOM_COLORS: Record<string, Color3> = {
  reaction_lab: new Color3(1, 0.42, 0.42),
  nuclear_chamber: new Color3(0.29, 0.41, 0.74),
  electrochem_lab: new Color3(0.45, 0.73, 1),
  organic_chem: new Color3(0.13, 0.79, 0.59),
  extreme_conditions: new Color3(1, 0.66, 0.3),
  industrial_apps: new Color3(0.45, 0.73, 1),
  historical_lab: new Color3(0.84, 0.2, 0.52),
  space_chem: new Color3(0.04, 0.04, 0.1),
  nano_world: new Color3(0.09, 0.64, 0.72),
  challenge_arena: new Color3(1, 0.76, 0.03)
};

const themeColors: Record<string, { floor: Color3; wall: Color3; ceiling: Color3 }> = {
  reaction_lab: { floor: new Color3(0.2, 0.1, 0.1), wall: new Color3(0.25, 0.12, 0.12), ceiling: new Color3(0.15, 0.08, 0.08) },
  nuclear_chamber: { floor: new Color3(0.1, 0.2, 0.1), wall: new Color3(0.12, 0.25, 0.12), ceiling: new Color3(0.08, 0.15, 0.08) },
  electrochem_lab: { floor: new Color3(0.2, 0.15, 0.05), wall: new Color3(0.25, 0.18, 0.08), ceiling: new Color3(0.15, 0.1, 0.03) },
  organic_chem: { floor: new Color3(0.1, 0.1, 0.2), wall: new Color3(0.12, 0.12, 0.25), ceiling: new Color3(0.08, 0.08, 0.15) },
  extreme_conditions: { floor: new Color3(0.15, 0.15, 0.2), wall: new Color3(0.18, 0.18, 0.25), ceiling: new Color3(0.1, 0.1, 0.15) },
  industrial_apps: { floor: new Color3(0.1, 0.15, 0.2), wall: new Color3(0.12, 0.18, 0.25), ceiling: new Color3(0.08, 0.1, 0.15) },
  historical_lab: { floor: new Color3(0.15, 0.1, 0.15), wall: new Color3(0.18, 0.12, 0.18), ceiling: new Color3(0.1, 0.08, 0.1) },
  space_chem: { floor: new Color3(0.1, 0.1, 0.15), wall: new Color3(0.12, 0.12, 0.18), ceiling: new Color3(0.08, 0.08, 0.1) },
  nano_world: { floor: new Color3(0.2, 0.15, 0.1), wall: new Color3(0.25, 0.18, 0.12), ceiling: new Color3(0.15, 0.1, 0.08) },
  challenge_arena: { floor: new Color3(0.15, 0.2, 0.15), wall: new Color3(0.18, 0.25, 0.18), ceiling: new Color3(0.1, 0.15, 0.1) },
};

function makeMat(scene: import('@babylonjs/core').Scene, name: string, color: Color3, opts: { unlit?: boolean; alpha?: number; emissive?: Color3 } = {}): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = color;
  if (opts.unlit) m.disableLighting = true;
  if (opts.alpha !== undefined) m.alpha = opts.alpha;
  if (opts.emissive) m.emissiveColor = opts.emissive;
  return m;
}

let ui: AdvancedDynamicTexture;
let roomData: ExperimentalRoomData | undefined;
let animatedMeshes: import('@babylonjs/core').Mesh[] = [];
let trackedMeshes: import('@babylonjs/core').AbstractMesh[] = [];
let doorwayTriggers: { dispose: () => void }[] = [];

export function setup(ctx: AppContext, roomId?: string): void {
  if (!roomId) return;
  roomData = EXPERIMENTAL_ROOMS.find(r => r.id === roomId);
  if (!roomData) return;

  ui = AdvancedDynamicTexture.CreateFullscreenUI('expRoomUI');
  animatedMeshes = [];
  trackedMeshes = [];

  const themeColor = ROOM_COLORS[roomData.id] || new Color3(0.16, 0.16, 0.23);
  ctx.scene.clearColor = new Color4(themeColor.r * 0.1, themeColor.g * 0.1, themeColor.b * 0.1, 1);

  createRoomSpecificSetup(ctx, roomData.id, themeColor);
  createFloor(ctx, themeColor);

  // Doorway trigger: south → lobby
  const roomDimensions = { width: 10, height: 4, depth: 10 };
  doorwayTriggers.forEach(t => t.dispose());
  doorwayTriggers = [];
  doorwayTriggers.push(createDoorwayTrigger(ctx.scene, {
    doorwayConfig: { wall: 'south', offset: 0 },
    roomDimensions,
    onTrigger: () => { ctx.goto = ROOM_LOBBY; },
  }));

  createExperimentStations(ctx, roomData);
  setupLighting(ctx, themeColor);
  createTeleportZone(ctx);
  createNavigationPanel(ctx);
}

function createFloor(ctx: AppContext, themeColor: Color3): void {
  const roomId = roomData?.id || 'reaction_lab';
  const theme = themeColors[roomId] ?? themeColors.reaction_lab;
  const room = buildRoom(ctx.scene, {
    dimensions: { width: 10, height: 4, depth: 10 },
    floorColor: theme.floor,
    wallColor: theme.wall,
    ceilingColor: theme.ceiling,
    doorways: [{ wall: 'south', offset: 0 }],
  });
  
  ctx.setFloorMesh?.(room.floor);
  
  // Track all room components
  ctx.trackMesh(room.floor);
  room.walls.forEach(wall => ctx.trackMesh(wall));
  room.doorways.forEach(doorway => ctx.trackMesh(doorway));
  trackedMeshes.push(room.floor, ...room.walls, ...room.doorways);
}

function createRoomSpecificSetup(ctx: AppContext, roomId: string, themeColor: Color3): void {
  switch (roomId) {
    case 'reaction_lab': createAlchemistWorkshop(ctx); break;
    case 'nuclear_chamber': createNuclearControlRoom(ctx, themeColor); break;
    case 'electrochem_lab': createElectrochemLab(ctx); break;
    case 'organic_chem': createCarbonUniverse(ctx, themeColor); break;
    case 'extreme_conditions': createExtremeConditions(ctx); break;
    case 'industrial_apps': createIndustrialApps(ctx); break;
    case 'historical_lab': createHistoricalLab(ctx); break;
    case 'space_chem': createSpaceChem(ctx); break;
    case 'nano_world': createNanoWorld(ctx); break;
    case 'challenge_arena': createChallengeArena(ctx); break;
    default: createGenericLab(ctx); break;
  }
}

function createAlchemistWorkshop(ctx: AppContext): void {
  const table = MeshBuilder.CreateBox('alchemistTable', { width: 4, height: 1, depth: 2 }, ctx.scene);
  table.position.set(0, 0.5, 0);
  table.material = makeMat(ctx.scene, 'tableMat', new Color3(0.29, 0.29, 0.29), { unlit: true });
  ctx.trackMesh(table);
  trackedMeshes.push(table);

  const bunsen = MeshBuilder.CreateCylinder('bunsen', { diameterTop: 0.2, diameterBottom: 0.3, height: 0.8, tessellation: 16 }, ctx.scene);
  bunsen.position.set(-1.2, 1.3, -0.5);
  bunsen.material = makeMat(ctx.scene, 'bunsenMat', new Color3(0.16, 0.16, 0.16), { unlit: true });
  ctx.trackMesh(bunsen);
  trackedMeshes.push(bunsen);

  const flame = MeshBuilder.CreateCylinder('flame', { diameterTop: 0.01, diameterBottom: 0.16, height: 0.3, tessellation: 16 }, ctx.scene);
  flame.position.set(-1.2, 1.8, -0.5);
  flame.material = makeMat(ctx.scene, 'flameMat', new Color3(0.29, 0.56, 0.89), { unlit: true, alpha: 0.7 });
  ctx.trackMesh(flame);
  trackedMeshes.push(flame);
  animatedMeshes.push(flame);
}

function createNuclearControlRoom(ctx: AppContext, themeColor: Color3): void {
  const panel = MeshBuilder.CreateBox('nuclearPanel', { width: 6, height: 2, depth: 0.2 }, ctx.scene);
  panel.position.set(0, 2.5, -4);
  panel.lookAt(new Vector3(0, 2.5, 0));
  panel.material = makeMat(ctx.scene, 'nuclearPanelMat', new Color3(0.1, 0.1, 0.16), { unlit: true, alpha: 0.9 });
  ctx.trackMesh(panel);
  trackedMeshes.push(panel);

  const core = MeshBuilder.CreateCylinder('reactorCore', { diameter: 3, height: 4, tessellation: 32 }, ctx.scene);
  core.position.set(0, 2, 0);
  core.material = makeMat(ctx.scene, 'coreMat', themeColor, { unlit: true, alpha: 0.5, emissive: themeColor.scale(0.3) });
  ctx.trackMesh(core);
  trackedMeshes.push(core);
  animatedMeshes.push(core);
}

function createElectrochemLab(ctx: AppContext): void {
  const battery = MeshBuilder.CreateBox('expBattery', { width: 2, height: 1.5, depth: 0.8 }, ctx.scene);
  battery.position.set(0, 0.75, -2);
  battery.material = makeMat(ctx.scene, 'expBatteryMat', new Color3(0.45, 0.73, 1), { unlit: true });
  ctx.trackMesh(battery);
  trackedMeshes.push(battery);

  const terminal = MeshBuilder.CreateBox('terminal', { width: 3, height: 2, depth: 0.1 }, ctx.scene);
  terminal.position.set(0, 1, -4);
  terminal.material = makeMat(ctx.scene, 'terminalMat', new Color3(0.16, 0.16, 0.16), { unlit: true });
  ctx.trackMesh(terminal);
  trackedMeshes.push(terminal);
}

function createCarbonUniverse(ctx: AppContext, themeColor: Color3): void {
  const helix = MeshBuilder.CreateTorusKnot('dnaHelix', { radius: 0.8, tube: 0.08, radialSegments: 64, tubularSegments: 32, p: 2, q: 3 }, ctx.scene);
  helix.position.set(0, 2.5, 0);
  helix.material = makeMat(ctx.scene, 'helixMat', themeColor, { emissive: themeColor.scale(0.2) });
  ctx.trackMesh(helix);
  trackedMeshes.push(helix);
  animatedMeshes.push(helix);
}

function createExtremeConditions(ctx: AppContext): void {
  const chamber = MeshBuilder.CreateCylinder('pressureChamber', { diameter: 4, height: 4, tessellation: 32 }, ctx.scene);
  chamber.position.set(0, 2, 0);
  chamber.material = makeMat(ctx.scene, 'chamberMat', new Color3(1, 0.66, 0.3), { unlit: true, alpha: 0.3 });
  ctx.trackMesh(chamber);
  trackedMeshes.push(chamber);

  const plasma = MeshBuilder.CreateSphere('plasma', { diameter: 3, segments: 32 }, ctx.scene);
  plasma.position.set(0, 2, 0);
  plasma.material = makeMat(ctx.scene, 'plasmaMat', new Color3(1, 0.42, 0.21), { unlit: true, alpha: 0.6 });
  ctx.trackMesh(plasma);
  trackedMeshes.push(plasma);
  animatedMeshes.push(plasma);

  const superfluid = MeshBuilder.CreateTorus('superfluidHe', { diameter: 3.6, thickness: 0.3, tessellation: 100 }, ctx.scene);
  superfluid.position.set(3, 2, 0);
  superfluid.rotation.x = Math.PI / 2;
  superfluid.material = makeMat(ctx.scene, 'superfluidMat', new Color3(0.45, 0.73, 1), { unlit: true, alpha: 0.5 });
  ctx.trackMesh(superfluid);
  trackedMeshes.push(superfluid);
  animatedMeshes.push(superfluid);
}

function createIndustrialApps(ctx: AppContext): void {
  const furnace = MeshBuilder.CreateCylinder('blastFurnace', { diameterTop: 3, diameterBottom: 4, height: 5, tessellation: 8 }, ctx.scene);
  furnace.position.set(0, 2.5, 0);
  furnace.material = makeMat(ctx.scene, 'furnaceMat', new Color3(0.45, 0.73, 1), { unlit: true, alpha: 0.6 });
  ctx.trackMesh(furnace);
  trackedMeshes.push(furnace);

  for (let i = 0; i < 4; i++) {
    const pipe = MeshBuilder.CreateCylinder(`pipe_${i}`, { diameter: 0.6, height: 8, tessellation: 16 }, ctx.scene);
    pipe.position.set(-3 + i * 2, 1, 3);
    pipe.rotation.z = Math.PI / 2;
    pipe.material = makeMat(ctx.scene, `pipeMat_${i}`, new Color3(0.29, 0.29, 0.29), { unlit: true });
    ctx.trackMesh(pipe);
    trackedMeshes.push(pipe);
  }

  const reactor = MeshBuilder.CreateBox('haberReactor', { width: 3, height: 4, depth: 3 }, ctx.scene);
  reactor.position.set(0, 2, -4);
  reactor.material = makeMat(ctx.scene, 'reactorMat', new Color3(0.13, 0.79, 0.59), { unlit: true, alpha: 0.5 });
  ctx.trackMesh(reactor);
  trackedMeshes.push(reactor);
}

function createHistoricalLab(ctx: AppContext): void {
  const table = MeshBuilder.CreateBox('antiqueTable', { width: 4, height: 1, depth: 2 }, ctx.scene);
  table.position.set(0, 0.5, 0);
  table.material = makeMat(ctx.scene, 'antiqueTableMat', new Color3(0.55, 0.27, 0.07), { unlit: true });
  ctx.trackMesh(table);
  trackedMeshes.push(table);

  const crucible = MeshBuilder.CreateCylinder('crucible', { diameterTop: 0.3, diameterBottom: 0.6, height: 0.5, tessellation: 32 }, ctx.scene);
  crucible.position.set(1, 1, 0);
  crucible.material = makeMat(ctx.scene, 'crucibleMat', new Color3(0.84, 0.2, 0.52), { unlit: true, alpha: 0.8 });
  ctx.trackMesh(crucible);
  trackedMeshes.push(crucible);

  const parchment = MeshBuilder.CreatePlane('parchment', { width: 1.5, height: 1 }, ctx.scene);
  parchment.position.set(-1, 1.1, 0);
  parchment.rotation.y = -Math.PI / 4;
  const parchmentMat = makeMat(ctx.scene, 'parchmentMat', new Color3(0.96, 0.87, 0.7), { unlit: true });
  parchmentMat.backFaceCulling = false;
  parchment.material = parchmentMat;
  ctx.trackMesh(parchment);
  trackedMeshes.push(parchment);

  const symbol = MeshBuilder.CreateTorus('alchemySymbol', { diameter: 2, thickness: 0.1, tessellation: 32 }, ctx.scene);
  symbol.position.set(0, 3, 0);
  symbol.material = makeMat(ctx.scene, 'symbolMat', new Color3(1, 0.84, 0), { unlit: true });
  ctx.trackMesh(symbol);
  trackedMeshes.push(symbol);
  animatedMeshes.push(symbol);
}

function createSpaceChem(ctx: AppContext): void {
  const nebula = MeshBuilder.CreateSphere('nebula', { diameter: 16, segments: 32 }, ctx.scene);
  nebula.position.set(0, 2, -10);
  nebula.material = makeMat(ctx.scene, 'nebulaMat', new Color3(0.42, 0.36, 0.91), { unlit: true, alpha: 0.15 });
  ctx.trackMesh(nebula);
  trackedMeshes.push(nebula);

  const fragment = MeshBuilder.CreateIcoSphere('spaceFragment', { radius: 1, subdivisions: 1, flat: true }, ctx.scene);
  fragment.position.set(0, 2.5, 0);
  fragment.material = makeMat(ctx.scene, 'fragmentMat', new Color3(0.45, 0.73, 1), { emissive: new Color3(0.1, 0.15, 0.3) });
  ctx.trackMesh(fragment);
  trackedMeshes.push(fragment);
  animatedMeshes.push(fragment);
}

function createNanoWorld(ctx: AppContext): void {
  const lattice = MeshBuilder.CreateBox('nanoLattice', { width: 2, height: 2, depth: 2 }, ctx.scene);
  lattice.position.set(0, 2, 0);
  const latticeMat = makeMat(ctx.scene, 'nanoLatticeMat', new Color3(0.09, 0.64, 0.72), { unlit: true, alpha: 0.4 });
  latticeMat.wireframe = true;
  lattice.material = latticeMat;
  ctx.trackMesh(lattice);
  trackedMeshes.push(lattice);
  animatedMeshes.push(lattice);

  const atomMat = makeMat(ctx.scene, 'nanoAtomMat', Color3.White(), { unlit: true });
  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      for (let z = 0; z < 2; z++) {
        const atom = MeshBuilder.CreateSphere(`nanoAtom_${x}${y}${z}`, { diameter: 0.2, segments: 16 }, ctx.scene);
        atom.position.set((x - 0.5) * 0.9, (y - 0.5) * 0.9 + 2, (z - 0.5) * 0.9);
        atom.material = atomMat;
        ctx.trackMesh(atom);
        trackedMeshes.push(atom);
      }
    }
  }
}

function createChallengeArena(ctx: AppContext): void {
  const podium = MeshBuilder.CreateCylinder('podium', { diameterTop: 2, diameterBottom: 3, height: 0.5, tessellation: 32 }, ctx.scene);
  podium.position.set(0, 0.25, 0);
  podium.material = makeMat(ctx.scene, 'podiumMat', new Color3(1, 0.76, 0.03), { unlit: true, alpha: 0.8 });
  ctx.trackMesh(podium);
  trackedMeshes.push(podium);

  const trophy = MeshBuilder.CreateCylinder('trophy', { diameterTop: 0.3, diameterBottom: 0.5, height: 1.5, tessellation: 16 }, ctx.scene);
  trophy.position.set(0, 1.25, 0);
  trophy.material = makeMat(ctx.scene, 'trophyMat', new Color3(1, 0.84, 0), { unlit: true, emissive: new Color3(0.3, 0.25, 0) });
  ctx.trackMesh(trophy);
  trackedMeshes.push(trophy);

  const scoreboard = MeshBuilder.CreatePlane('scoreboard', { width: 4, height: 2 }, ctx.scene);
  scoreboard.position.set(0, 3, -4);
  const sbMat = makeMat(ctx.scene, 'scoreboardMat', new Color3(0.1, 0.1, 0.2), { unlit: true, alpha: 0.9 });
  sbMat.backFaceCulling = false;
  scoreboard.material = sbMat;
  ctx.trackMesh(scoreboard);
  trackedMeshes.push(scoreboard);
}

function createGenericLab(ctx: AppContext): void {
  const table = MeshBuilder.CreateBox('genericTable', { width: 3, height: 1, depth: 1.5 }, ctx.scene);
  table.position.set(0, 0.5, 0);
  table.material = makeMat(ctx.scene, 'genericTableMat', new Color3(0.29, 0.29, 0.29), { unlit: true });
  ctx.trackMesh(table);
  trackedMeshes.push(table);

  const beaker = MeshBuilder.CreateCylinder('beaker', { diameterTop: 0.6, diameterBottom: 0.4, height: 1, tessellation: 16 }, ctx.scene);
  beaker.position.set(0.8, 1.5, 0);
  beaker.material = makeMat(ctx.scene, 'beakerMat', new Color3(0.45, 0.73, 1), { unlit: true, alpha: 0.5 });
  ctx.trackMesh(beaker);
  trackedMeshes.push(beaker);
}

function createExperimentStations(ctx: AppContext, room: ExperimentalRoomData): void {
  const themeColor = ROOM_COLORS[room.id] || new Color3(0.16, 0.16, 0.23);

  (room.experiments || []).forEach((expId, index) => {
    const angle = (index / Math.max((room.experiments || []).length, 1)) * Math.PI * 2;
    const x = Math.cos(angle) * 6;
    const z = Math.sin(angle) * 6;

    const station = MeshBuilder.CreateCylinder(`expStation_${expId}`, { diameter: 1.6, height: 0.5, tessellation: 16 }, ctx.scene);
    station.position.set(x, 0.25, z);
    station.material = makeMat(ctx.scene, `expStationMat_${expId}`, themeColor.scale(0.8), { unlit: true, alpha: 0.6 });
    ctx.trackMesh(station);
    trackedMeshes.push(station);

    const icon = MeshBuilder.CreateSphere(`expIcon_${expId}`, { diameter: 0.4, segments: 16 }, ctx.scene);
    icon.position.y = 0.6;
    icon.parent = station;
    icon.material = makeMat(ctx.scene, `expIconMat_${expId}`, Color3.White(), { unlit: true });

    const label = new TextBlock(`expLabel_${expId}`);
    label.text = expId;
    label.color = 'white';
    label.fontSize = 12;
    ui.addControl(label);
    label.linkWithMesh(station);
    label.linkOffsetY = -25;

    station.actionManager = new ActionManager(ctx.scene);
    station.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => station.scaling.setAll(1.2)));
    station.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => station.scaling.setAll(1)));
  });
}

function setupLighting(ctx: AppContext, themeColor: Color3): void {
  const ambient = new HemisphericLight('expAmbient', new Vector3(0, 1, 0), ctx.scene);
  ambient.intensity = 0.3;

  const light1 = new PointLight('expPoint1', new Vector3(5, 5, 5), ctx.scene);
  light1.diffuse = themeColor;
  light1.intensity = 0.8;
  light1.range = 15;

  const light2 = new PointLight('expPoint2', new Vector3(-5, 5, -5), ctx.scene);
  light2.diffuse = themeColor;
  light2.intensity = 0.8;
  light2.range = 15;
}

function createTeleportZone(ctx: AppContext): void {
  const floor = MeshBuilder.CreateGround('expTeleportFloor', { width: 20, height: 20 }, ctx.scene);
  floor.position.y = 0.001;
  floor.isVisible = false;
  floor.isPickable = false;
  ctx.trackMesh(floor);
}

function createNavigationPanel(ctx: AppContext): void {
  const navPanel = MeshBuilder.CreateBox('expNavPanel', { width: 1.5, height: 0.5, depth: 0.1 }, ctx.scene);
  navPanel.position.set(0, 1.5, -5);
  navPanel.material = makeMat(ctx.scene, 'expNavPanelMat', new Color3(0.2, 0.2, 0.3), { unlit: true, alpha: 0.9 });
  ctx.trackMesh(navPanel);
  trackedMeshes.push(navPanel);

  const navLabel = new TextBlock('expNavLabel');
  navLabel.text = '\u25C0 Lobby';
  navLabel.color = 'white';
  navLabel.fontSize = 18;
  ui.addControl(navLabel);
  navLabel.linkWithMesh(navPanel);

  navPanel.actionManager = new ActionManager(ctx.scene);
  navPanel.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => navPanel.scaling.setAll(1.1)));
  navPanel.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => navPanel.scaling.setAll(1)));
  navPanel.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => { ctx.goto = ROOM_LOBBY; }));
}

export function enter(_ctx: AppContext, _param?: string): void {
  trackedMeshes.forEach(m => { m.isVisible = true; });
}

export function exit(_ctx: AppContext): void {
  trackedMeshes.forEach(m => { m.isVisible = false; });
  doorwayTriggers.forEach(t => t.dispose());
  doorwayTriggers = [];
}

export function execute(_ctx: AppContext, delta: number, _time: number): void {
  animatedMeshes.forEach(mesh => {
    if (!mesh.isEnabled()) return;
    mesh.rotation.y += delta * 0.3;
  });
}
