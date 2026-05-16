import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { StandardMaterial as StdMat } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4, Vector3, Quaternion } from '@babylonjs/core/Maths/math.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { HemisphericLight, PointLight } from '@babylonjs/core/Lights/index.js';
import { AdvancedDynamicTexture, TextBlock, Rectangle } from '@babylonjs/gui/2D/index.js';
import { buildRoom, type RoomBuildOptions, type ThemeBasedRoomOptions } from './RoomBuilder.js';
import { ROOM_ELEMENTS_START } from './RoomManager.js';

import type { AppContext, ElementData } from '../types/index.js';
import { ELEMENTS } from '../data/elements.js';
import { THEMES } from '../data/themes.js';
import type { Theme } from '../types/index.js';

const BASE_ROOM_COLOR = new Color3(0.15, 0.17, 0.20);
const ACCENT_COLOR = new Color3(0.3, 0.35, 0.45);
const ELEMENT_INFO_COLOR = new Color3(0.35, 0.38, 0.48);

let mainAtom: TransformNode | null = null;
let electronOrbits: { group: TransformNode; electron: any; radius: number; speed: number; angle: number }[] = [];
let elementInfoPanel: any | null = null;
let elementTitle: TextBlock | null = null;
let elementDesc: TextBlock | null = null;
let elementProps: TextBlock | null = null;
let elementSymbolDisplay: TextBlock | null = null;
let electronCountTextBlock: TextBlock | null = null;
let electronShellLabels: TextBlock[] = [];
let electronShells: { radius: number; label: TextBlock }[] = [];
let orbitRings: any[] = [];
let elementUI: AdvancedDynamicTexture | null = null;
let currentElementSymbol: string | undefined = undefined;

const ATOM_RADIUS = 0.8;

// Realistic electron shell capacities (K, L, M, N, O, P, Q shells)
const SHELL_CAPACITYS = [2, 8, 18, 32, 32, 18, 8];
const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
const SHELL_RADII = [0.6, 0.85, 1.15, 1.45, 1.7, 1.95, 2.2];

