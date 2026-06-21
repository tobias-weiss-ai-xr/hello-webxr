/**
 * OrbitalEffects - Quantum orbital visualization helpers for Babylon.js
 *
 * Creates visual representations of:
 * - s-orbitals: spherical glow
 * - p-orbitals: dumbbell-shaped lobes
 * - d-orbitals: clover-shaped lobes
 *
 * Uses only MeshBuilder and StandardMaterial (no shaders needed).
 */

import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math.js';
import type { Scene } from '@babylonjs/core/scene.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';

export type OrbitalType = '1s' | '2s' | '2p' | '3s' | '3p' | '3d' | '4s' | '4p' | '4d' | '4f';

export interface OrbitalConfig {
  /** Principal quantum number n */
  n: number;
  /** Orbital letter */
  letter: 's' | 'p' | 'd' | 'f';
  /** Number of electrons in this orbital (max 2 per sub-orbital) */
  electronCount: number;
  /** Color */
  color: Color3;
  /** Position offset from atom center */
  offset: Vector3;
}

// Aufbau filling order: (n+l) rule
export const AUFBAU_ORDER: { orbital: string; n: number; l: number; capacity: number }[] = [
  { orbital: '1s', n: 1, l: 0, capacity: 2 },
  { orbital: '2s', n: 2, l: 0, capacity: 2 },
  { orbital: '2p', n: 2, l: 1, capacity: 6 },
  { orbital: '3s', n: 3, l: 0, capacity: 2 },
  { orbital: '3p', n: 3, l: 1, capacity: 6 },
  { orbital: '4s', n: 4, l: 0, capacity: 2 },
  { orbital: '3d', n: 3, l: 2, capacity: 10 },
  { orbital: '4p', n: 4, l: 1, capacity: 6 },
  { orbital: '5s', n: 5, l: 0, capacity: 2 },
  { orbital: '4d', n: 4, l: 2, capacity: 10 },
  { orbital: '5p', n: 5, l: 1, capacity: 6 },
  { orbital: '6s', n: 6, l: 0, capacity: 2 },
  { orbital: '4f', n: 4, l: 3, capacity: 14 },
  { orbital: '5d', n: 5, l: 2, capacity: 10 },
  { orbital: '6p', n: 6, l: 1, capacity: 6 },
  { orbital: '7s', n: 7, l: 0, capacity: 2 },
  { orbital: '5f', n: 5, l: 3, capacity: 14 },
  { orbital: '6d', n: 6, l: 2, capacity: 10 },
  { orbital: '7p', n: 7, l: 1, capacity: 6 },
];

/**
 * Get the electron configuration in Aufbau order for a given atomic number.
 * Returns { orbital, electronCount }[] for occupied orbitals.
 */
export function getAufbauConfiguration(atomicNumber: number): { orbital: string; electronCount: number }[] {
  let remaining = atomicNumber;
  const config: { orbital: string; electronCount: number }[] = [];

  for (const level of AUFBAU_ORDER) {
    if (remaining <= 0) break;
    const electrons = Math.min(remaining, level.capacity);
    config.push({ orbital: level.orbital, electronCount: electrons });
    remaining -= electrons;
  }

  return config;
}

/**
 * Create an s-orbital visualization (spherical glow)
 */
export function createSOrbital(
  scene: Scene,
  parent: TransformNode,
  color: Color3,
  radius: number,
  name: string
): import('@babylonjs/core').AbstractMesh {
  const glowMat = new StandardMaterial(`${name}_mat`, scene);
  glowMat.diffuseColor = color;
  glowMat.emissiveColor = color.scale(0.6);
  glowMat.alpha = 0.15;
  glowMat.backFaceCulling = false;
  glowMat.disableLighting = true;

  const sphere = MeshBuilder.CreateSphere(name, { diameter: radius * 2, segments: 32 }, scene);
  sphere.material = glowMat;
  sphere.parent = parent;
  return sphere;
}

/**
 * Create a p-orbital visualization (dumbbell shape with two lobes)
 */
export function createEllipsoidSphere(scene: Scene, name: string, sx: number, sy: number, sz: number): import('@babylonjs/core').Mesh {
  const s = MeshBuilder.CreateSphere(name, { diameter: 1, segments: 16 }, scene);
  s.scaling.set(sx, sy, sz);
  return s;
}

