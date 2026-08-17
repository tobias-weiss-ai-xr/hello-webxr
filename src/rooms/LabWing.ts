import type { AppContext } from '../types/index.js';
import { EXPERIMENTAL_ROOMS } from '../data/elements.js';
import { ROOM_EXPERIMENTS_START } from './RoomManager.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4, Vector3 } from '@babylonjs/core/Maths/math.js';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui/2D/index.js';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';
import { ActionManager, ExecuteCodeAction } from '@babylonjs/core/index.js';
import { buildRoom } from './RoomBuilder.js';

const ROOM_COLOR = new Color3(0.15, 0.17, 0.20);
const WALL_COLOR = new Color3(0.20, 0.22, 0.26);
const CEILING_COLOR = new Color3(0.12, 0.12, 0.14);
const AMBIENT_COLOR = new Color3(0.35, 0.36, 0.40);
const POINT_COLOR = new Color3(0.98, 0.95, 0.88);

let stations: AbstractMesh[] = [];
let uiTexture: AdvancedDynamicTexture | null = null;
let titleText: TextBlock | null = null;

export function setup(ctx: AppContext): void {
  const scene = ctx.scene;

  scene.clearColor = new Color4(0.05, 0.05, 0.08, 1);

  uiTexture = AdvancedDynamicTexture.CreateFullscreenUI('labWingUI', true, scene);

  const room = buildRoom(scene, {
    dimensions: { width: 20, height: 4.5, depth: 16 },
    floorColor: ROOM_COLOR,
    wallColor: WALL_COLOR,
    ceilingColor: CEILING_COLOR,
    ambientColor: AMBIENT_COLOR,
    pointLightColor: POINT_COLOR,
    doorways: [
      { wall: 'south', offset: 0 },
      { wall: 'north', offset: 0 },
    ],
  });

  ctx.setFloorMesh?.(room.floor);

  createLabStations(ctx);
  createTitle(ctx);
}

function createLabStations(ctx: AppContext): void {
  const scene = ctx.scene;

  const stationsPerRow = 5;
  const stationSpacing = 3;
  const startX = -(stationsPerRow - 1) * stationSpacing / 2;
  const startZ = -3;

  EXPERIMENTAL_ROOMS.forEach((exp, index) => {
    const row = Math.floor(index / stationsPerRow);
    const col = index % stationsPerRow;

    const position = new Vector3(
      startX + col * stationSpacing,
      0,
      startZ - row * stationSpacing
    );

    const station = createLabStation(ctx, exp, position, ROOM_EXPERIMENTS_START + index);
    stations.push(station);
  });
}

