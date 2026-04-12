import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4, Vector3 } from '@babylonjs/core/Maths/math.js';
import { HemisphericLight, PointLight } from '@babylonjs/core/Lights/index.js';
import { ActionManager, ExecuteCodeAction } from '@babylonjs/core/Actions/index.js';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui/2D/index.js';

import type { AppContext } from '../types/index.js';
import { EXPERIMENTAL_ROOMS } from '../data/elements.js';
import { ROOM_LOBBY, ROOM_ELEMENTS_START } from './RoomManager.js';
import { ELEMENTS } from '../data/elements.js';
import type { ExperimentalRoomData } from '../types/index.js';

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

function makeMat(scene: import('@babylonjs/core').Scene, name: string, color: Color3, opts: { unlit?: boolean; alpha?: number; emissive?: Color3 } = {}): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = color;
  if (opts.unlit) m.disableLighting = true;
  if (opts.alpha !== undefined) m.alpha = opts.alpha;
  if (opts.emissive) m.emissiveColor = opts.emissive;
  return m;
}

var ui: AdvancedDynamicTexture;
var roomData: ExperimentalRoomData | undefined;
var animatedMeshes: import('@babylonjs/core').Mesh[] = [];

export function setup(ctx: AppContext, roomId?: string): void {
  if (!roomId) return;
  roomData = EXPERIMENTAL_ROOMS.find(r => r.id === roomId);
  if (!roomData) return;

  ui = AdvancedDynamicTexture.CreateFullscreenUI('expRoomUI');
  animatedMeshes = [];

  const themeColor = ROOM_COLORS[roomData.id] || new Color3(0.16, 0.16, 0.23);
  ctx.scene.clearColor = new Color4(themeColor.r * 0.1, themeColor.g * 0.1, themeColor.b * 0.1, 1);

  createRoomSpecificSetup(ctx, roomData.id, themeColor);
  createFloor(ctx, themeColor);
  createExperimentStations(ctx, roomData);
  setupLighting(ctx, themeColor);
  createTeleportZone(ctx);
  createNavigationPanel(ctx);
}

function createFloor(ctx: AppContext, themeColor: Color3): void {
  const floor = MeshBuilder.CreateCylinder('expFloor', { diameter: 20, height: 0.2, tessellation: 64 }, ctx.scene);
  floor.position.y = -0.1;
  floor.parent = ctx.roomRoot;
  floor.material = makeMat(ctx.scene, 'expFloorMat', themeColor.scale(0.1), { unlit: true });
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
  table.parent = ctx.roomRoot;
  table.material = makeMat(ctx.scene, 'tableMat', new Color3(0.29, 0.29, 0.29), { unlit: true });

  const bunsen = MeshBuilder.CreateCylinder('bunsen', { diameterTop: 0.2, diameterBottom: 0.3, height: 0.8, tessellation: 16 }, ctx.scene);
  bunsen.position.set(-1.2, 1.3, -0.5);
  bunsen.parent = ctx.roomRoot;
  bunsen.material = makeMat(ctx.scene, 'bunsenMat', new Color3(0.16, 0.16, 0.16), { unlit: true });

  const flame = MeshBuilder.CreateCylinder('flame', { diameterTop: 0.01, diameterBottom: 0.16, height: 0.3, tessellation: 16 }, ctx.scene);
  flame.position.set(-1.2, 1.8, -0.5);
  flame.parent = ctx.roomRoot;
  flame.material = makeMat(ctx.scene, 'flameMat', new Color3(0.29, 0.56, 0.89), { unlit: true, alpha: 0.7 });
  animatedMeshes.push(flame);
}

function createNuclearControlRoom(ctx: AppContext, themeColor: Color3): void {
  const panel = MeshBuilder.CreateBox('nuclearPanel', { width: 6, height: 2, depth: 0.2 }, ctx.scene);
  panel.position.set(0, 2.5, -4);
  panel.lookAt(new Vector3(0, 2.5, 0));
  panel.parent = ctx.roomRoot;
  panel.material = makeMat(ctx.scene, 'nuclearPanelMat', new Color3(0.1, 0.1, 0.16), { unlit: true, alpha: 0.9 });

  const core = MeshBuilder.CreateCylinder('reactorCore', { diameter: 3, height: 4, tessellation: 32 }, ctx.scene);
  core.position.set(0, 2, 0);
  core.parent = ctx.roomRoot;
  core.material = makeMat(ctx.scene, 'coreMat', themeColor, { unlit: true, alpha: 0.5, emissive: themeColor.scale(0.3) });
  animatedMeshes.push(core);
}

