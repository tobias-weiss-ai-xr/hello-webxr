import type { AppContext, ElementData, ExperimentalRoomData } from '../types/index.js';
import { ELEMENTS, EXPERIMENTAL_ROOMS } from '../data/elements.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4, Vector3 } from '@babylonjs/core/Maths/math.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { HemisphericLight, PointLight } from '@babylonjs/core/Lights/index.js';
import { ActionManager, ExecuteCodeAction } from '@babylonjs/core/Actions/index.js';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui/2D/index.js';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';

const ATOM_RADIUS = 0.8;
const ORBIT_RADIUS = 4;
const ELECTRON_SPEED = 0.5;

interface ElectronData {
  angle: number;
  speed: number;
  radius: number;
}

let atomCore: AbstractMesh | null = null;
let electronOrbits: { group: TransformNode; electron: AbstractMesh; data: ElectronData }[] = [];
let elementButtons: AbstractMesh[] = [];
let expButtons: AbstractMesh[] = [];
let periodicTableGroup: TransformNode | null = null;
let infoPanel: AbstractMesh | null = null;
let teleportFloor: AbstractMesh | null = null;
let uiTexture: AdvancedDynamicTexture | null = null;
let elementLabels: TextBlock[] = [];
let currentSelection: string | null = null;
let infoTitle: TextBlock | null = null;
let infoDescription: TextBlock | null = null;

