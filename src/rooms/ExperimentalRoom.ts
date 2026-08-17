import type { AppContext } from '../types/index.js';
import { EXPERIMENTAL_ROOMS } from '../data/elements.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4, Vector3 } from '@babylonjs/core/Maths/math.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { AdvancedDynamicTexture, TextBlock, Rectangle } from '@babylonjs/gui/2D/index.js';
import { buildRoom } from './RoomBuilder.js';

const ROOM_COLOR = new Color3(0.15, 0.17, 0.20);
const WALL_COLOR = new Color3(0.20, 0.22, 0.26);
const CEILING_COLOR = new Color3(0.12, 0.12, 0.14);
const AMBIENT_COLOR = new Color3(0.35, 0.36, 0.40);
const POINT_COLOR = new Color3(0.98, 0.95, 0.88);

let experimentData: any = null;
let experimentGroup: any = null;
let uiTexture: AdvancedDynamicTexture | null = null;
let titlePanel: any = null;
let equipment: any[] = [];
let detailPanel: any | null = null;
let detailText: TextBlock | null = null;

export function setup(ctx: AppContext, expId?: string): void {
  if (!expId) return;

  const scene = ctx.scene;
  experimentData = EXPERIMENTAL_ROOMS.find(e => e.id === expId);
  if (!experimentData) return;

  scene.clearColor = new Color4(0.05, 0.05, 0.08, 1);

  uiTexture = AdvancedDynamicTexture.CreateFullscreenUI('experimentRoomUI', true, scene);

  const room = buildRoom(scene, {
    dimensions: { width: 14, height: 5, depth: 14 },
    floorColor: ROOM_COLOR,
    wallColor: WALL_COLOR,
    ceilingColor: CEILING_COLOR,
    ambientColor: AMBIENT_COLOR,
    pointLightColor: POINT_COLOR,
    doorways: [
      { wall: 'south', offset: 0 },
    ],
  });

  ctx.setFloorMesh?.(room.floor);

  experimentGroup = new TransformNode('experimentGroup', scene);
  ctx.trackNode(experimentGroup);

  createExperimentSetup(ctx);
  createStationEquipment(ctx);
  createInfoPanel(ctx);
}

function createExperimentSetup(ctx: AppContext): void {
  const scene = ctx.scene;

  const tableMat = new StandardMaterial('tableMat', scene);
  tableMat.diffuseColor = new Color3(0.25, 0.28, 0.32);
  tableMat.emissiveColor = new Color3(0.1, 0.12, 0.14);
  tableMat.specularColor = new Color3(0.4, 0.4, 0.4);

  const table = MeshBuilder.CreateBox('experimentTable', {
    width: 6,
    height: 0.1,
    depth: 4
  }, scene);
  table.material = tableMat;
  table.position.set(0, 0.8, 0);
  table.parent = experimentGroup;
  ctx.trackMesh(table);
  equipment.push(table);

  const legMat = new StandardMaterial('legMat', scene);
  legMat.diffuseColor = new Color3(0.3, 0.33, 0.38);
  legMat.emissiveColor = new Color3(0.12, 0.14, 0.16);
  legMat.specularColor = new Color3(0.35, 0.35, 0.35);

  const legPositions = [
    [-2.5, 0.4, -1.5], [2.5, 0.4, -1.5],
    [-2.5, 0.4, 1.5], [2.5, 0.4, 1.5]
  ];

  legPositions.forEach((pos, i) => {
    const leg = MeshBuilder.CreateCylinder(`leg_${i}`, {
      height: 0.8,
      diameterTop: 0.15,
      diameterBottom: 0.2,
      tessellation: 16
    }, scene);
    leg.material = legMat;
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.parent = experimentGroup;
    ctx.trackMesh(leg);
    equipment.push(leg);
  });

  const frameMat = new StandardMaterial('frameMat', scene);
  frameMat.diffuseColor = new Color3(0.35, 0.38, 0.45);
  frameMat.emissiveColor = new Color3(0.15, 0.17, 0.2);
  frameMat.specularColor = new Color3(0.5, 0.5, 0.5);

  const frame = MeshBuilder.CreateBox('frame', {
    width: 4.5,
    height: 2.5,
    depth: 0.2
  }, scene);
  frame.material = frameMat;
  frame.position.set(0, 2.1, -1.8);
  frame.parent = experimentGroup;
  ctx.trackMesh(frame);
  equipment.push(frame);
}