function createElectrochemLab(ctx: AppContext): void {
  const battery = MeshBuilder.CreateBox('expBattery', { width: 2, height: 1.5, depth: 0.8 }, ctx.scene);
  battery.position.set(0, 0.75, -2);
  battery.parent = ctx.roomRoot;
  battery.material = makeMat(ctx.scene, 'expBatteryMat', new Color3(0.45, 0.73, 1), { unlit: true });

  const terminal = MeshBuilder.CreateBox('terminal', { width: 3, height: 2, depth: 0.1 }, ctx.scene);
  terminal.position.set(0, 1, -4);
  terminal.parent = ctx.roomRoot;
  terminal.material = makeMat(ctx.scene, 'terminalMat', new Color3(0.16, 0.16, 0.16), { unlit: true });
}

function createCarbonUniverse(ctx: AppContext, themeColor: Color3): void {
  const helix = MeshBuilder.CreateTorusKnot('dnaHelix', { radius: 0.8, tube: 0.08, radialSegments: 64, tubularSegments: 32, p: 2, q: 3 }, ctx.scene);
  helix.position.set(0, 2.5, 0);
  helix.parent = ctx.roomRoot;
  helix.material = makeMat(ctx.scene, 'helixMat', themeColor, { emissive: themeColor.scale(0.2) });
  animatedMeshes.push(helix);
}

function createExtremeConditions(ctx: AppContext): void {
  const chamber = MeshBuilder.CreateCylinder('pressureChamber', { diameter: 4, height: 4, tessellation: 32 }, ctx.scene);
  chamber.position.set(0, 2, 0);
  chamber.parent = ctx.roomRoot;
  chamber.material = makeMat(ctx.scene, 'chamberMat', new Color3(1, 0.66, 0.3), { unlit: true, alpha: 0.3 });

  const plasma = MeshBuilder.CreateSphere('plasma', { diameter: 3, segments: 32 }, ctx.scene);
  plasma.position.set(0, 2, 0);
  plasma.parent = ctx.roomRoot;
  plasma.material = makeMat(ctx.scene, 'plasmaMat', new Color3(1, 0.42, 0.21), { unlit: true, alpha: 0.6 });
  animatedMeshes.push(plasma);

  const superfluid = MeshBuilder.CreateTorus('superfluidHe', { diameter: 3.6, thickness: 0.3, tessellation: 100 }, ctx.scene);
  superfluid.position.set(3, 2, 0);
  superfluid.rotation.x = Math.PI / 2;
  superfluid.parent = ctx.roomRoot;
  superfluid.material = makeMat(ctx.scene, 'superfluidMat', new Color3(0.45, 0.73, 1), { unlit: true, alpha: 0.5 });
  animatedMeshes.push(superfluid);
}

function createIndustrialApps(ctx: AppContext): void {
  const furnace = MeshBuilder.CreateCylinder('blastFurnace', { diameterTop: 3, diameterBottom: 4, height: 5, tessellation: 8 }, ctx.scene);
  furnace.position.set(0, 2.5, 0);
  furnace.parent = ctx.roomRoot;
  furnace.material = makeMat(ctx.scene, 'furnaceMat', new Color3(0.45, 0.73, 1), { unlit: true, alpha: 0.6 });

  for (let i = 0; i < 4; i++) {
    const pipe = MeshBuilder.CreateCylinder(`pipe_${i}`, { diameter: 0.6, height: 8, tessellation: 16 }, ctx.scene);
    pipe.position.set(-3 + i * 2, 1, 3);
    pipe.rotation.z = Math.PI / 2;
    pipe.parent = ctx.roomRoot;
    pipe.material = makeMat(ctx.scene, `pipeMat_${i}`, new Color3(0.29, 0.29, 0.29), { unlit: true });
  }

  const reactor = MeshBuilder.CreateBox('haberReactor', { width: 3, height: 4, depth: 3 }, ctx.scene);
  reactor.position.set(0, 2, -4);
  reactor.parent = ctx.roomRoot;
  reactor.material = makeMat(ctx.scene, 'reactorMat', new Color3(0.13, 0.79, 0.59), { unlit: true, alpha: 0.5 });
}