function toColor3(color: string | number): Color3 {
  if (typeof color === 'number') {
    return Color3.FromInts((color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
  }
  return Color3.FromHexString(color.startsWith('#') ? color : `#${color}`);
}

export function setup(ctx: AppContext): void {
  const scene = ctx.scene;

  scene.clearColor = new Color4(0.04, 0.04, 0.1, 1);

  createFloor(ctx);
  createTeleportFloor(ctx);
  createAtomNucleus(ctx);
  createElectronOrbits(ctx);
  createPeriodicTableHologram(ctx);
  createElementButtons(ctx);
  createExpRoomButtons(ctx);
  createInfoPanel(ctx);

  const ambientLight = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
  ambientLight.intensity = 0.2;
  ambientLight.parent = ctx.roomRoot;

  const coreLight = new PointLight('coreLight', new Vector3(0, 2, 0), scene);
  coreLight.intensity = 1;
  coreLight.diffuse = toColor3(0x4a90e2);
  coreLight.range = 10;
  coreLight.parent = ctx.roomRoot;

  uiTexture = AdvancedDynamicTexture.CreateFullscreenUI('lobbyUI', true, scene);
}

function createFloor(ctx: AppContext): void {
  const scene = ctx.scene;
  const floor = MeshBuilder.CreateCylinder('floor', { diameter: 30, height: 0.2, tessellation: 64 }, scene);
  floor.position.y = -0.1;
  floor.parent = ctx.roomRoot;

  const floorMat = new StandardMaterial('floorMat', scene);
  floorMat.diffuseColor = toColor3(0x1a1a2e);
  floorMat.emissiveColor = toColor3(0x1a1a2e);
  floorMat.disableLighting = true;
  floor.material = floorMat;
}

function createTeleportFloor(ctx: AppContext): void {
  const scene = ctx.scene;
  teleportFloor = MeshBuilder.CreatePlane('teleportFloor', { width: 30, height: 30 }, scene);
  teleportFloor.rotation.x = Math.PI / 2;
  teleportFloor.position.y = 0.001;
  teleportFloor.parent = ctx.roomRoot;
  teleportFloor.isVisible = false;
}

function createAtomNucleus(ctx: AppContext): void {
  const scene = ctx.scene;
  const coreMat = new StandardMaterial('coreMat', scene);
  coreMat.diffuseColor = toColor3(0x4a90e2);
  coreMat.emissiveColor = toColor3(0x4a90e2);
  coreMat.alpha = 0.8;
  coreMat.disableLighting = true;

  atomCore = MeshBuilder.CreateSphere('atomCore', { diameter: ATOM_RADIUS * 2, segments: 32 }, scene);
  atomCore.position.y = 1.6;
  atomCore.material = coreMat;
  atomCore.parent = ctx.roomRoot;

  const glowMat = new StandardMaterial('glowMat', scene);
  glowMat.diffuseColor = toColor3(0x4a90e2);
  glowMat.emissiveColor = toColor3(0x4a90e2);
  glowMat.alpha = 0.3;
  glowMat.disableLighting = true;
  glowMat.backFaceCulling = false;

  const glow = MeshBuilder.CreateSphere('glow', { diameter: ATOM_RADIUS * 3, segments: 32 }, scene);
  glow.position.y = 1.6;
  glow.material = glowMat;
  glow.parent = ctx.roomRoot;
}

function createElectronOrbits(ctx: AppContext): void {
  const scene = ctx.scene;
  const orbitLevels = [1, 2, 3];
  const colors = [0xFF6B6B, 0x50e3c2, 0xf5a623];

  orbitLevels.forEach((level, i) => {
    const radius = ORBIT_RADIUS + (level * 1.5);
    const orbitMat = new StandardMaterial(`orbitMat${i}`, scene);
    orbitMat.diffuseColor = toColor3(colors[i % colors.length]);
    orbitMat.emissiveColor = toColor3(colors[i % colors.length]);
    orbitMat.alpha = 0.5;
    orbitMat.disableLighting = true;

    const orbit = MeshBuilder.CreateTorus(`orbit${i}`, { diameter: radius * 2, thickness: 0.04, tessellation: 100 }, scene);
    orbit.rotation.x = Math.PI / 2;
    orbit.position.y = 1.6;
    orbit.material = orbitMat;
    orbit.parent = ctx.roomRoot;

    const electronMat = new StandardMaterial(`electronMat${i}`, scene);
    electronMat.diffuseColor = Color3.White();
    electronMat.emissiveColor = Color3.White();
    electronMat.disableLighting = true;

    const electron = MeshBuilder.CreateSphere(`electron${i}`, { diameter: 0.2, segments: 16 }, scene);
    electron.material = electronMat;

    const group = new TransformNode(`electronGroup${i}`, scene);
    group.position.y = 1.6;
    group.parent = ctx.roomRoot;
    electron.parent = group;

    electronOrbits.push({
      group,
      electron,
      data: {
        angle: Math.random() * Math.PI * 2,
        speed: ELECTRON_SPEED / (level * 0.7),
        radius
      }
    });
  });
}

function createPeriodicTableHologram(ctx: AppContext): void {
  const scene = ctx.scene;
  periodicTableGroup = new TransformNode('periodicTable', scene);
  periodicTableGroup.parent = ctx.roomRoot;

  const width = 12;
  const height = 7;
  const cols = 18;
  const rows = 7;

  const cellWidth = width / cols;
  const cellHeight = height / rows;

  for (let i = 0; i < ELEMENTS.length && i < 3; i++) {
    const element = ELEMENTS[i];
    const cellMat = new StandardMaterial(`cellMat${i}`, scene);
    cellMat.diffuseColor = toColor3(element.color);
    cellMat.emissiveColor = toColor3(element.color);
    cellMat.alpha = 0.3;
    cellMat.disableLighting = true;
    cellMat.backFaceCulling = false;

    const cell = MeshBuilder.CreateBox(`cell_${element.symbol}`, { width: cellWidth * 0.8, height: cellHeight * 0.8, depth: 0.05 }, scene);
    cell.material = cellMat;
    cell.parent = periodicTableGroup;

    if (element.groupNumber) {
      const x = (element.groupNumber - 9) * cellWidth;
      const y = (4 - element.period) * cellHeight;
      cell.position.set(x, y + 2, -6);
    }

    cell.metadata = { element };
  }
}

function createElementButtons(ctx: AppContext): void {
  const scene = ctx.scene;
  const radius = 8;
  const angleStep = (Math.PI * 2) / ELEMENTS.length;

  ELEMENTS.forEach((element, index) => {
    const angle = index * angleStep;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const buttonMat = new StandardMaterial(`elementButtonMat${index}`, scene);
    buttonMat.diffuseColor = toColor3(element.color);
    buttonMat.emissiveColor = toColor3(element.color);
    buttonMat.alpha = 0.7;
    buttonMat.disableLighting = true;

    const button = MeshBuilder.CreateSphere(`elementButton_${element.symbol}`, { diameter: 0.5, segments: 16 }, scene);
    button.position.set(x, 1.6, z);
    button.material = buttonMat;
    button.parent = ctx.roomRoot;
    button.metadata = { element, roomIndex: index + 1 };

    const label = new TextBlock(`label_${element.symbol}`, element.symbol);
    label.color = 'white';
    label.fontSize = 14;
    label.outlineWidth = 2;
    label.outlineColor = 'black';
    label.linkWithMesh(button);
    label.linkOffsetY = -30;
    uiTexture?.addControl(label);
    elementLabels.push(label);

    elementButtons.push(button);
  });
}

function createExpRoomButtons(ctx: AppContext): void {
  const scene = ctx.scene;
  const radius = 12;
  const angleStep = (Math.PI * 2) / EXPERIMENTAL_ROOMS.length;

  EXPERIMENTAL_ROOMS.forEach((room, index) => {
    const angle = index * angleStep;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const buttonMat = new StandardMaterial(`expButtonMat${index}`, scene);
    const roomColor = room.color ?? 0x888888;
    buttonMat.diffuseColor = toColor3(roomColor);
    buttonMat.emissiveColor = toColor3(roomColor);
    buttonMat.alpha = 0.6;
    buttonMat.disableLighting = true;

    const button = MeshBuilder.CreateBox(`expButton_${room.id}`, { width: 0.8, height: 0.8, depth: 0.1 }, scene);
    button.position.set(x, 1.6, z);
    button.material = buttonMat;
    button.parent = ctx.roomRoot;
    button.metadata = { expRoom: room, roomIndex: ELEMENTS.length + index + 1 };

    expButtons.push(button);
  });
}

function createInfoPanel(ctx: AppContext): void {
  const scene = ctx.scene;

  const panelMat = new StandardMaterial('infoPanelMat', scene);
  panelMat.diffuseColor = toColor3(0x2a2a3a);
  panelMat.emissiveColor = toColor3(0x2a2a3a);
  panelMat.alpha = 0.9;
  panelMat.disableLighting = true;
  panelMat.backFaceCulling = false;

  infoPanel = MeshBuilder.CreatePlane('infoPanel', { width: 3, height: 2 }, scene);
  infoPanel.position.set(0, 3.5, -4);
  infoPanel.material = panelMat;
  infoPanel.isVisible = false;
  infoPanel.parent = ctx.roomRoot;

  infoTitle = new TextBlock('infoTitle', '');
  infoTitle.color = 'white';
  infoTitle.fontSize = 18;
  infoTitle.fontWeight = 'bold';
  infoTitle.textWrapping = true;
  infoTitle.width = 2.6;
  infoTitle.linkWithMesh(infoPanel);
  infoTitle.linkOffsetY = -30;
  uiTexture?.addControl(infoTitle);

  infoDescription = new TextBlock('infoDescription', '');
  infoDescription.color = '#cccccc';
  infoDescription.fontSize = 12;
  infoDescription.textWrapping = true;
  infoDescription.width = 2.6;
  infoDescription.linkWithMesh(infoPanel);
  infoDescription.linkOffsetY = 60;
  uiTexture?.addControl(infoDescription);
}

function setupInteractions(ctx: AppContext): void {
  const scene = ctx.scene;

  elementButtons.forEach(button => {
    button.actionManager = new ActionManager(scene);
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        button.scaling.setAll(1.3);
        const element = button.metadata.element as ElementData;
        showElementInfo(element);
      })
    );
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        button.scaling.setAll(1);
        hideElementInfo();
      })
    );
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        ctx.goto = button.metadata.roomIndex as number;
      })
    );
  });

  expButtons.forEach(button => {
    button.actionManager = new ActionManager(scene);
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        button.scaling.setAll(1.2);
      })
    );
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        button.scaling.setAll(1);
      })
    );
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        ctx.goto = button.metadata.roomIndex as number;
      })
    );
  });

  if (teleportFloor) {
    teleportFloor.actionManager = new ActionManager(scene);
    teleportFloor.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      })
    );
  }
}

