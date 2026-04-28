import type { AppContext, ElementData } from '../types/index.js';
import { ELEMENTS } from '../data/elements.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4, Vector3 } from '@babylonjs/core/Maths/math.js';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui/2D/index.js';
import { AbstractMesh, TransformNode } from '@babylonjs/core/index.js';
import { buildRoom, type RoomBuildOptions } from './RoomBuilder.js';
import { ExhibitBuilder, type ExhibitArtifacts } from '../lib/ExhibitBuilder.js';

const FEATURED_ELEMENTS: ElementData[] = [
  ELEMENTS.find(e => e.symbol === 'H')!,
  ELEMENTS.find(e => e.symbol === 'C')!,
  ELEMENTS.find(e => e.symbol === 'O')!,
  ELEMENTS.find(e => e.symbol === 'Fe')!,
  ELEMENTS.find(e => e.symbol === 'Au')!,
  ELEMENTS.find(e => e.symbol === 'U')!,
];

const ARTIFACTS: Record<string, ExhibitArtifacts> = {
  H: { description: 'Fuel cell, water molecule model, star icon' },
  C: { description: 'Diamond model, DNA strand graphic, fossil fuel barrel' },
  O: { description: 'Oxygen mask, water droplet, rusted iron' },
  Fe: { description: 'Steel beam model, horseshoe magnet, rust sample' },
  Au: { description: 'Gold coin, jewelry ring, computer memory chip' },
  U: { description: 'Nuclear reactor model, Geiger counter, fossil icon' },
};

const EXHIBIT_POSITIONS: Vector3[] = [
  new Vector3(-4, 0, -3),
  new Vector3(-2, 0, -4.5),
  new Vector3(0, 0, -5),
  new Vector3(2, 0, -4.5),
  new Vector3(4, 0, -3),
  new Vector3(0, 0, -2),
];

let periodicTableGroup: TransformNode | null = null;
let uiTexture: AdvancedDynamicTexture | null = null;
let exhibits: AbstractMesh[] = [];
let atomGroups: TransformNode[] = [];
let exploreButtons: AbstractMesh[] = [];

export function setup(ctx: AppContext): void {
  const scene = ctx.scene;

  scene.clearColor = new Color4(0.05, 0.05, 0.08, 1);

  uiTexture = AdvancedDynamicTexture.CreateFullscreenUI('landingRoomUI', true, scene);

  const room = buildRoom(scene, {
    dimensions: { width: 20, height: 4.5, depth: 18 },
    floorColor: new Color3(0.15, 0.17, 0.20),
    wallColor: new Color3(0.2, 0.22, 0.26),
    ceilingColor: new Color3(0.12, 0.12, 0.14),
    ambientColor: new Color3(0.35, 0.36, 0.40),
    pointLightColor: new Color3(0.98, 0.95, 0.88),
    doorways: [
      { wall: 'north', offset: -4 },
      { wall: 'north', offset: 4 },
      { wall: 'south', offset: 0 },
    ],
  });

  ctx.setFloorMesh?.(room.floor);

  createPeriodicTableHologram(ctx);

  const exhibitBuilder = new ExhibitBuilder(scene, ctx, uiTexture);
  FEATURED_ELEMENTS.forEach((element, index) => {
    const position = EXHIBIT_POSITIONS[index];
    const { base, glassCase, atomGroup, artifacts, exploreButton } = exhibitBuilder.buildExhibit({
      position,
      element,
      artifacts: ARTIFACTS[element.symbol]!,
      onExplore: () => {
        const elementIndex = ELEMENTS.indexOf(element);
        ctx.goto = elementIndex + 1;
      }
    });

    exhibits.push(base, glassCase, ...artifacts, exploreButton);
    atomGroups.push(atomGroup);
    exploreButtons.push(exploreButton);
  });

  ctx.room = 0;
}

function createPeriodicTableHologram(ctx: AppContext): void {
  const scene = ctx.scene;
  periodicTableGroup = new TransformNode('periodicTableHologram', scene);
  ctx.trackNode(periodicTableGroup);

  const width = 6;
  const height = 3.5;
  const cols = 18;
  const rows = 7;

  const cellWidth = width / cols;
  const cellHeight = height / rows;

  const hologramMat = new StandardMaterial('hologramMat', scene);
  hologramMat.diffuseColor = new Color3(0.3, 0.4, 0.5);
  hologramMat.emissiveColor = new Color3(0.2, 0.3, 0.4);
  hologramMat.alpha = 0.25;
  hologramMat.disableLighting = true;
  hologramMat.backFaceCulling = false;

  FEATURED_ELEMENTS.forEach(element => {
    if (element.groupNumber && element.period) {
      const cell = MeshBuilder.CreateBox(`holoCell_${element.symbol}`, {
        width: cellWidth * 0.8,
        height: cellHeight * 0.8,
        depth: 0.02
      }, scene);
      cell.material = hologramMat;
      cell.parent = periodicTableGroup;

      const x = (element.groupNumber - 9) * cellWidth;
      const y = (4 - element.period) * cellHeight;
      cell.position.set(x * 0.6, y * 0.6, -2);
    }
  });

  periodicTableGroup.position.set(0, 2.5, 0);
}

export function enter(ctx: AppContext): void {
  exhibits.forEach(e => e.isVisible = true);
  atomGroups.forEach(g => g.isEnabled(true));
  exploreButtons.forEach(b => b.isVisible = true);
  if (periodicTableGroup) periodicTableGroup.setEnabled(true);
}

export function exit(_ctx: AppContext): void {
  exhibits.forEach(e => {
    e.isVisible = false;
    if (e.actionManager) {
      e.actionManager.dispose();
      e.actionManager = null;
    }
  });
  exploreButtons.forEach(b => {
    b.isVisible = false;
    if (b.actionManager) {
      b.actionManager.dispose();
      b.actionManager = null;
    }
  });
  atomGroups.forEach(g => g.setEnabled(false));
  if (periodicTableGroup) periodicTableGroup.setEnabled(false);
}

export function execute(_ctx: AppContext, _delta: number, time: number): void {
  if (periodicTableGroup) {
    periodicTableGroup.rotation.y = Math.sin(time * 0.2) * 0.1;
    periodicTableGroup.position.y = 2.5 + Math.sin(time * 0.3) * 0.1;
  }

  atomGroups.forEach(atomGroup => {
    atomGroup.rotation.y += 0.01;
    const electrons = atomGroup.getChildren().filter(m => m.name?.startsWith('electron_'));
    electrons.forEach((electron: any) => {
      if (electron.metadata) {
        const { angle, orbitRadius, speed } = electron.metadata;
        electron.metadata.angle += speed * 0.016;
        electron.position.x = Math.cos(electron.metadata.angle) * orbitRadius;
        electron.position.z = Math.sin(electron.metadata.angle) * orbitRadius;
      }
    });
  });
}