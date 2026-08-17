import type { AppContext } from '../types/index.js';
import { ELEMENTS } from '../data/elements.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4, Vector3, Quaternion } from '@babylonjs/core/Maths/math.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui/2D/index.js';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';
import { buildRoom } from './RoomBuilder.js';

const ROOM_COLOR = new Color3(0.15, 0.17, 0.20);
const WALL_COLOR = new Color3(0.20, 0.22, 0.26);
const CEILING_COLOR = new Color3(0.12, 0.12, 0.14);
const AMBIENT_COLOR = new Color3(0.35, 0.36, 0.40);
const POINT_COLOR = new Color3(0.98, 0.95, 0.88);

let periodicTableGroup: TransformNode | null = null;
let elementButtons: AbstractMesh[] = [];
let uiTexture: AdvancedDynamicTexture | null = null;
let hoveredElement: any | null = null;
let titleText: TextBlock | null = null;
let infoText: TextBlock | null = null;

function toColor3(color: number): Color3 {
  return Color3.FromInts((color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
}

export function setup(ctx: AppContext): void {
  const scene = ctx.scene;

  scene.clearColor = new Color4(0.05, 0.05, 0.08, 1);

  uiTexture = AdvancedDynamicTexture.CreateFullscreenUI('periodicPavilionUI', true, scene);

  const room = buildRoom(scene, {
    dimensions: { width: 30, height: 5, depth: 20 },
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

  createPeriodicTable(ctx);
  createInfoPanels(ctx);

  // Show a banner when a deep-link target didn't resolve, instead of the user
  // being silently dropped into the fair/lobby.
  window.addEventListener('pse:room-not-found', (ev: Event) => {
    const q = (ev as CustomEvent).detail?.query;
    if (infoText) {
      infoText.text = `Element „${q}" nicht gefunden — bitte ein Element im Periodensystem wählen.`;
      infoText.color = '#ffd166';
    }
  });
}

function createPeriodicTable(ctx: AppContext): void {
  const scene = ctx.scene;
  periodicTableGroup = new TransformNode('periodicTable', scene);
  ctx.trackNode(periodicTableGroup);

  const tableWidth = 18;
  const tableHeight = 7;
  const tableDepth = 2;

  const startX = -tableWidth / 2;
  const startY = tableHeight / 2;

  ELEMENTS.forEach(element => {
    if (!element.groupNumber || !element.period) return;

    const cellWidth = 0.9;
    const cellHeight = 0.8;
    const cellDepth = 0.3;

    const gn = Number.isFinite(element.groupNumber as any) ? (element.groupNumber as number) : 1;
    const per = Number.isFinite(element.period) ? element.period : 1;
    const x = startX + (gn - 0.5) * cellWidth;
    const y = startY - (per - 0.5) * cellHeight;
    const z = 0;

    const button = MeshBuilder.CreateBox(`element_${element.symbol}`, {
      width: cellWidth - 0.1,
      height: cellHeight - 0.1,
      depth: cellDepth
    }, scene);

    const buttonMat = new StandardMaterial(`buttonMat_${element.symbol}`, scene);
    const cNum = typeof element.color === 'number' ? element.color : 0xCCCCCC;
    buttonMat.diffuseColor = toColor3(cNum);
    buttonMat.emissiveColor = toColor3(cNum).scale(0.4);
    buttonMat.specularColor = new Color3(0.5, 0.5, 0.5);
    button.material = buttonMat;

    button.position.set(x, y, z);
    button.parent = periodicTableGroup;
    button.metadata = { element };
    ctx.trackMesh(button);
    elementButtons.push(button);

    button.actionManager = new (window as any).BABYLON.ActionManager(scene);
    button.actionManager?.registerAction(
      new (window as any).BABYLON.ExecuteCodeAction(
        (window as any).BABYLON.ActionManager.OnPointerOverTrigger,
        () => onElementHover(ctx, element, buttonMat)
      )
    );
    button.actionManager?.registerAction(
      new (window as any).BABYLON.ExecuteCodeAction(
        (window as any).BABYLON.ActionManager.OnPointerOutTrigger,
        () => onElementHoverOut(ctx, buttonMat)
      )
    );
    button.actionManager?.registerAction(
      new (window as any).BABYLON.ExecuteCodeAction(
        (window as any).BABYLON.ActionManager.OnPickTrigger,
        () => onElementClick(ctx, element)
      )
    );
  });

  const titleMat = new StandardMaterial('titleMat', scene);
  titleMat.diffuseColor = new Color3(0.35, 0.4, 0.45);
  titleMat.emissiveColor = new Color3(0.25, 0.3, 0.35);
  titleMat.alpha = 0.9;
  titleMat.disableLighting = true;
  titleMat.backFaceCulling = false;

  const titleTextBlock = new TextBlock('periodicTableTitle', 'Periodic Table');
  titleTextBlock.color = 'white';
  titleTextBlock.fontSize = 32;
  titleTextBlock.fontWeight = 'bold';
  titleTextBlock.paddingTop = '100px';
  uiTexture?.addControl(titleTextBlock);
  titleText = titleTextBlock;
}

function createInfoPanels(ctx: AppContext): void {
  const scene = ctx.scene;

  const infoMat = new StandardMaterial('infoMat', scene);
  infoMat.diffuseColor = ROOM_COLOR;
  infoMat.emissiveColor = ROOM_COLOR.scale(0.3);
  infoMat.alpha = 0.85;
  infoMat.backFaceCulling = false;

  const infoPanel = MeshBuilder.CreatePlane('infoPanel', { width: 6, height: 2.5 }, scene);
  infoPanel.position.set(0, 3.5, -8);
  infoPanel.rotation.y = Math.PI;
  infoPanel.material = infoMat;
  infoPanel.billboardMode = 7;
  ctx.trackMesh(infoPanel);

  const elementName = new TextBlock('elementName', 'Select an element');
  elementName.color = 'white';
  elementName.fontSize = 28;
  elementName.fontWeight = 'bold';
  uiTexture?.addControl(elementName);
  elementName.linkWithMesh(infoPanel);
  elementName.linkOffsetY = -60;

  const elementInfo = new TextBlock('elementInfo', 'Hover over an element to see details');
  elementInfo.color = '#cccccc';
  elementInfo.fontSize = 16;
  elementInfo.textWrapping = true;
  elementInfo.width = 5.5;
  uiTexture?.addControl(elementInfo);
  elementInfo.linkWithMesh(infoPanel);
  elementInfo.linkOffsetY = 10;

  infoText = elementInfo;
}

function onElementHover(ctx: AppContext, element: any, material: StandardMaterial): void {
  hoveredElement = element;
  const hoverCNum = typeof element.color === 'number' ? element.color : 0xCCCCCC;
  material.emissiveColor = toColor3(hoverCNum).scale(0.8);

  if (infoText) {
    infoText.text = `${element.name} (${element.symbol})\nAtomic #: ${element.atomicNumber}\nGroup: ${element.group}\nClick to enter room`;
  }
}

function onElementHoverOut(_ctx: AppContext, material: StandardMaterial): void {
  hoveredElement = null;
  material.emissiveColor = material.diffuseColor.scale(0.4);

  if (infoText) {
    infoText.text = 'Hover over an element to see details';
  }
}

function onElementClick(ctx: AppContext, element: any): void {
  const elementIndex = ELEMENTS.indexOf(element);
  if (elementIndex !== -1) {
    ctx.goto = elementIndex + 1;
  }
}

export function enter(ctx: AppContext): void {
  elementButtons.forEach(b => b.isVisible = true);
  if (periodicTableGroup) periodicTableGroup.setEnabled(true);
  if (titleText) titleText.isVisible = true;
  if (infoText) infoText.isVisible = true;
}

export function exit(_ctx: AppContext): void {
  elementButtons.forEach(b => b.isVisible = false);
  if (periodicTableGroup) periodicTableGroup.setEnabled(false);
  if (titleText) titleText.isVisible = false;
  if (infoText) infoText.isVisible = false;
}

export function execute(_ctx: AppContext, _delta: number, time: number): void {
  if (periodicTableGroup) {
    periodicTableGroup.rotation.y = Math.sin(time * 0.1) * 0.05;
  }
}