function createHistoricalLab(ctx: AppContext): void {
  const table = MeshBuilder.CreateBox('antiqueTable', { width: 4, height: 1, depth: 2 }, ctx.scene);
  table.position.set(0, 0.5, 0);
  table.parent = ctx.roomRoot;
  table.material = makeMat(ctx.scene, 'antiqueTableMat', new Color3(0.55, 0.27, 0.07), { unlit: true });

  const crucible = MeshBuilder.CreateCylinder('crucible', { diameterTop: 0.3, diameterBottom: 0.6, height: 0.5, tessellation: 32 }, ctx.scene);
  crucible.position.set(1, 1, 0);
  crucible.parent = ctx.roomRoot;
  crucible.material = makeMat(ctx.scene, 'crucibleMat', new Color3(0.84, 0.2, 0.52), { unlit: true, alpha: 0.8 });

  const parchment = MeshBuilder.CreatePlane('parchment', { width: 1.5, height: 1 }, ctx.scene);
  parchment.position.set(-1, 1.1, 0);
  parchment.rotation.y = -Math.PI / 4;
  parchment.parent = ctx.roomRoot;
  const parchmentMat = makeMat(ctx.scene, 'parchmentMat', new Color3(0.96, 0.87, 0.7), { unlit: true });
  parchmentMat.backFaceCulling = false;
  parchment.material = parchmentMat;

  const symbol = MeshBuilder.CreateTorus('alchemySymbol', { diameter: 2, thickness: 0.1, tessellation: 32 }, ctx.scene);
  symbol.position.set(0, 3, 0);
  symbol.parent = ctx.roomRoot;
  symbol.material = makeMat(ctx.scene, 'symbolMat', new Color3(1, 0.84, 0), { unlit: true });
  animatedMeshes.push(symbol);
}

function createSpaceChem(ctx: AppContext): void {
  const nebula = MeshBuilder.CreateSphere('nebula', { diameter: 16, segments: 32 }, ctx.scene);
  nebula.position.set(0, 2, -10);
  nebula.parent = ctx.roomRoot;
  nebula.material = makeMat(ctx.scene, 'nebulaMat', new Color3(0.42, 0.36, 0.91), { unlit: true, alpha: 0.15 });

  const fragment = MeshBuilder.CreateIcoSphere('spaceFragment', { radius: 1, subdivisions: 1, flat: true }, ctx.scene);
  fragment.position.set(0, 2.5, 0);
  fragment.parent = ctx.roomRoot;
  fragment.material = makeMat(ctx.scene, 'fragmentMat', new Color3(0.45, 0.73, 1), { emissive: new Color3(0.1, 0.15, 0.3) });
  animatedMeshes.push(fragment);
}

function createNanoWorld(ctx: AppContext): void {
  const lattice = MeshBuilder.CreateBox('nanoLattice', { width: 2, height: 2, depth: 2 }, ctx.scene);
  lattice.position.set(0, 2, 0);
  lattice.parent = ctx.roomRoot;
  const latticeMat = makeMat(ctx.scene, 'nanoLatticeMat', new Color3(0.09, 0.64, 0.72), { unlit: true, alpha: 0.4 });
  latticeMat.wireframe = true;
  lattice.material = latticeMat;
  animatedMeshes.push(lattice);

  const atomMat = makeMat(ctx.scene, 'nanoAtomMat', Color3.White(), { unlit: true });
  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      for (let z = 0; z < 2; z++) {
        const atom = MeshBuilder.CreateSphere(`nanoAtom_${x}${y}${z}`, { diameter: 0.2, segments: 16 }, ctx.scene);
        atom.position.set((x - 0.5) * 0.9, (y - 0.5) * 0.9 + 2, (z - 0.5) * 0.9);
        atom.parent = ctx.roomRoot;
        atom.material = atomMat;
      }
    }
  }
}

function createChallengeArena(ctx: AppContext): void {
  const podium = MeshBuilder.CreateCylinder('podium', { diameterTop: 2, diameterBottom: 3, height: 0.5, tessellation: 32 }, ctx.scene);
  podium.position.set(0, 0.25, 0);
  podium.parent = ctx.roomRoot;
  podium.material = makeMat(ctx.scene, 'podiumMat', new Color3(1, 0.76, 0.03), { unlit: true, alpha: 0.8 });

  const trophy = MeshBuilder.CreateCylinder('trophy', { diameterTop: 0.3, diameterBottom: 0.5, height: 1.5, tessellation: 16 }, ctx.scene);
  trophy.position.set(0, 1.25, 0);
  trophy.parent = ctx.roomRoot;
  trophy.material = makeMat(ctx.scene, 'trophyMat', new Color3(1, 0.84, 0), { unlit: true, emissive: new Color3(0.3, 0.25, 0) });

  const scoreboard = MeshBuilder.CreatePlane('scoreboard', { width: 4, height: 2 }, ctx.scene);
  scoreboard.position.set(0, 3, -4);
  scoreboard.parent = ctx.roomRoot;
  const sbMat = makeMat(ctx.scene, 'scoreboardMat', new Color3(0.1, 0.1, 0.2), { unlit: true, alpha: 0.9 });
  sbMat.backFaceCulling = false;
  scoreboard.material = sbMat;
}