function createLabStation(ctx: AppContext, exp: any, position: Vector3, roomIndex: number): AbstractMesh {
  const scene = ctx.scene;

  const baseMat = new StandardMaterial(`baseMat_${exp.id}`, scene);
  baseMat.diffuseColor = new Color3(0.2, 0.22, 0.25);
  baseMat.emissiveColor = new Color3(0.1, 0.11, 0.13);
  baseMat.specularColor = new Color3(0.3, 0.3, 0.3);

  const base = MeshBuilder.CreateCylinder(`base_${exp.id}`, {
    height: 0.1,
    diameterTop: 2,
    diameterBottom: 2,
    tessellation: 32
  }, scene);
  base.material = baseMat;
  base.position.set(position.x, 0.05, position.z);
  ctx.trackMesh(base);

  const standMat = new StandardMaterial(`standMat_${exp.id}`, scene);
  standMat.diffuseColor = new Color3(0.25, 0.28, 0.32);
  standMat.emissiveColor = new Color3(0.12, 0.14, 0.16);
  standMat.specularColor = new Color3(0.4, 0.4, 0.4);

  const standHeight = 1.2;
  const stand = MeshBuilder.CreateCylinder(`stand_${exp.id}`, {
    height: standHeight,
    diameterTop: 0.2,
    diameterBottom: 0.3,
    tessellation: 16
  }, scene);
  stand.material = standMat;
  stand.position.set(position.x, standHeight / 2, position.z);
  ctx.trackMesh(stand);

  const platformMat = new StandardMaterial(`platformMat_${exp.id}`, scene);
  platformMat.diffuseColor = new Color3(0.3, 0.33, 0.38);
  platformMat.emissiveColor = new Color3(0.15, 0.17, 0.2);
  platformMat.specularColor = new Color3(0.5, 0.5, 0.5);

  const platform = MeshBuilder.CreateBox(`platform_${exp.id}`, {
    width: 1.5,
    height: 0.15,
    depth: 1.5
  }, scene);
  platform.material = platformMat;
  platform.position.set(position.x, standHeight, position.z);
  ctx.trackMesh(platform);

  const labelMat = new StandardMaterial(`labelMat_${exp.id}`, scene);
  labelMat.diffuseColor = new Color3(0.35, 0.4, 0.45);
  labelMat.emissiveColor = new Color3(0.2, 0.23, 0.27);
  labelMat.alpha = 0.9;
  labelMat.disableLighting = true;
  labelMat.backFaceCulling = false;

  const label = MeshBuilder.CreatePlane(`label_${exp.id}`, { width: 1.2, height: 0.6 }, scene);
  label.material = labelMat;
  label.position.set(position.x, standHeight + 0.5, position.z);
  label.rotation.y = Math.PI;
  label.billboardMode = 7;
  ctx.trackMesh(label);
  stations.push(label);

  const labelTitle = new TextBlock(`labelTitle_${exp.id}`, exp.name || `Experiment ${exp.id}`);
  labelTitle.color = 'white';
  labelTitle.fontSize = 18;
  labelTitle.fontWeight = 'bold';
  labelTitle.textWrapping = true;
  labelTitle.width = 1.1;
  uiTexture?.addControl(labelTitle);
  labelTitle.linkWithMesh(label);
  labelTitle.linkOffsetY = -30;

  const expButton = MeshBuilder.CreateCylinder(`expButton_${exp.id}`, {
    height: 0.2,
    diameterTop: 0.8,
    diameterBottom: 0.9,
    tessellation: 32
  }, scene);
  expButton.position.set(position.x, standHeight + 0.25, position.z);
  expButton.metadata = { roomIndex, exp };
  ctx.trackMesh(expButton);
  stations.push(expButton);

  const buttonMat = new StandardMaterial(`buttonMat_${exp.id}`, scene);
  buttonMat.diffuseColor = new Color3(0.3, 0.35, 0.45);
  buttonMat.emissiveColor = new Color3(0.2, 0.25, 0.35);
  buttonMat.specularColor = new Color3(0.6, 0.6, 0.6);
  expButton.material = buttonMat;

  const buttonLabel = new TextBlock(`buttonLabel_${exp.id}`, 'Enter');
  buttonLabel.color = 'white';
  buttonLabel.fontSize = 16;
  buttonLabel.fontWeight = 'bold';
  uiTexture?.addControl(buttonLabel);
  buttonLabel.linkWithMesh(expButton);
  buttonLabel.linkOffsetY = -10;

  expButton.actionManager = new ActionManager(scene);
  expButton.actionManager.registerAction(
    new ExecuteCodeAction(
      ActionManager.OnPickTrigger,
      () => {
        ctx.goto = roomIndex;
      }
    )
  );

  return base;
}

function createTitle(ctx: AppContext): void {
  const scene = ctx.scene;

  const titleMat = new StandardMaterial('titleMat', scene);
  titleMat.diffuseColor = new Color3(0.35, 0.4, 0.45);
  titleMat.emissiveColor = new Color3(0.25, 0.3, 0.35);
  titleMat.alpha = 0.9;
  titleMat.disableLighting = true;
  titleMat.backFaceCulling = false;

  const titlePanel = MeshBuilder.CreatePlane('titlePanel', { width: 8, height: 1 }, scene);
  titlePanel.position.set(0, 3.5, -6);
  titlePanel.rotation.y = Math.PI;
  titlePanel.material = titleMat;
  titlePanel.billboardMode = 7;
  ctx.trackMesh(titlePanel);

  const title = new TextBlock('labWingTitle', 'Experimental Labs');
  title.color = 'white';
  title.fontSize = 32;
  title.fontWeight = 'bold';
  uiTexture?.addControl(title);
  title.linkWithMesh(titlePanel);
  title.linkOffsetY = -10;

  const subtitleText = new TextBlock('subtitle', 'Select a laboratory station to begin');
  subtitleText.color = '#cccccc';
  subtitleText.fontSize = 18;
  uiTexture?.addControl(subtitleText);
  subtitleText.linkWithMesh(titlePanel);
  subtitleText.linkOffsetY = 50;

  titleText = title;
}

export function enter(ctx: AppContext): void {
  stations.forEach(s => s.isVisible = true);
  if (titleText) titleText.isVisible = true;
}

export function exit(_ctx: AppContext): void {
  stations.forEach(s => s.isVisible = false);
  if (titleText) titleText.isVisible = false;
}

export function execute(_ctx: AppContext, _delta: number, time: number): void {}