function showElementInfo(element: ElementData): void {
  if (!element || currentSelection === element.symbol) return;

  currentSelection = element.symbol;
  if (infoPanel) {
    infoPanel.isVisible = true;
  }
  if (infoTitle) {
    infoTitle.text = `${element.symbol} - ${element.name}`;
  }
  if (infoDescription) {
    infoDescription.text = element.description;
  }
}

function hideElementInfo(): void {
  currentSelection = null;
  if (infoPanel) {
    infoPanel.isVisible = false;
  }
}

export function enter(ctx: AppContext): void {
  elementButtons.forEach(button => button.isVisible = true);
  expButtons.forEach(button => button.isVisible = true);
  if (atomCore) atomCore.isVisible = true;
  electronOrbits.forEach(({ group, electron }) => {
    group.isVisible = true;
    electron.isVisible = true;
  });
  if (periodicTableGroup) periodicTableGroup.isEnabled(true);
  if (teleportFloor) teleportFloor.isVisible = true;
  if (infoPanel) infoPanel.isVisible = false;
  elementLabels.forEach(label => label.isVisible = true);
  if (infoTitle) infoTitle.isVisible = false;
  if (infoDescription) infoDescription.isVisible = false;

  setupInteractions(ctx);
}

export function exit(_ctx: AppContext): void {
  elementButtons.forEach(button => {
    button.isVisible = false;
    if (button.actionManager) {
      button.actionManager.dispose();
      button.actionManager = null;
    }
  });
  expButtons.forEach(button => {
    button.isVisible = false;
    if (button.actionManager) {
      button.actionManager.dispose();
      button.actionManager = null;
    }
  });
  if (atomCore) atomCore.isVisible = false;
  electronOrbits.forEach(({ group, electron }) => {
    group.isVisible = false;
    electron.isVisible = false;
  });
  if (periodicTableGroup) periodicTableGroup.setEnabled(false);
  if (teleportFloor) {
    teleportFloor.isVisible = false;
    if (teleportFloor.actionManager) {
      teleportFloor.actionManager.dispose();
      teleportFloor.actionManager = null;
    }
  }
  if (infoPanel) infoPanel.isVisible = false;
  elementLabels.forEach(label => label.isVisible = false);
  if (infoTitle) infoTitle.isVisible = false;
  if (infoDescription) infoDescription.isVisible = false;

  hideElementInfo();
}

export function execute(_ctx: AppContext, _delta: number, time: number): void {
  if (atomCore && atomCore.material instanceof StandardMaterial) {
    atomCore.material.alpha = 0.6 + Math.sin(time * 2) * 0.2;
    atomCore.scaling.setAll(1 + Math.sin(time * 3) * 0.05);
  }

  electronOrbits.forEach(({ electron, data }) => {
    data.angle += data.speed * 0.016;
    electron.position.x = Math.cos(data.angle) * data.radius;
    electron.position.z = Math.sin(data.angle) * data.radius;
  });

  if (periodicTableGroup) {
    periodicTableGroup.rotation.y = time * 0.1;
    periodicTableGroup.position.y = 2 + Math.sin(time * 0.5) * 0.2;
  }

  elementButtons.forEach((button, i) => {
    button.position.y = 1.6 + Math.sin(time * 2 + i * 0.5) * 0.1;
  });
}