export function createPOrbital(
  scene: Scene,
  parent: TransformNode,
  color: Color3,
  radius: number,
  name: string,
  axis: 'x' | 'y' | 'z' = 'y'
): { lobeA: import('@babylonjs/core').AbstractMesh; lobeB: import('@babylonjs/core').AbstractMesh } {
  const lobeMat = new StandardMaterial(`${name}_mat`, scene);
  lobeMat.diffuseColor = color;
  lobeMat.emissiveColor = color.scale(0.5);
  lobeMat.alpha = 0.12;
  lobeMat.backFaceCulling = false;
  lobeMat.disableLighting = true;

  const lobeSize = radius * 0.6;
  const lobeOffset = radius * 0.5;

  const lobeA = createEllipsoidSphere(scene, `${name}_lobeA`, lobeSize, lobeSize * 1.8, lobeSize);
  lobeA.material = lobeMat;

  const lobeB = createEllipsoidSphere(scene, `${name}_lobeB`, lobeSize, lobeSize * 1.8, lobeSize);
  lobeB.material = lobeMat;

  if (axis === 'y') {
    lobeA.position.y = lobeOffset;
    lobeB.position.y = -lobeOffset;
  } else if (axis === 'x') {
    lobeA.position.x = lobeOffset;
    lobeB.position.x = -lobeOffset;
  } else {
    lobeA.position.z = lobeOffset;
    lobeB.position.z = -lobeOffset;
  }

  lobeA.parent = parent;
  lobeB.parent = parent;

  const connectMat = new StandardMaterial(`${name}_connect`, scene);
  connectMat.diffuseColor = color;
  connectMat.emissiveColor = color.scale(0.3);
  connectMat.alpha = 0.06;
  connectMat.backFaceCulling = false;
  connectMat.disableLighting = true;

  const connector = MeshBuilder.CreateCylinder(`${name}_conn`, {
    height: lobeOffset * 1.6,
    diameter: lobeSize * 0.15,
    tessellation: 12,
  }, scene);
  connector.material = connectMat;
  connector.parent = parent;

  return { lobeA, lobeB };
}

/**
 * Create a d-orbital visualization (clover shape - 4 lobes)
 */
export function createDOrbital(
  scene: Scene,
  parent: TransformNode,
  color: Color3,
  radius: number,
  name: string
): import('@babylonjs/core').AbstractMesh[] {
  const lobeMat = new StandardMaterial(`${name}_mat`, scene);
  lobeMat.diffuseColor = color;
  lobeMat.emissiveColor = color.scale(0.4);
  lobeMat.alpha = 0.1;
  lobeMat.backFaceCulling = false;
  lobeMat.disableLighting = true;

  const lobes: import('@babylonjs/core').AbstractMesh[] = [];
  const lobeSize = radius * 0.45;
  const lobeOffset = radius * 0.45;

  const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  for (let i = 0; i < 4; i++) {
    const lobe = createEllipsoidSphere(scene, `${name}_lobe${i}`, lobeSize * 1.2, lobeSize * 0.6, lobeSize * 0.6);
    lobe.material = lobeMat;
    lobe.position.x = Math.cos(angles[i]) * lobeOffset;
    lobe.position.z = Math.sin(angles[i]) * lobeOffset;
    lobe.rotation.y = angles[i];
    lobe.parent = parent;
    lobes.push(lobe);
  }

  return lobes;
}

/**
 * Create an f-orbital visualization (complex multi-lobe shape - simplified as ring cluster)
 */
export function createFOrbital(
  scene: Scene,
  parent: TransformNode,
  color: Color3,
  radius: number,
  name: string
): import('@babylonjs/core').AbstractMesh[] {
  const lobeMat = new StandardMaterial(`${name}_mat`, scene);
  lobeMat.diffuseColor = color;
  lobeMat.emissiveColor = color.scale(0.3);
  lobeMat.alpha = 0.08;
  lobeMat.backFaceCulling = false;
  lobeMat.disableLighting = true;

  const lobes: import('@babylonjs/core').AbstractMesh[] = [];

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const lobe = createEllipsoidSphere(scene, `${name}_lobe${i}`, radius * 0.35, radius * 0.2, radius * 0.2);
    lobe.material = lobeMat;
    lobe.position.x = Math.cos(angle) * radius * 0.5;
    lobe.position.z = Math.sin(angle) * radius * 0.5;
    lobe.rotation.y = angle;
    lobe.parent = parent;
    lobes.push(lobe);
  }

  return lobes;
}

/**
 * Color palette for orbital visualization by type
 */
export function getOrbitalColor(orbitalType: string): Color3 {
  switch (orbitalType) {
    case '1s': return new Color3(1.0, 0.4, 0.4);   // red
    case '2s': return new Color3(1.0, 0.6, 0.2);   // orange
    case '2p': return new Color3(1.0, 0.8, 0.2);   // yellow
    case '3s': return new Color3(0.4, 1.0, 0.4);   // green
    case '3p': return new Color3(0.2, 0.8, 1.0);   // cyan
    case '3d': return new Color3(0.4, 0.4, 1.0);   // blue
    case '4s': return new Color3(0.8, 0.4, 1.0);   // purple
    case '4p': return new Color3(1.0, 0.4, 0.8);   // pink
    case '4d': return new Color3(0.6, 0.8, 1.0);   // light blue
    case '4f': return new Color3(1.0, 0.6, 0.6);   // light red
    default:   return new Color3(0.5, 0.5, 0.5);   // grey
  }
}

/**
 * Calculate the radial distance from nucleus for a given orbital
 */
export function getOrbitalRadius(n: number, letter: string): number {
  const baseRadius = 0.7;
  const nOffset = (n - 1) * 0.35;
  const letterOffset = letter === 's' ? 0 : letter === 'p' ? 0.1 : letter === 'd' ? 0.2 : 0.3;
  return baseRadius + nOffset + letterOffset;
}