function createStationEquipment(ctx: AppContext): void {
  const scene = ctx.scene;

  const beakerMat = new StandardMaterial('beakerMat', scene);
  beakerMat.diffuseColor = new Color3(0.4, 0.5, 0.6);
  beakerMat.emissiveColor = new Color3(0.1, 0.15, 0.2);
  beakerMat.alpha = 0.4;
  beakerMat.specularColor = new Color3(0.6, 0.6, 0.6);
  beakerMat.disableLighting = true;

  const beaker = MeshBuilder.CreateCylinder('beaker', {
    height: 0.6,
    diameterTop: 0.3,
    diameterBottom: 0.25,
    tessellation: 32
  }, scene);
  beaker.material = beakerMat;
  beaker.position.set(-1.5, 1.15, 0);
  beaker.parent = experimentGroup;
  ctx.trackMesh(beaker);
  equipment.push(beaker);

  const flaskMat = new StandardMaterial('flaskMat', scene);
  flaskMat.diffuseColor = new Color3(0.5, 0.4, 0.6);
  flaskMat.emissiveColor = new Color3(0.15, 0.1, 0.2);
  flaskMat.alpha = 0.5;
  flaskMat.specularColor = new Color3(0.7, 0.7, 0.7);
  flaskMat.disableLighting = true;

  const flaskBody = MeshBuilder.CreateCylinder('flaskBody', {
    height: 0.4,
    diameterTop: 0.2,
    diameterBottom: 0.35,
    tessellation: 32
  }, scene);
  flaskBody.material = flaskMat;
  flaskBody.position.set(1.5, 1, 0);
  flaskBody.parent = experimentGroup;
  ctx.trackMesh(flaskBody);
  equipment.push(flaskBody);

  const flaskNeck = MeshBuilder.CreateCylinder('flaskNeck', {
    height: 0.3,
    diameterTop: 0.15,
    diameterBottom: 0.15,
    tessellation: 24
  }, scene);
  flaskNeck.material = flaskMat;
  flaskNeck.position.set(1.5, 1.35, 0);
  flaskNeck.parent = experimentGroup;
  ctx.trackMesh(flaskNeck);
  equipment.push(flaskNeck);

  const displayMat = new StandardMaterial('displayMat', scene);
  displayMat.diffuseColor = new Color3(0.3, 0.35, 0.45);
  displayMat.emissiveColor = new Color3(0.2, 0.25, 0.35);
  displayMat.specularColor = new Color3(0.6, 0.6, 0.6);

  const display = MeshBuilder.CreatePlane('display', {
    width: 3,
    height: 2
  }, scene);
  display.material = displayMat;
  display.position.set(0, 2.1, -1.7);
  display.rotation.y = Math.PI;
  display.parent = experimentGroup;
  ctx.trackMesh(display);
  equipment.push(display);
}

function createInfoPanel(ctx: AppContext): void {
  const scene = ctx.scene;

  const infoMat = new StandardMaterial('infoMat', scene);
  infoMat.diffuseColor = ROOM_COLOR;
  infoMat.emissiveColor = ROOM_COLOR.scale(0.3);
  infoMat.alpha = 0.9;
  infoMat.backFaceCulling = false;

  titlePanel = MeshBuilder.CreatePlane('titlePanel', { width: 5, height: 1 }, scene);
  titlePanel.position.set(0, 3.5, -4);
  titlePanel.rotation.y = Math.PI;
  titlePanel.material = infoMat;
  titlePanel.billboardMode = 7;
  ctx.trackMesh(titlePanel);
  equipment.push(titlePanel);

  const title = new TextBlock('experimentTitle', experimentData?.name || 'Experiment');
  title.color = 'white';
  title.fontSize = 32;
  title.fontWeight = 'bold';
  uiTexture?.addControl(title);
  title.linkWithMesh(titlePanel);
  title.linkOffsetY = -30;

  const rectPanel = new Rectangle('detailPanel');
  rectPanel.width = '300px';
  rectPanel.height = '150px';
  rectPanel.cornerRadius = 6;
  rectPanel.color = 'rgba(0, 0, 0, 0.5)';
  rectPanel.thickness = 0;
  rectPanel.background = 'rgba(0, 0, 0, 0.5)';
  rectPanel.alpha = 0.8;
  rectPanel.isVisible = false;
  rectPanel.isPointerBlocker = false;
  detailPanel = rectPanel;

  const texLabel = new TextBlock('detailText', experimentData?.description || 'Experiment description');
  texLabel.color = '#cccccc';
  texLabel.fontSize = 16;
  texLabel.textWrapping = true;
  texLabel.width = 5.5;
  texLabel.lineSpacing = 1.5;
  detailPanel!.addControl(texLabel);

  uiTexture?.addControl(detailPanel!);
  detailText = texLabel;
}

export function enter(ctx: AppContext): void {
  equipment.forEach(e => e.isVisible = true);
  if (titlePanel) titlePanel.isVisible = true;
}

export function exit(_ctx: AppContext): void {
  equipment.forEach(e => {
    e.isVisible = false;
    if (e.actionManager) {
      e.actionManager.dispose();
      e.actionManager = null;
    }
  });
  if (titlePanel) titlePanel.isVisible = false;
  if (detailPanel) detailPanel.isVisible = false;
}

export function execute(_ctx: AppContext, _delta: number, time: number): void {}