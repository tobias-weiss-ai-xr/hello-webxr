import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4, Vector3 } from '@babylonjs/core/Maths/math.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { HemisphericLight, PointLight } from '@babylonjs/core/Lights/index.js';
import { ActionManager, ExecuteCodeAction } from '@babylonjs/core/Actions/index.js';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui/2D/index.js';

import type { AppContext, ElementData } from '../types/index.js';
import { ELEMENTS } from '../data/elements.js';
import { ROOM_LOBBY } from './RoomManager.js';

interface ElectronData { angle: number; shellRadius: number; speed: number; isElectron: true }

function toColor3(color: string | number): Color3 {
  if (typeof color === 'number') {
    return Color3.FromInts((color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
  }
  return Color3.FromHexString(color.startsWith('#') ? color : `#${color}`);
}

function makeMat(scene: import('@babylonjs/core').Scene, name: string, color: Color3, opts: { unlit?: boolean; alpha?: number; emissive?: Color3 } = {}): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = color;
  if (opts.unlit) m.disableLighting = true;
  if (opts.alpha !== undefined) m.alpha = opts.alpha;
  if (opts.emissive) m.emissiveColor = opts.emissive;
  return m;
}

let atomModel: TransformNode;
let ui: AdvancedDynamicTexture;
let elementData: ElementData | undefined;
let trackedMeshes: import('@babylonjs/core').AbstractMesh[] = [];

export function setup(ctx: AppContext, elementSymbol?: string): void {
  if (!elementSymbol) return;
  elementData = ELEMENTS.find(e => e.symbol === elementSymbol);
  if (!elementData) return;

  ui = AdvancedDynamicTexture.CreateFullscreenUI('elementRoomUI');

  const themeColor = toColor3(elementData.color);
  ctx.scene.clearColor = new Color4(themeColor.r * 0.15, themeColor.g * 0.15, themeColor.b * 0.15, 1);

  createFloor(ctx, themeColor);
  createAtomModel(ctx, elementData);
  createInfoPanel(ctx, elementData);
  createExperimentStations(ctx, elementData);
  setupLighting(ctx, themeColor);
  createTeleportZone(ctx);
  createNavigationPanel(ctx);
}

function createFloor(ctx: AppContext, themeColor: Color3): void {
  const floor = MeshBuilder.CreateCylinder('elementFloor', { diameter: 20, height: 0.2, tessellation: 64 }, ctx.scene);
  floor.position.y = -0.1;
  floor.material = makeMat(ctx.scene, 'elementFloorMat', themeColor.scale(0.1), { unlit: true });
  ctx.trackMesh(floor);
  trackedMeshes.push(floor);
}

function createAtomModel(ctx: AppContext, element: ElementData): void {
  atomModel = new TransformNode('atomModel', ctx.scene);
  atomModel.position.y = 2;
  atomModel.scaling.setAll(1.5);
  ctx.trackNode(atomModel);

  const themeColor = toColor3(element.color);

  const nucleus = MeshBuilder.CreateSphere('nucleus', { diameter: 1, segments: 32 }, ctx.scene);
  nucleus.parent = atomModel;
  nucleus.material = makeMat(ctx.scene, 'nucleusMat', themeColor, { emissive: themeColor.scale(0.2) });
  nucleus.metadata = { isNucleus: true };

  const shells = [2, 8, 18, 32, 50, 72];
  let electronsPlaced = 0;
  let shellRadius = 1.0;

  while (electronsPlaced < element.atomicNumber) {
    const maxInShell = shells[Math.min(Math.floor(shellRadius), shells.length - 1)];
    const electronsInShell = Math.min(maxInShell, element.atomicNumber - electronsPlaced);

    const shell = MeshBuilder.CreateTorus(`shell_${shellRadius}`, {
      diameter: shellRadius * 2, thickness: 0.04, tessellation: 64
    }, ctx.scene);
    shell.rotation.x = Math.PI / 2;
    shell.parent = atomModel;
    shell.material = makeMat(ctx.scene, `shellMat_${shellRadius}`, themeColor, { unlit: true, alpha: 0.2 });
    shell.metadata = { isShell: true };

    for (let i = 0; i < electronsInShell; i++) {
      const angle = (i / electronsInShell) * Math.PI * 2;
      const electron = MeshBuilder.CreateSphere(`electron_${electronsPlaced + i}`, { diameter: 0.16, segments: 16 }, ctx.scene);
      electron.position.x = Math.cos(angle) * shellRadius;
      electron.position.z = Math.sin(angle) * shellRadius;
      electron.parent = atomModel;
      electron.material = makeMat(ctx.scene, `eMat_${electronsPlaced + i}`, Color3.White(), { emissive: Color3.White().scale(0.5) });
      electron.metadata = { isElectron: true, angle, shellRadius, speed: 1.5 + Math.random() * 0.5 } as ElectronData;
    }

    electronsPlaced += electronsInShell;
    shellRadius += 0.5;
  }
}

function createInfoPanel(ctx: AppContext, element: ElementData): void {
  const panel = MeshBuilder.CreateBox('infoPanel', { width: 3, height: 4, depth: 0.1 }, ctx.scene);
  panel.position.set(-4, 2, 0);
  panel.lookAt(new Vector3(0, 2, 0));
  panel.material = makeMat(ctx.scene, 'infoPanelMat', new Color3(0.16, 0.16, 0.23), { unlit: true, alpha: 0.9 });
  ctx.trackMesh(panel);
  trackedMeshes.push(panel);

  const titleText = new TextBlock('elementTitle');
  titleText.text = `${element.symbol} - ${element.name}\nGruppe: ${element.group}\nPeriode: ${element.period}`;
  titleText.color = 'white';
  titleText.fontSize = 16;
  titleText.textWrapping = true;
  titleText.width = 2.5;
  ui.addControl(titleText);
  titleText.linkWithMesh(panel);
  titleText.linkOffsetY = 60;

  const descText = new TextBlock('elementDesc');
  descText.text = `OZ: ${element.atomicNumber}  Masse: ${element.mass}\n\n${element.description}`;
  descText.color = '#cccccc';
  descText.fontSize = 12;
  descText.textWrapping = true;
  descText.width = 2.5;
  ui.addControl(descText);
  descText.linkWithMesh(panel);
  descText.linkOffsetY = -40;
}

function createExperimentStations(ctx: AppContext, element: ElementData): void {
  const experiments = element.experiments || [];
  const themeColor = toColor3(element.color);

  experiments.forEach((expId, index) => {
    const angle = (index / Math.max(experiments.length, 1)) * Math.PI * 2;
    const x = Math.cos(angle) * 6;
    const z = Math.sin(angle) * 6;

    const station = MeshBuilder.CreateCylinder(`expStation_${expId}`, { diameter: 1.6, height: 0.5, tessellation: 16 }, ctx.scene);
    station.position.set(x, 0.25, z);
    station.material = makeMat(ctx.scene, `stationMat_${expId}`, themeColor.scale(0.8), { unlit: true, alpha: 0.6 });
    ctx.trackMesh(station);
    trackedMeshes.push(station);

    const icon = MeshBuilder.CreateSphere(`stationIcon_${expId}`, { diameter: 0.4, segments: 16 }, ctx.scene);
    icon.position.y = 0.6;
    icon.parent = station;
    icon.material = makeMat(ctx.scene, `iconMat_${expId}`, Color3.White(), { unlit: true });

    station.actionManager = new ActionManager(ctx.scene);
    station.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => station.scaling.setAll(1.2)));
    station.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => station.scaling.setAll(1)));
  });
}