function createGenericLab(ctx: AppContext): void {
  const table = MeshBuilder.CreateBox('genericTable', { width: 3, height: 1, depth: 1.5 }, ctx.scene);
  table.position.set(0, 0.5, 0);
  table.parent = ctx.roomRoot;
  table.material = makeMat(ctx.scene, 'genericTableMat', new Color3(0.29, 0.29, 0.29), { unlit: true });

  const beaker = MeshBuilder.CreateCylinder('beaker', { diameterTop: 0.6, diameterBottom: 0.4, height: 1, tessellation: 16 }, ctx.scene);
  beaker.position.set(0.8, 1.5, 0);
  beaker.parent = ctx.roomRoot;
  beaker.material = makeMat(ctx.scene, 'beakerMat', new Color3(0.45, 0.73, 1), { unlit: true, alpha: 0.5 });
}

function createExperimentStations(ctx: AppContext, room: ExperimentalRoomData): void {
  const themeColor = ROOM_COLORS[room.id] || new Color3(0.16, 0.16, 0.23);

  (room.experiments || []).forEach((expId, index) => {
    const angle = (index / Math.max((room.experiments || []).length, 1)) * Math.PI * 2;
    const x = Math.cos(angle) * 6;
    const z = Math.sin(angle) * 6;

    const station = MeshBuilder.CreateCylinder(`expStation_${expId}`, { diameter: 1.6, height: 0.5, tessellation: 16 }, ctx.scene);
    station.position.set(x, 0.25, z);
    station.parent = ctx.roomRoot;
    station.material = makeMat(ctx.scene, `expStationMat_${expId}`, themeColor.scale(0.8), { unlit: true, alpha: 0.6 });

    const icon = MeshBuilder.CreateSphere(`expIcon_${expId}`, { diameter: 0.4, segments: 16 }, ctx.scene);
    icon.position.y = 0.6;
    icon.parent = station;
    icon.material = makeMat(ctx.scene, `expIconMat_${expId}`, Color3.White(), { unlit: true });

    const label = new TextBlock(`expLabel_${expId}`);
    label.text = expId;
    label.color = 'white';
    label.fontSize = 12;
    label.linkWithMesh(station);
    label.linkOffsetY = -25;
    ui.addControl(label);

    station.actionManager = new ActionManager(ctx.scene);
    station.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => station.scaling.setAll(1.2)));
    station.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => station.scaling.setAll(1)));
  });
}

function setupLighting(ctx: AppContext, themeColor: Color3): void {
  const ambient = new HemisphericLight('expAmbient', new Vector3(0, 1, 0), ctx.scene);
  ambient.intensity = 0.3;
  ambient.parent = ctx.roomRoot;

  const light1 = new PointLight('expPoint1', new Vector3(5, 5, 5), ctx.scene);
  light1.diffuse = themeColor;
  light1.intensity = 0.8;
  light1.range = 15;
  light1.parent = ctx.roomRoot;

  const light2 = new PointLight('expPoint2', new Vector3(-5, 5, -5), ctx.scene);
  light2.diffuse = themeColor;
  light2.intensity = 0.8;
  light2.range = 15;
  light2.parent = ctx.roomRoot;
}

function createTeleportZone(ctx: AppContext): void {
  const floor = MeshBuilder.CreateGround('expTeleportFloor', { width: 20, height: 20 }, ctx.scene);
  floor.position.y = 0.001;
  floor.isVisible = false;
  floor.isPickable = false;
  floor.parent = ctx.roomRoot;
}

function createNavigationPanel(ctx: AppContext): void {
  const navPanel = MeshBuilder.CreateBox('expNavPanel', { width: 1.5, height: 0.5, depth: 0.1 }, ctx.scene);
  navPanel.position.set(0, 1.5, -5);
  navPanel.parent = ctx.roomRoot;
  navPanel.material = makeMat(ctx.scene, 'expNavPanelMat', new Color3(0.2, 0.2, 0.3), { unlit: true, alpha: 0.9 });

  const navLabel = new TextBlock('expNavLabel');
  navLabel.text = '◀ Lobby';
  navLabel.color = 'white';
  navLabel.fontSize = 18;
  navLabel.linkWithMesh(navPanel);
  ui.addControl(navLabel);

  navPanel.actionManager = new ActionManager(ctx.scene);
  navPanel.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => navPanel.scaling.setAll(1.1)));
  navPanel.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => navPanel.scaling.setAll(1)));
  navPanel.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => { ctx.goto = ROOM_LOBBY; }));
}

export function enter(ctx: AppContext, _param?: string): void {
  ctx.roomRoot.setEnabled(true);
}

export function exit(ctx: AppContext): void {
  ctx.roomRoot.setEnabled(false);
}

export function execute(_ctx: AppContext, delta: number, time: number): void {
  animatedMeshes.forEach(mesh => {
    if (!mesh.isEnabled()) return;
    mesh.rotation.y += delta * 0.3;
  });
}
