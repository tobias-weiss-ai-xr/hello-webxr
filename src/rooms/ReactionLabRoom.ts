import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4, Vector3 } from '@babylonjs/core/Maths/math.js';

function c4(c: Color3, a: number = 1): Color4 { return new Color4(c.r, c.g, c.b, a); }
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';
import { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import { AdvancedDynamicTexture, TextBlock, Rectangle, StackPanel } from '@babylonjs/gui/2D/index.js';
import { buildRoom } from './RoomBuilder.js';

import type { AppContext } from '../types/index.js';
import { ELEMENTS } from '../data/elements.js';

export const ROOM_REACTION_LAB = 119;

interface Reaction {
  equation: string;
  description: string;
  reactants: string[];
  color: Color3;
  particleType: 'fire' | 'bubbles' | 'glow' | 'sparkle' | 'smoke';
  intensity: number;
}

const REACTIONS: Reaction[] = [
  { equation: '2Na + 2H₂O → 2NaOH + H₂↑', description: 'Sodium reacts violently with water', reactants: ['Na', 'H'], color: new Color3(1, 0.6, 0), particleType: 'fire', intensity: 1.0 },
  { equation: '2H₂ + O₂ → 2H₂O', description: 'Hydrogen burns in oxygen', reactants: ['H', 'O'], color: new Color3(0.3, 0.6, 1), particleType: 'fire', intensity: 0.8 },
  { equation: '4Fe + 3O₂ → 2Fe₂O₃', description: 'Iron rusts in oxygen', reactants: ['Fe', 'O'], color: new Color3(0.6, 0.3, 0.1), particleType: 'glow', intensity: 0.4 },
  { equation: 'C + O₂ → CO₂', description: 'Carbon burns in oxygen', reactants: ['C', 'O'], color: new Color3(0.3, 0.3, 0.3), particleType: 'smoke', intensity: 0.7 },
  { equation: '2Mg + O₂ → 2MgO', description: 'Magnesium burns with brilliant white flame', reactants: ['Mg', 'O'], color: new Color3(1, 1, 1), particleType: 'sparkle', intensity: 0.9 },
  { equation: 'Cu + 2H₂SO₄ → CuSO₄ + SO₂↑ + 2H₂O', description: 'Copper dissolves in acid', reactants: ['Cu', 'S'], color: new Color3(0, 0.4, 0.8), particleType: 'bubbles', intensity: 0.5 },
  { equation: '2Al + 3Cl₂ → 2AlCl₃', description: 'Aluminum reacts with chlorine', reactants: ['Al', 'Cl'], color: new Color3(0.2, 0.8, 0.2), particleType: 'glow', intensity: 0.6 },
  { equation: 'Ca + 2H₂O → Ca(OH)₂ + H₂↑', description: 'Calcium reacts with water', reactants: ['Ca', 'H'], color: new Color3(0.8, 0.5, 0.2), particleType: 'bubbles', intensity: 0.7 },
  { equation: '2K + 2H₂O → 2KOH + H₂↑', description: 'Potassium reacts explosively with water', reactants: ['K', 'H'], color: new Color3(0.6, 0.2, 0.8), particleType: 'fire', intensity: 1.0 },
  { equation: 'Zn + 2HCl → ZnCl₂ + H₂↑', description: 'Zinc dissolves in hydrochloric acid', reactants: ['Zn', 'Cl'], color: new Color3(0.5, 0.5, 0.7), particleType: 'bubbles', intensity: 0.5 },
  { equation: '2Na + Cl₂ → 2NaCl', description: 'Sodium and chlorine form table salt', reactants: ['Na', 'Cl'], color: new Color3(0.9, 0.9, 0.9), particleType: 'sparkle', intensity: 0.3 },
  { equation: 'S + O₂ → SO₂', description: 'Sulfur burns with blue flame', reactants: ['S', 'O'], color: new Color3(0.2, 0.4, 0.6), particleType: 'smoke', intensity: 0.6 },
];

const WORKBENCH_COLOR = new Color3(0.25, 0.22, 0.18);
const SLOT_EMPTY_COLOR = new Color3(0.3, 0.3, 0.32);
const SLOT_FILLED_COLOR = new Color3(0.4, 0.5, 0.4);

let workbenchRoot: TransformNode | null = null;
let elementSlots: { mesh: any; symbol: string | null; index: number }[] = [];
let slotLabels: TextBlock[] = [];
let reactionLabel: TextBlock | null = null;
let actionLabel: TextBlock | null = null;
let resetBtn: Rectangle | null = null;
let particleSystems: ParticleSystem[] = [];
let activeReaction: Reaction | null = null;
let elementUI: AdvancedDynamicTexture | null = null;
let slotButtons: { bg: Rectangle; label: TextBlock; index: number }[] = [];
let slotSelector: StackPanel | null = null;
let selectedSlot: number = 0;
let elementPicker: StackPanel | null = null;

function getElementColor(symbol: string): Color3 {
  const el = ELEMENTS.find(e => e.symbol === symbol);
  if (!el) return new Color3(0.5, 0.5, 0.5);
  return typeof el.color === 'number'
    ? Color3.FromInts((el.color >> 16) & 0xff, (el.color >> 8) & 0xff, el.color & 0xff)
    : new Color3(0.5, 0.5, 0.5);
}

function findReaction(symbols: string[]): Reaction | null {
  for (const reaction of REACTIONS) {
    const matches = reaction.reactants.every(r => symbols.includes(r));
    if (matches && reaction.reactants.length === symbols.filter(s => s !== null).length) {
      return reaction;
    }
  }
  return null;
}

function spawnParticles(scene: any, origin: Vector3, type: Reaction['particleType'], color: Color3, intensity: number): void {
  const particleCount = Math.floor(50 * intensity);

  const particleSystem = new ParticleSystem(`reaction_${Date.now()}`, particleCount, scene);

  if (type === 'fire') {
    particleSystem.particleTexture = new Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', scene);
    particleSystem.emitter = origin;
    particleSystem.minEmitPower = 0.5;
    particleSystem.maxEmitPower = 2.0;
    particleSystem.minLifeTime = 0.2;
    particleSystem.maxLifeTime = 1.0;
    particleSystem.emitRate = Math.floor(30 * intensity);
    particleSystem.color1 = c4(color);
    particleSystem.color2 = c4(Color3.White());
    particleSystem.colorDead = c4(new Color3(0.2, 0.2, 0.2));
    particleSystem.direction1 = new Vector3(-1, 1, -1);
    particleSystem.direction2 = new Vector3(1, 2, 1);
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.15;
  } else if (type === 'bubbles') {
    particleSystem.particleTexture = new Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', scene);
    particleSystem.emitter = origin;
    particleSystem.minEmitPower = 0.3;
    particleSystem.maxEmitPower = 1.0;
    particleSystem.minLifeTime = 0.5;
    particleSystem.maxLifeTime = 2.0;
    particleSystem.emitRate = Math.floor(20 * intensity);
    particleSystem.color1 = c4(color);
    particleSystem.color2 = c4(Color3.White().scale(0.7));
    particleSystem.colorDead = c4(new Color3(0.5, 0.5, 0.8));
    particleSystem.direction1 = new Vector3(-0.5, 1, -0.5);
    particleSystem.direction2 = new Vector3(0.5, 2, 0.5);
    particleSystem.minSize = 0.03;
    particleSystem.maxSize = 0.1;
  } else if (type === 'glow') {
    particleSystem.particleTexture = new Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', scene);
    particleSystem.emitter = origin;
    particleSystem.minEmitPower = 0.2;
    particleSystem.maxEmitPower = 0.8;
    particleSystem.minLifeTime = 0.5;
    particleSystem.maxLifeTime = 1.5;
    particleSystem.emitRate = Math.floor(15 * intensity);
    particleSystem.color1 = c4(color);
    particleSystem.color2 = c4(color.scale(0.5));
    particleSystem.colorDead = c4(new Color3(0, 0, 0));
    particleSystem.direction1 = new Vector3(-0.3, 0.5, -0.3);
    particleSystem.direction2 = new Vector3(0.3, 1, 0.3);
    particleSystem.minSize = 0.02;
    particleSystem.maxSize = 0.08;
  } else if (type === 'sparkle') {
    particleSystem.particleTexture = new Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', scene);
    particleSystem.emitter = origin;
    particleSystem.minEmitPower = 1.0;
    particleSystem.maxEmitPower = 3.0;
    particleSystem.minLifeTime = 0.1;
    particleSystem.maxLifeTime = 0.5;
    particleSystem.emitRate = Math.floor(40 * intensity);
    particleSystem.color1 = c4(Color3.White());
    particleSystem.color2 = c4(color);
    particleSystem.colorDead = c4(new Color3(0.2, 0.2, 0.2));
    particleSystem.direction1 = new Vector3(-1.5, 1, -1.5);
    particleSystem.direction2 = new Vector3(1.5, 3, 1.5);
    particleSystem.minSize = 0.02;
    particleSystem.maxSize = 0.06;
  } else {
    particleSystem.particleTexture = new Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', scene);
    particleSystem.emitter = origin;
    particleSystem.minEmitPower = 0.2;
    particleSystem.maxEmitPower = 0.5;
    particleSystem.minLifeTime = 0.5;
    particleSystem.maxLifeTime = 2.0;
    particleSystem.emitRate = Math.floor(10 * intensity);
    particleSystem.color1 = c4(color);
    particleSystem.color2 = c4(new Color3(0.3, 0.3, 0.3));
    particleSystem.colorDead = c4(new Color3(0, 0, 0));
    particleSystem.direction1 = new Vector3(-0.5, 0.2, -0.5);
    particleSystem.direction2 = new Vector3(0.5, 0.8, 0.5);
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.2;
  }

  particleSystem.start();
  particleSystems.push(particleSystem);
}

function updateReactionDisplay(): void {
  const filledSlots = elementSlots.filter(s => s.symbol !== null).map(s => s.symbol as string);

  if (filledSlots.length < 2) {
    if (reactionLabel) reactionLabel.text = `Place 2+ elements (${filledSlots.length}/3 filled)`;
    if (actionLabel) actionLabel.text = 'Select an element slot below, then pick an element';
    activeReaction = null;
    return;
  }

  const reaction = findReaction(filledSlots);
  activeReaction = reaction;

  if (reaction) {
    if (reactionLabel) {
      reactionLabel.text = `⚗ ${reaction.equation}`;
      reactionLabel.color = '#88ff88';
    }
    if (actionLabel) {
      actionLabel.text = reaction.description;
      actionLabel.color = '#cccccc';
    }
  } else {
    if (reactionLabel) {
      reactionLabel.text = 'No reaction between these elements';
      reactionLabel.color = '#ff8888';
    }
    if (actionLabel) {
      actionLabel.text = 'Try different combinations!';
      actionLabel.color = '#888888';
    }
  }
}

function triggerReaction(scene: any): void {
  if (!activeReaction) return;

  const origin = new Vector3(0, 2.2, 0);
  spawnParticles(scene, origin, activeReaction.particleType, activeReaction.color, activeReaction.intensity);

  if (workbenchRoot) {
    const child = workbenchRoot.getChildren()[0] as any;
    if (child && child.material) {
      const origColor = child.material.diffuseColor.clone();
      child.material.diffuseColor = activeReaction.color;
      child.material.emissiveColor = activeReaction.color.scale(0.5);
      setTimeout(() => {
        if (child.material) {
          child.material.diffuseColor = origColor;
          child.material.emissiveColor = Color3.Black();
        }
      }, 500);
    }
  }

  if (reactionLabel) {
    reactionLabel.color = '#ffffff';
    setTimeout(() => {
      if (reactionLabel && activeReaction) {
        reactionLabel.color = '#88ff88';
      }
    }, 1000);
  }
}

function buildElementPicker(scene: any, ui: AdvancedDynamicTexture): void {
  elementPicker = new StackPanel('elementPicker');
  elementPicker.isVisible = false;
  elementPicker.verticalAlignment = 1;
  elementPicker.horizontalAlignment = 0;
  elementPicker.left = '20px';
  elementPicker.top = '-20px';
  elementPicker.width = '200px';
  elementPicker.height = '400px';
  elementPicker.background = '#222233';
  elementPicker.alpha = 0.95;
  ui.addControl(elementPicker);

  const titleCtrl = new TextBlock('pickerTitle', 'Pick Element');
  titleCtrl.color = '#aabbcc';
  titleCtrl.fontSize = 14;
  titleCtrl.fontWeight = 'bold';
  titleCtrl.height = '30px';
  titleCtrl.paddingTop = '8px';
  elementPicker.addControl(titleCtrl);

  const categories = ['H', 'C', 'O', 'Na', 'Mg', 'Al', 'S', 'Cl', 'K', 'Ca', 'Fe', 'Cu', 'Zn', 'Au', 'Ag'];
  categories.forEach(symbol => {
    const el = ELEMENTS.find(e => e.symbol === symbol);
    if (!el) return;
    const btn = new Rectangle(`el_${symbol}`);
    btn.height = '28px';
    btn.width = '180px';
    btn.thickness = 1;
    btn.color = '#334455';
    btn.background = '#1a1a2e';
    btn.cornerRadius = 4;

    const lbl = new TextBlock(`elLbl_${symbol}`, `${symbol} - ${el.name}`);
    lbl.color = '#ccddee';
    lbl.fontSize = 11;
    lbl.fontWeight = 'bold';
    lbl.paddingLeft = '8px';
    btn.addControl(lbl);

    btn.onPointerDownObservable.add(() => {
      const slot = elementSlots[selectedSlot];
      if (slot) {
        slot.symbol = symbol;
        if (slot.mesh.material) {
          slot.mesh.material.diffuseColor = getElementColor(symbol);
          slot.mesh.material.emissiveColor = getElementColor(symbol).scale(0.3);
        }
        if (slotLabels[selectedSlot]) {
          slotLabels[selectedSlot].text = symbol;
        }
      }
      if (elementPicker) elementPicker.isVisible = false;
      updateReactionDisplay();
    });

    elementPicker!.addControl(btn);
  });
}

function buildSlotSelector(ui: AdvancedDynamicTexture): void {
  const panel = new StackPanel('slotSelector');
  panel.verticalAlignment = 0;
  panel.horizontalAlignment = 0;
  panel.left = '20px';
  panel.top = '20px';
  panel.width = '180px';
  panel.height = '150px';
  panel.background = '#1a1a2e';
  panel.alpha = 0.9;
  ui.addControl(panel);
  slotSelector = panel;

  const titleCtrl = new TextBlock('slotTitle', 'Element Slots');
  titleCtrl.color = '#8899aa';
  titleCtrl.fontSize = 12;
  titleCtrl.fontWeight = 'bold';
  titleCtrl.height = '24px';
  titleCtrl.paddingTop = '6px';
  panel.addControl(titleCtrl);

  for (let i = 0; i < 3; i++) {
    const row = new Rectangle(`slotRow_${i}`);
    row.height = '32px';
    row.width = '160px';
    row.thickness = 2;
    row.color = selectedSlot === i ? '#4a90e2' : '#334455';
    row.background = elementSlots[i]?.symbol ? '#223322' : '#1a1a2e';
    row.cornerRadius = 4;

    const lbl = new TextBlock(`slotLbl_${i}`, elementSlots[i]?.symbol || `Slot ${i + 1} (empty)`);
    lbl.color = elementSlots[i]?.symbol ? '#88dd88' : '#667788';
    lbl.fontSize = 11;
    lbl.fontWeight = 'bold';
    lbl.paddingLeft = '8px';
    row.addControl(lbl);

    row.onPointerDownObservable.add(() => {
      selectedSlot = i;
        panel.children.forEach((child: any, idx: number) => {
        if (idx > 0) {
          child.color = (idx - 1) === selectedSlot ? '#4a90e2' : '#334455';
        }
      });
      if (elementPicker) {
        elementPicker.isVisible = true;
      }
    });

    panel.addControl(row);
    slotButtons.push({ bg: row, label: lbl, index: i });
  }
}

export function setup(ctx: AppContext, _param?: string): void {
  const scene = ctx.scene;

  scene.clearColor = new Color4(0.08, 0.08, 0.12, 1);

  elementUI = AdvancedDynamicTexture.CreateFullscreenUI('reactionLabUI');

  const room = buildRoom(scene, {
    dimensions: { width: 16, height: 4, depth: 12 },
    floorColor: new Color3(0.15, 0.13, 0.10),
    wallColor: new Color3(0.12, 0.12, 0.14),
    ceilingColor: new Color3(0.06, 0.06, 0.08),
    ambientColor: new Color3(0.2, 0.2, 0.25),
    pointLightColor: new Color3(0.95, 0.92, 0.85),
    doorways: [{ wall: 'south', offset: 0 }],
  });

  ctx.setFloorMesh?.(room.floor);

  workbenchRoot = new TransformNode('workbenchRoot', scene);
  workbenchRoot.position = new Vector3(0, 1.5, 0);

  const benchMat = new StandardMaterial('benchMat', scene);
  benchMat.diffuseColor = WORKBENCH_COLOR;
  benchMat.specularColor = new Color3(0.1, 0.1, 0.08);

  const tableTop = MeshBuilder.CreateBox('tableTop', { width: 4, height: 0.15, depth: 2 }, scene);
  tableTop.material = benchMat;
  tableTop.parent = workbenchRoot;

  const legMat = new StandardMaterial('legMat', scene);
  legMat.diffuseColor = new Color3(0.18, 0.16, 0.14);

  for (let i = 0; i < 4; i++) {
    const xOff = i < 2 ? -1.8 : 1.8;
    const zOff = i % 2 === 0 ? -0.8 : 0.8;
    const leg = MeshBuilder.CreateBox(`leg_${i}`, { width: 0.1, height: 1.5, depth: 0.1 }, scene);
    leg.material = legMat;
    leg.position = new Vector3(xOff, -0.75, zOff);
    leg.parent = workbenchRoot;
  }

  const slotPositions = [-1.2, 0, 1.2];
  for (let i = 0; i < 3; i++) {
    const slotMat = new StandardMaterial(`slotMat_${i}`, scene);
    slotMat.diffuseColor = SLOT_EMPTY_COLOR;
    slotMat.emissiveColor = new Color3(0.15, 0.15, 0.18);
    slotMat.alpha = 0.8;

    const slot = MeshBuilder.CreateCylinder(`slot_${i}`, { height: 0.08, diameter: 0.6, tessellation: 32 }, scene);
    slot.material = slotMat;
    slot.position = new Vector3(slotPositions[i], 0.1, 0);
    slot.parent = workbenchRoot;
    ctx.trackMesh(slot);

    elementSlots.push({ mesh: slot, symbol: null, index: i });

    const slotLabel = new TextBlock(`slotLabel_${i}`, '');
    slotLabel.color = '#8899aa';
    slotLabel.fontSize = 14;
    slotLabel.fontWeight = 'bold';
    elementUI?.addControl(slotLabel);
    slotLabel.linkWithMesh(slot);
    slotLabel.linkOffsetY = 30;
    slotLabels.push(slotLabel);
  }

  reactionLabel = new TextBlock('reactionLabel', 'Place 2+ elements to see reactions');
  reactionLabel.color = '#8899aa';
  reactionLabel.fontSize = 18;
  reactionLabel.fontWeight = 'bold';
  reactionLabel.top = '-120px';
  elementUI?.addControl(reactionLabel);

  actionLabel = new TextBlock('actionLabel', 'Select an element slot below, then pick an element');
  actionLabel.color = '#667788';
  actionLabel.fontSize = 12;
  actionLabel.top = '-80px';
  elementUI?.addControl(actionLabel);

  const reactBtn = new Rectangle('reactBtn');
  reactBtn.width = '200px';
  reactBtn.height = '40px';
  reactBtn.cornerRadius = 6;
  reactBtn.color = '#44aa44';
  reactBtn.thickness = 0;
  reactBtn.background = '#2d5a2d';
  reactBtn.alpha = 0.9;
  reactBtn.top = '-40px';

  const reactText = new TextBlock('reactText', '⚡ REACT!');
  reactText.color = 'white';
  reactText.fontSize = 16;
  reactText.fontWeight = 'bold';
  reactText.top = '10px';
  reactBtn.addControl(reactText);
  elementUI?.addControl(reactBtn);

  reactBtn.onPointerDownObservable.add(() => {
    triggerReaction(scene);
  });

  resetBtn = new Rectangle('resetBtn');
  resetBtn.width = '160px';
  resetBtn.height = '36px';
  resetBtn.cornerRadius = 6;
  resetBtn.color = '#aa4444';
  resetBtn.thickness = 0;
  resetBtn.background = '#4a2222';
  resetBtn.alpha = 0.9;
  resetBtn.verticalAlignment = 1;
  resetBtn.horizontalAlignment = 0;
  resetBtn.left = '20px';
  resetBtn.top = '-80px';

  const resetText = new TextBlock('resetText', '↺ Reset');
  resetText.color = 'white';
  resetText.fontSize = 14;
  resetText.fontWeight = 'bold';
  resetText.top = '8px';
  resetBtn.addControl(resetText);
  elementUI?.addControl(resetBtn);

  resetBtn.onPointerDownObservable.add(() => {
    elementSlots.forEach((slot, i) => {
      slot.symbol = null;
      if (slot.mesh.material) {
        slot.mesh.material.diffuseColor = SLOT_EMPTY_COLOR;
        slot.mesh.material.emissiveColor = new Color3(0.15, 0.15, 0.18);
      }
      if (slotLabels[i]) slotLabels[i].text = '';
    });
    if (reactionLabel) {
      reactionLabel.text = 'Place 2+ elements to see reactions';
      reactionLabel.color = '#8899aa';
    }
    if (actionLabel) {
      actionLabel.text = 'Select an element slot below, then pick an element';
      actionLabel.color = '#667788';
    }
    activeReaction = null;
  });

  const instrLabel = new TextBlock('instrLabel', 'Place elements in slots and press REACT!');
  instrLabel.color = '#556677';
  instrLabel.fontSize = 11;
  instrLabel.verticalAlignment = 1;
  instrLabel.top = '-20px';
  elementUI?.addControl(instrLabel);

  buildSlotSelector(elementUI);
  buildElementPicker(scene, elementUI);

  const exitLabel = new TextBlock('exitLabel', '← EXIT to Lobby');
  exitLabel.color = '#667788';
  exitLabel.fontSize = 14;
  exitLabel.verticalAlignment = 1;
  exitLabel.horizontalAlignment = 0;
  exitLabel.left = '20px';
  exitLabel.top = '-180px';
  elementUI?.addControl(exitLabel);
}

export function enter(ctx: AppContext, _param?: string): void {
  if (reactionLabel) reactionLabel.isVisible = true;
  if (actionLabel) actionLabel.isVisible = true;
  if (resetBtn) resetBtn.isVisible = true;
  if (slotSelector) slotSelector.isVisible = true;
  if (elementPicker) elementPicker.isVisible = false;
}

export function exit(_ctx: AppContext): void {
  if (reactionLabel) reactionLabel.isVisible = false;
  if (actionLabel) actionLabel.isVisible = false;
  if (resetBtn) resetBtn.isVisible = false;
  if (slotSelector) slotSelector.isVisible = false;
  if (elementPicker) elementPicker.isVisible = false;

  particleSystems.forEach(ps => {
    ps.stop();
    ps.dispose();
  });
  particleSystems = [];

  elementSlots = [];
  slotLabels = [];
  slotButtons = [];
  activeReaction = null;
  workbenchRoot = null;
}

export function execute(_ctx: AppContext, _delta: number, _time: number): void {
  if (workbenchRoot) {
    workbenchRoot.rotation.y += 0.002;
  }
}