function setupLighting(ctx: AppContext, themeColor: Color3): void {
  const ambient = new HemisphericLight('elementAmbient', new Vector3(0, 1, 0), ctx.scene);
  ambient.intensity = 0.3;

  const light1 = new PointLight('elementPoint1', new Vector3(5, 5, 5), ctx.scene);
  light1.diffuse = themeColor;
  light1.intensity = 0.8;
  light1.range = 15;

  const light2 = new PointLight('elementPoint2', new Vector3(-5, 5, -5), ctx.scene);
  light2.diffuse = themeColor;
  light2.intensity = 0.8;
  light2.range = 15;
}

function createTeleportZone(ctx: AppContext): void {
  const floor = MeshBuilder.CreateGround('elementTeleportFloor', { width: 20, height: 20 }, ctx.scene);
  floor.position.y = 0.001;
  floor.isVisible = false;
  floor.isPickable = false;
  ctx.trackMesh(floor);
}

function createNavigationPanel(ctx: AppContext): void {
  const navPanel = MeshBuilder.CreateBox('navPanel', { width: 1.5, height: 0.5, depth: 0.1 }, ctx.scene);
  navPanel.position.set(0, 1.5, -5);
  navPanel.material = makeMat(ctx.scene, 'navPanelMat', new Color3(0.2, 0.2, 0.3), { unlit: true, alpha: 0.9 });
  ctx.trackMesh(navPanel);
  trackedMeshes.push(navPanel);

  const navLabel = new TextBlock('navLabel');
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
  if (atomModel) atomModel.setEnabled(true);
}

export function exit(_ctx: AppContext): void {
  trackedMeshes.forEach(m => { m.isVisible = false; });
  if (atomModel) atomModel.setEnabled(false);
}

export function execute(_ctx: AppContext, delta: number, time: number): void {
  if (!atomModel?.isEnabled()) return;

  atomModel.getChildMeshes().forEach(child => {
    const meta = child.metadata;
    if (meta?.isElectron) {
      const d = meta as ElectronData;
      d.angle += d.speed * delta;
      child.position.x = Math.cos(d.angle) * d.shellRadius;
      child.position.z = Math.sin(d.angle) * d.shellRadius;
    } else if (meta?.isNucleus) {
      child.rotation.y += delta * 0.3;
      const pulse = 1 + Math.sin(time * 2) * 0.05;
      child.scaling.setAll(pulse);
    } else if (meta?.isShell) {
      child.rotation.z += delta * 0.1;
    }
  });
}
