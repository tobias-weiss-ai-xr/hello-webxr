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

  ctx.room = 128;
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
        ctx.goto = elementIndex + 1;
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