function toColor3(color: number): Color3 {
  return Color3.FromInts((color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
}

function getThemeForElement(elementSymbol: string): Theme {
  const element = ELEMENTS.find(e => e.symbol === elementSymbol);
  if (!element) return THEMES.NONMETALS;

  if (element.symbol === 'H') return THEMES.HYDROGEN_SPECIAL;
  if (element.symbol === 'He') return THEMES.HELIUM_SPECIAL;
  if (['Au', 'Ag', 'Pt', 'Pd'].includes(element.symbol)) return THEMES.NOBLE_METALS;

  switch (element.group) {
    case 'nobleGas': return THEMES.NOBLE_GASES;
    case 'alkali': return THEMES.ALKALI_METALS;
    case 'halogen': return THEMES.HALOGENS;
    case 'transition': return THEMES.TRANSITION_METALS;
    case 'lanthanide': return THEMES.LANTHANIDES;
    case 'actinide': return THEMES.ACTINIDES;
    case 'metalloid': return THEMES.METALLOIDS;
    case 'alkalineEarth': return THEMES.ALKALINE_EARTH;
    default: return THEMES.NONMETALS;
  }
}

interface AtomPart {
  mesh: any;
  label?: TextBlock;
  offsetAngle: number;
}

let atomParts: AtomPart[] = [];

/**
 * Get electron configuration based on group
 * Simplified representation for educational purposes
 */
function getElectronConfiguration(group: string, atomicNumber: number): number[] {
  const groupToShells = new Map<string, number[]>();
  groupToShells.set('1', [2]);
  groupToShells.set('2', [2, 8]);
  groupToShells.set('3', [2, 8, 18]);
  groupToShells.set('4', [2, 8, 18, 32]);
  groupToShells.set('5', [2, 8, 18, 32]);

  const groupShells = groupToShells.get(group);
  if (groupShells) {
    return groupShells;
  }

  // Fallback: progressive filling of shells
  const electrons = atomicNumber;
  if (electrons <= 2) return [2];
  if (electrons <= 10) return [2, 8];
  if (electrons <= 18) return [2, 8, 8];
  if (electrons <= 36) return [2, 8, 18, 8];
  return [2, 8, 18, 32];
}

export function setup(ctx: AppContext, elementSymbol?: string): void {
  if (!elementSymbol) return;

  currentElementSymbol = elementSymbol;

  const element = ELEMENTS.find(e => e.symbol === elementSymbol);
  if (!element) return;

  const scene = ctx.scene;

  const theme = getThemeForElement(elementSymbol);

  scene.clearColor = new Color4(
    theme.baseColor.r * 0.3,
    theme.baseColor.g * 0.3,
    theme.baseColor.b * 0.3,
    1
  );

  // UI
  const elementUI = AdvancedDynamicTexture.CreateFullscreenUI('elementRoomUI');

  // Build unified room
  const room = buildRoom(scene, {
    dimensions: { width: 14, height: 5, depth: 14 },
    floorColor: BASE_ROOM_COLOR,
    wallColor: new Color3(0.18, 0.19, 0.22),
    ceilingColor: new Color3(0.10, 0.10, 0.13),
    ambientColor: new Color3(0.35, 0.36, 0.40),
    pointLightColor: new Color3(0.98, 0.95, 0.88),
    doorways: [
      { wall: 'south', offset: 0 },
      { wall: 'north', offset: 0, width: 1.8, height: 2.2 }
    ],
  });

  ctx.setFloorMesh?.(room.floor);

  createExitDoorway(ctx, theme);

  // Create unified atom display
  createAtomDisplay(ctx, element);

  // Create info panel
  createInfoPanel(ctx, element, elementUI!);

  // Connection lines/exploration hints
  createKeyConnections(ctx);
}

let exitArch: any = null;
let exitLabel: any = null;

function createExitDoorway(ctx: AppContext, theme: Theme): void {
  const scene = ctx.scene;

  const frameMaterial = new StdMat('exitFrame', scene);
  frameMaterial.emissiveColor = theme.accentColor.scale(0.3);
  frameMaterial.alpha = 0.6;
  frameMaterial.disableLighting = true;

  exitArch = MeshBuilder.CreateBox('exitArch', {
    height: 2.0,
    width: 1.8,
    depth: 0.1
  }, scene);

  exitArch.position.set(0, 1.6, 7);
  exitArch.material = frameMaterial;

  createExitLabel(ctx);

  ctx.trackMesh(exitArch);
}

function createExitLabel(ctx: AppContext): void {
  exitLabel = new TextBlock('exitLabel', 'EXIT → Lobby');
  exitLabel.color = 'white';
  exitLabel.fontSize = 14;
  exitLabel.fontWeight = 'bold';
  exitLabel.alpha = 0.8;

  elementUI?.addControl(exitLabel);
  exitLabel.linkWithMesh(exitArch);
  exitLabel.linkOffsetY = -60;
}

function createAtomDisplay(ctx: AppContext, element: ElementData): void {
  const scene = ctx.scene;

  mainAtom = new TransformNode('mainAtom', scene);
  ctx.trackNode(mainAtom);
  mainAtom.position = new Vector3(0, 2.5, 0);

  const electronConfig = getElectronConfiguration(element.group, element.atomicNumber);
  const elementColor = toColor3(typeof element.color === 'number' ? element.color : 0xCCCCCC);

  // Nucleus
  const nucleusMat = new StandardMaterial('nucleusMat', scene);
  nucleusMat.diffuseColor = elementColor;
  nucleusMat.emissiveColor = elementColor.scale(0.7);
  nucleusMat.specularColor = Color3.White();

  const nucleus = MeshBuilder.CreateSphere('nucleus', { diameter: ATOM_RADIUS * 2.5, segments: 32 }, scene);
  nucleus.material = nucleusMat;
  nucleus.parent = mainAtom;
  ctx.trackMesh(nucleus);

  // Symbol on nucleus
  const symbolMat = new StandardMaterial('projectionRingMat', scene);
  symbolMat.diffuseColor = Color3.White();
  symbolMat.emissiveColor = Color3.White();
  symbolMat.alpha = 0.3;
  symbolMat.disableLighting = true;

  const symbolRing = MeshBuilder.CreateTorus('symbolRing', {
    diameter: ATOM_RADIUS * 3.5,
    thickness: 0.08,
    tessellation: 64
  }, scene);
  symbolRing.material = symbolMat;
  symbolRing.rotation.x = Math.PI / 2;
  symbolRing.parent = mainAtom;
  ctx.trackMesh(symbolRing);

  // Electron shells
  electronConfig.forEach((shellMax, index) => {
    const shellRadius = ATOM_RADIUS + (index + 1) * 0.4;

    // Shell ring
    const shellMat = new StandardMaterial(`shellMat_${index}`, scene);
    shellMat.diffuseColor = new Color3(0.4, 0.45, 0.5);
    shellMat.emissiveColor = new Color3(0.3, 0.35, 0.4);
    shellMat.alpha = 0.3;
    shellMat.disableLighting = true;

    const shell = MeshBuilder.CreateTorus(`shell_${index}`, {
      diameter: shellRadius * 2,
      thickness: 0.03,
      tessellation: 128
    }, scene);
    shell.material = shellMat;
    shell.parent = mainAtom;
    shell.rotation.x = Math.PI / 2;
    ctx.trackMesh(shell);
    orbitRings.push(shell);

    // Add shell label
    const shellLabel = new TextBlock(`shellLabel_${index}`, `${electronConfig[index]}e⁻`);
    shellLabel.color = '#a0aec0';
    shellLabel.fontSize = 10;
    shellLabel.fontWeight = 'bold';
    elementUI?.addControl(shellLabel);
    shellLabel.isVisible = false;

    electronShells.push({ radius: shellRadius, label: shellLabel });

    const electronsInShell = Math.min(shellMax as number, 8);
    const electronAngleStep = (Math.PI * 2) / electronsInShell;

    for (let i = 0; i < electronsInShell; i++) {
      const electron = MeshBuilder.CreateSphere(`electron_${index}_${i}`, {
        diameter: 0.15,
        segments: 16
      }, scene);

      const electronMat = new StandardMaterial('electronMat', scene);
      electronMat.diffuseColor = Color3.White();
      electronMat.emissiveColor = Color3.White().scale(0.8);
      electronMat.disableLighting = true;

      electron.material = electronMat;

      const angle = i * electronAngleStep;
      electron.position.set(
        Math.cos(angle) * shellRadius,
        0,
        Math.sin(angle) * shellRadius
      );
      electron.parent = mainAtom;
      ctx.trackMesh(electron);

      electronOrbits.push({
        group: mainAtom!,
        electron,
        radius: shellRadius,
        speed: 2 / (index + 1.5),
        angle
      });
    }
  });

  // Element symbol display (large)
  elementSymbolDisplay = new TextBlock('elementSymbol', element.symbol);
  elementSymbolDisplay.color = element.color.toString();
  elementSymbolDisplay.fontSize = 72;
  elementSymbolDisplay.fontWeight = 'bold';
  elementUI?.addControl(elementSymbolDisplay);
  elementSymbolDisplay.isVisible = false;

  // Electron count text
  electronCountTextBlock = new TextBlock('electronCount', `Electrons: ${element.atomicNumber}`);
  electronCountTextBlock.color = '#a0aec0';
  electronCountTextBlock.fontSize = 16;
  elementUI?.addControl(electronCountTextBlock);
  electronCountTextBlock.isVisible = false;
}

function createInfoPanel(ctx: AppContext, element: ElementData, ui: AdvancedDynamicTexture | null): void {
  const scene = ctx.scene;

  // Create info panel mesh (semi-transparent panel)
  const panelMat = new StandardMaterial('infoPanelMat', scene);
  panelMat.diffuseColor = ELEMENT_INFO_COLOR;
  panelMat.emissiveColor = ELEMENT_INFO_COLOR.scale(0.3);
  panelMat.alpha = 0.85;
  panelMat.backFaceCulling = false;

  const panel = MeshBuilder.CreatePlane('infoPanel', { width: 5, height: 3 }, scene);
  panel.position.set(0, 3, -4);
  panel.rotation.y = Math.PI;
  panel.billboardMode = 7;
  panel.material = panelMat;
  ctx.trackMesh(panel);
  elementInfoPanel = panel;

  // UI overlay
  elementTitle = new TextBlock('elementTitle', `${element.symbol} - ${element.name}`);
  elementTitle.color = 'white';
  elementTitle.fontSize = 28;
  elementTitle.fontWeight = 'bold';
  elementUI?.addControl(elementTitle);
  elementTitle.linkWithMesh(panel);
  elementTitle.linkOffsetY = -80;

  elementDesc = new TextBlock('elementDesc', element.description || '');
  elementDesc.color = '#cccccc';
  elementDesc.fontSize = 14;
  elementDesc.textWrapping = true;
  elementDesc.width = 4.5;
  elementUI?.addControl(elementDesc);
  elementDesc.linkWithMesh(panel);
  elementDesc.linkOffsetY = -20;

  // Properties
  const props = `Atomic #: ${element.atomicNumber}\nMass: ${element.mass} u\nGroup: ${element.group}`;
  elementProps = new TextBlock('elementProps', props);
  elementProps.color = '#8899aa';
  elementProps.fontSize = 12;
  elementProps.lineSpacing = 1.8;
  elementUI?.addControl(elementProps);
  elementProps.linkWithMesh(panel);
  elementProps.linkOffsetY = 60;

  // Back button
  const backBtn = new Rectangle('backBtn');
  backBtn.width = '300px';
  backBtn.height = '40px';
  backBtn.cornerRadius = 6;
  backBtn.color = '#4a90e2';
  backBtn.thickness = 0;
  backBtn.background = '#4a90e2';
  backBtn.alpha = 0.9;

  const backText = new TextBlock('backText', '← Back');
  backText.color = 'white';
backText.fontSize = 16;
  backText.fontWeight = 'bold';
  backBtn.addControl(backText);
  backText.top = '10px';
  
  ui?.addControl(backBtn);
  backBtn.isVisible = true;  // Fix: Make back button visible
  backBtn.onPointerDownObservable.add(() => {
    ctx.GotoRoom(0, undefined, undefined);
  });
  
  // Keyboard shortcuts (desktop)
  const keyboardHandler = (e: KeyboardEvent) => {
    if (!currentElementSymbol) return;
    if (ctx.room !== ROOM_ELEMENTS_START + ELEMENTS.findIndex(el => el.symbol === currentElementSymbol)) return;
    
    if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') {
      ctx.GotoRoom(0, undefined, undefined);
    }
  };
  
  document.addEventListener('keydown', keyboardHandler);
  
  // Store handler for cleanup
  (window as any)._elementRoomKeyboardHandler = keyboardHandler;

  elementInfoPanel = panel;
}

function createKeyConnections(ctx: AppContext): void {
  const scene = ctx.scene;

  // Connection lines to related elements (simplified visual representation)
  const elementsGroup = ELEMENTS.find(e => e.symbol === ctx.scene?.metadata?.element?.symbol);
  if (!elementsGroup) return;

  // Create subtle connection hints (floating lines to related elements)
  // This is a simplified visual - in a full implementation, you might be more specific
  const hintMat = new StandardMaterial('hintMat', scene);
  hintMat.diffuseColor = new Color3(0.2, 0.25, 0.3);
  hintMat.alpha = 0.15;
  hintMat.disableLighting = true;

  const hint = MeshBuilder.CreateTorus('hintRing', { diameter: 12, thickness: 0.02, tessellation: 64 }, scene);
  hint.rotation.x = Math.PI / 2;
  hint.position.y = 1;
  hint.material = hintMat;
  hintMat.alpha = 0.1;
  ctx.trackMesh(hint);
}

export function enter(ctx: AppContext, elementSymbol?: string): void {
  const scene = ctx.scene;

  // Make UI visible
  if (elementInfoPanel) elementInfoPanel.isVisible = true;
  if (elementTitle) elementTitle.isVisible = true;
  if (elementDesc) elementDesc.isVisible = true;
  if (elementProps) elementProps.isVisible = true;
  if (elementSymbolDisplay) {
    elementSymbolDisplay.isVisible = true;
    elementSymbolDisplay.linkOffsetY = -120;
  }

  if (electronCountTextBlock) {
    electronCountTextBlock.isVisible = true;
  }

  // Show shell labels for a moment
  electronShells.forEach((shell, index) => {
    setTimeout(() => {
      if (shell.label) {
        shell.label.isVisible = true;
      }
      setTimeout(() => {
        if (shell.label) {
          shell.label.isVisible = false;
        }
      }, 3000);
    }, index * 500);
  });
}

export function exit(_ctx: AppContext): void {
  const handler = (window as any)._elementRoomKeyboardHandler;
  if (handler) {
    document.removeEventListener('keydown', handler);
    delete (window as any)._elementRoomKeyboardHandler;
  }

  if (exitArch) {
    exitArch.dispose();
    exitArch = null;
  }

  if (exitLabel) {
    exitLabel.dispose();
    exitLabel = null;
  }

  // Hide UI
  if (elementInfoPanel) elementInfoPanel.isVisible = false;
  if (elementTitle) elementTitle.isVisible = false;
  if (elementDesc) elementDesc.isVisible = false;
  if (elementProps) elementProps.isVisible = false;
  if (elementSymbolDisplay) elementSymbolDisplay.isVisible = false;
  if (electronCountTextBlock) electronCountTextBlock.isVisible = false;

  electronShells.forEach(shell => {
    if (shell.label) shell.label.isVisible = false;
  });
}

export function execute(_ctx: AppContext, _delta: number, time: number): void {
  if (mainAtom) {
    // Gentle rotation
    mainAtom.rotation.y += 0.003;
    mainAtom.rotation.x = Math.sin(time * 0.1) * 0.1;
  }

  // Animate electrons
  electronOrbits.forEach((orbit, index) => {
    orbit.angle += orbit.speed * 0.016;
    if (orbit.electron) {
      orbit.electron.position.x = Math.cos(orbit.angle) * orbit.radius;
      orbit.electron.position.z = Math.sin(orbit.angle) * orbit.radius;
    }
  });

  // Gentle pulse on nucleus
  if (mainAtom) {
    const nucleus = mainAtom.getChildren()[0] as any;
    if (nucleus && nucleus.material) {
      const currentIndex = Math.floor(time * 2) % 3;
      const pulseFactor = 0.7 + (currentIndex + 1) * 0.1;
      nucleus.material.emissiveColor = nucleus.material.emissiveColor.scale(pulseFactor);
    }
  }
}