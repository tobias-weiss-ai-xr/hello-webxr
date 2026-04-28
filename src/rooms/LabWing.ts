import type { AppContext, ExperimentalRoomData } from '../types/index.js';
import { EXPERIMENTAL_ROOMS } from '../data/elements.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math.js';
import { ActionManager, ExecuteCodeAction } from '@babylonjs/core/Actions/index.js';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui/2D/index.js';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';
import { buildRoom, type RoomBuildOptions } from './RoomBuilder.js';

let experimentalStations: AbstractMesh[] = [];
let uiTexture: AdvancedDynamicTexture | null = null;
let stationLabels: TextBlock[] = [];

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

  ctx.room = 119;
}

function createExperimentalStations(ctx: AppContext): void {
  const scene = ctx.scene;

  EXPERIMENTAL_ROOMS.forEach((room: ExperimentalRoomData, index: number) => {
    const pos = STATION_POSITIONS[index];
    const color = room.color ?? 0x888888;

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

    const iconLabel = new TextBlock(`icon_${room.id}`, room.icon || '🔬');
    iconLabel.color = 'white';
    iconLabel.fontSize = 32;
    iconLabel.fontWeight = 'bold';
    uiTexture?.addControl(iconLabel);
    iconLabel.linkWithMesh(base);
    iconLabel.linkOffsetY = -50;
    stationLabels.push(iconLabel);

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