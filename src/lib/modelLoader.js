import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { NOBLE_GAS_COLORS } from '../data/elements.js';

const loaders = {
  gltf: new GLTFLoader(),
  draco: new DRACOLoader()
};

export function loadModel(modelPath, callback) {
  const extension = modelPath.split('.').pop().toLowerCase();

  switch(extension) {
    case 'gltf':
    loaders.gltf.load(
      modelPath,
      (gltf) => {
        callback(gltf.scene, null, null);
      },
      (error) => {
        console.error('Error loading GLTF model:', error);
        callback(null, error, null);
      }
    );
      break;
    case 'glb':
      loaders.gltf.load(
        modelPath,
        (gltf) => {
          callback(gltf.scene, null, null);
        },
        (error) => {
          console.error('Error loading GLB model:', error);
          callback(null, error, null);
        }
      );
      break;
    default:
      console.warn('Unknown model format:', extension);
      callback(null, new Error('Unknown model format'), null);
  }
}

export function createPlaceholderModel(element) {
  const group = new THREE.Group();
  let geo, mat, mesh;

  switch(element.symbol) {
    case 'H':
      geo = new THREE.SphereGeometry(0.3, 32, 32);
      mat = new THREE.MeshStandardMaterial({color: element.color, metalness: 0.1, roughness: 0.8});
      mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, 0);
      group.add(mesh);
      break;

    case 'C':
      geo = new THREE.OctahedronGeometry(0.3, 1);
      mat = new THREE.MeshStandardMaterial({color: 0x333333, metalness: 0.2, roughness: 0.6});
      mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, 0);
      group.add(mesh);
      break;

    case 'Fe':
      geo = new THREE.IcosahedronGeometry(0.3, 1);
      mat = new THREE.MeshStandardMaterial({color: 0x4a4a4a, metalness: 0.8, roughness: 0.3});
      mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, 0);
      group.add(mesh);
      break;

    case 'Au':
      geo = new THREE.IcosahedronGeometry(0.3, 1);
      mat = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xFFD700,
        emissiveIntensity: 0.1
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, 0);
      group.add(mesh);
      break;

    case 'U':
      geo = new THREE.SphereGeometry(0.35, 32, 32);
      mat = new THREE.MeshStandardMaterial({
        color: 0x2d5a2d,
        metalness: 0.7,
        roughness: 0.4,
        emissive: 0x00ff00,
        emissiveIntensity: 0.2
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, 0);
      group.add(mesh);
      break;

    case 'Na':
      geo = new THREE.SphereGeometry(0.3, 32, 32);
      mat = new THREE.MeshStandardMaterial({
        color: element.color,
        metalness: 0.9,
        roughness: 0.2
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, 0);
      group.add(mesh);
      break;

    case 'He':
      geo = new THREE.SphereGeometry(0.25, 32, 32);
      mat = new THREE.MeshStandardMaterial({
        color: NOBLE_GAS_COLORS[element.symbol] || element.color,
        metalness: 0,
        roughness: 0.1,
        emissive: NOBLE_GAS_COLORS[element.symbol] || element.color,
        emissiveIntensity: 0.15
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, 0);
      group.add(mesh);
      break;

    default:
      geo = new THREE.SphereGeometry(0.3, 32, 32);
      mat = new THREE.MeshStandardMaterial({
        color: element.color,
        metalness: element.group === 'metal' || element.group === 'transition' ? 0.7 : 0.1,
        roughness: element.group === 'metal' || element.group === 'transition' ? 0.3 : 0.7
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, 0);
      group.add(mesh);
  }

  return group;
}

export function createMoleculeModel(formula, elementData) {
  const group = new THREE.Group();
  const atoms = [];

  const parseFormula = (formula) => {
    const elements = [];
    const regex = /([A-Z][a-z]?)(\d*)/g;
    let match;
    while ((match = regex.exec(formula)) !== null) {
      elements.push({
        symbol: match[1],
        count: match[2] ? parseInt(match[2]) : 1
      });
    }
    return elements;
  };

  const parsedFormula = parseFormula(formula);

  const getElementColor = (symbol) => {
    const elemData = elementData && elementData.find(e => e.symbol === symbol);
    return elemData && elemData.color || 0xffffff;
  };

  const atomPositions = [];
  let atomIndex = 0;

  parsedFormula.forEach(item => {
    for (let i = 0; i < item.count; i++) {
      let x, y, z;

      if (parsedFormula.length === 1 && item.count === 1) {
        x = 0; y = 0; z = 0;
      } else if (parsedFormula.length === 2) {
        const angle = atomIndex * Math.PI;
        x = Math.cos(angle) * 0.6;
        y = 0;
        z = Math.sin(angle) * 0.6;
      } else if (parsedFormula.length === 3) {
        x = (atomIndex % 3) - 1;
        y = 0;
        z = Math.floor(atomIndex / 3) * 0.6 - 0.3;
      } else {
        const phi = Math.acos(-1 + (2 * atomIndex) / parsedFormula.reduce((sum, p) => sum + p.count, 0));
        const theta = Math.sqrt(parsedFormula.reduce((sum, p) => sum + p.count, 0) * Math.PI) * phi;
        x = 0.7 * Math.cos(theta) * Math.sin(phi);
        y = 0.7 * Math.sin(theta) * Math.sin(phi);
        z = 0.7 * Math.cos(phi);
      }

      const geo = new THREE.SphereGeometry(0.25, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: getElementColor(item.symbol),
        metalness: 0.3,
        roughness: 0.6
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData.elementSymbol = item.symbol;
      group.add(mesh);
      atomPositions.push({mesh, symbol: item.symbol, pos: new THREE.Vector3(x, y, z)});
      atoms.push(mesh);
      atomIndex++;
    }
  });

  for (let i = 0; i < atomPositions.length; i++) {
    for (let j = i + 1; j < atomPositions.length; j++) {
      const dist = atomPositions[i].pos.distanceTo(atomPositions[j].pos);
      if (dist < 1.2) {
        const bondGeo = new THREE.CylinderGeometry(0.04, 0.04, dist, 8);
        const bondMat = new THREE.MeshStandardMaterial({color: 0x888888, metalness: 0.5, roughness: 0.5});
        const bond = new THREE.Mesh(bondGeo, bondMat);

        const midX = (atomPositions[i].pos.x + atomPositions[j].pos.x) / 2;
        const midY = (atomPositions[i].pos.y + atomPositions[j].pos.y) / 2;
        const midZ = (atomPositions[i].pos.z + atomPositions[j].pos.z) / 2;

        bond.position.set(midX, midY, midZ);
        bond.lookAt(atomPositions[j].pos);
        bond.rotateX(Math.PI / 2);
        group.add(bond);
      }
    }
  }

  return group;
}

export function createCrystalLattice(element) {
  const group = new THREE.Group();
  const gridSize = 3;
  const spacing = 0.8;
  const atomGeo = new THREE.SphereGeometry(0.15, 16, 16);
  const atomMat = new THREE.MeshStandardMaterial({
    color: element.color,
    metalness: 0.6,
    roughness: 0.4
  });

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        const atom = new THREE.Mesh(atomGeo, atomMat);
        atom.position.set(
          (x - gridSize / 2) * spacing,
          (y - gridSize / 2) * spacing,
          (z - gridSize / 2) * spacing
        );
        group.add(atom);
      }
    }
  }

  return group;
}

export function createThemedElementDisplay(element, type = 'standard') {
  const group = new THREE.Group();
  const baseSize = 1.0;

  switch(type) {
    case 'cosmic':
      return createCosmicDisplay(element, baseSize);
    case 'solar':
      return createSolarDisplay(element, baseSize);
    case 'metallic':
      return createMetallicDisplay(element, baseSize);
    case 'crystalline':
      return createCrystallineDisplay(element, baseSize);
    case 'gaseous':
      return createGaseousDisplay(element, baseSize);
    case 'radioactive':
      return createRadioactiveDisplay(element, baseSize);
    case 'biological':
      return createBiologicalDisplay(element, baseSize);
    case 'energy':
      return createEnergyDisplay(element, baseSize);
    default:
      return createPlaceholderModel(element);
  }
}

function createCosmicDisplay(element, size) {
  const group = new THREE.Group();

  const outerGlowGeo = new THREE.SphereGeometry(size * 1.5, 32, 32);
  const outerGlowMat = new THREE.MeshBasicMaterial({
    color: element.color,
    transparent: true,
    opacity: 0.15
  });
  const outerGlow = new THREE.Mesh(outerGlowGeo, outerGlowMat);
  group.add(outerGlow);

  const coreGeo = new THREE.SphereGeometry(size * 0.6, 32, 32);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: element.color,
    emissiveIntensity: 0.8
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  const particlesGeo = new THREE.BufferGeometry();
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = size * (1.5 + Math.random() * 0.5);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particlesMat = new THREE.PointsMaterial({
    color: element.color,
    size: 0.03,
    transparent: true,
    opacity: 0.6
  });
  const particles = new THREE.Points(particlesGeo, particlesMat);
  group.add(particles);

  return group;
}

function createSolarDisplay(element, size) {
  const group = new THREE.Group();

  const coronaGeo = new THREE.SphereGeometry(size * 1.3, 32, 32);
  const coronaMat = new THREE.MeshBasicMaterial({
    color: NOBLE_GAS_COLORS[element.symbol] || 0xffaa00,
    transparent: true,
    opacity: 0.2
  });
  const corona = new THREE.Mesh(coronaGeo, coronaMat);
  group.add(corona);

  const surfaceGeo = new THREE.SphereGeometry(size, 32, 32);
  const surfaceMat = new THREE.MeshStandardMaterial({
    color: NOBLE_GAS_COLORS[element.symbol] || 0xffaa00,
    emissive: NOBLE_GAS_COLORS[element.symbol] || 0xffaa00,
    emissiveIntensity: 0.5,
    metalness: 0.3,
    roughness: 0.7
  });
  const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
  group.add(surface);

  return group;
}

function createMetallicDisplay(element, size) {
  const group = new THREE.Group();

  const mainGeo = new THREE.IcosahedronGeometry(size, 2);
  const mainMat = new THREE.MeshStandardMaterial({
    color: element.color,
    metalness: 0.9,
    roughness: 0.1,
    envMapIntensity: 1.0
  });
  const main = new THREE.Mesh(mainGeo, mainMat);
  group.add(main);

  const highlightGeo = new THREE.IcosahedronGeometry(size * 1.05, 1);
  const highlightMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.1,
    wireframe: true
  });
  const highlight = new THREE.Mesh(highlightGeo, highlightMat);
  group.add(highlight);

  return group;
}

function createCrystallineDisplay(element, size) {
  const group = new THREE.Group();
  const crystalGeo = new THREE.OctahedronGeometry(size, 1);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: element.color,
    metalness: 0.4,
    roughness: 0.3,
    transparent: true,
    opacity: 0.85
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  group.add(crystal);

  const innerGeo = new THREE.OctahedronGeometry(size * 0.6, 0);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  group.add(inner);

  return group;
}

function createGaseousDisplay(element, size) {
  const group = new THREE.Group();

  const blobGeo = new THREE.SphereGeometry(size, 32, 32);
  const blobMat = new THREE.MeshStandardMaterial({
    color: NOBLE_GAS_COLORS[element.symbol] || element.color,
    metalness: 0,
    roughness: 1.0,
    transparent: true,
    opacity: 0.6
  });
  const blob = new THREE.Mesh(blobGeo, blobMat);
  group.add(blob);

  for (let i = 0; i < 5; i++) {
    const smallBlobGeo = new THREE.SphereGeometry(size * 0.3, 16, 16);
    const smallBlobMat = new THREE.MeshBasicMaterial({
      color: NOBLE_GAS_COLORS[element.symbol] || element.color,
      transparent: true,
      opacity: 0.3
    });
    const smallBlob = new THREE.Mesh(smallBlobGeo, smallBlobMat);
    const angle = (i / 5) * Math.PI * 2;
    smallBlob.position.set(
      Math.cos(angle) * size * 1.2,
      Math.sin(angle * 0.5) * size * 0.3,
      Math.sin(angle) * size * 1.2
    );
    group.add(smallBlob);
  }

  return group;
}

function createRadioactiveDisplay(element, size) {
  const group = new THREE.Group();

  const coreGeo = new THREE.SphereGeometry(size * 0.6, 32, 32);
  const coreMat = new THREE.MeshStandardMaterial({
    color: element.color,
    emissive: 0x00ff00,
    emissiveIntensity: 0.5,
    metalness: 0.6,
    roughness: 0.4
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  const pulseGeo = new THREE.SphereGeometry(size, 32, 32);
  const pulseMat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.2
  });
  const pulse = new THREE.Mesh(pulseGeo, pulseMat);
  group.add(pulse);

  return group;
}

function createBiologicalDisplay(element, size) {
  const group = new THREE.Group();

  const organicGeo = new THREE.TorusKnotGeometry(size * 0.5, 0.1, 64, 8, 2, 3);
  const organicMat = new THREE.MeshStandardMaterial({
    color: element.color,
    metalness: 0.2,
    roughness: 0.8
  });
  const organic = new THREE.Mesh(organicGeo, organicMat);
  organic.rotation.x = Math.PI / 4;
  group.add(organic);

  const cellGeo = new THREE.SphereGeometry(size * 0.2, 16, 16);
  const cellMat = new THREE.MeshBasicMaterial({
    color: element.color,
    transparent: true,
    opacity: 0.4
  });

  for (let i = 0; i < 6; i++) {
    const cell = new THREE.Mesh(cellGeo, cellMat);
    const angle = (i / 6) * Math.PI * 2;
    cell.position.set(
      Math.cos(angle) * size,
      Math.sin(angle) * size * 0.3,
      Math.sin(angle) * size
    );
    group.add(cell);
  }

  return group;
}

function createEnergyDisplay(element, size) {
  const group = new THREE.Group();

  const energyGeo = new THREE.OctahedronGeometry(size, 1);
  const energyMat = new THREE.MeshStandardMaterial({
    color: element.color,
    emissive: element.color,
    emissiveIntensity: 0.6,
    metalness: 0.3,
    roughness: 0.5
  });
  const energy = new THREE.Mesh(energyGeo, energyMat);
  group.add(energy);

  const rays = [];
  for (let i = 0; i < 8; i++) {
    const rayGeo = new THREE.CylinderGeometry(0.02, 0.01, size * 1.5, 8);
    const rayMat = new THREE.MeshBasicMaterial({
      color: element.color,
      transparent: true,
      opacity: 0.4
    });
    const ray = new THREE.Mesh(rayGeo, rayMat);
    const angle = (i / 8) * Math.PI * 2;
    const elevation = (i % 2) * Math.PI / 3 - Math.PI / 6;
    ray.position.set(
      Math.cos(angle) * Math.cos(elevation) * size * 0.8,
      Math.sin(elevation) * size * 0.8,
      Math.sin(angle) * Math.cos(elevation) * size * 0.8
    );
    ray.lookAt(ray.position.clone().multiplyScalar(2));
    group.add(ray);
    rays.push(ray);
  }

  return group;
}

export function optimizeModelForVR(model) {
  model.traverse(child => {
    if (child.isMesh) {
      child.castShadow = false;
      child.receiveShadow = false;

      if (child.material) {
        child.material.side = THREE.DoubleSide;
      child.material.needsUpdate = true;
      child.material.transparent = child.material.opacity < 1;
      child.material.depthWrite = !child.material.transparent;
      child.material.depthTest = child.material.transparent
          ? THREE.DepthTest
          : THREE.DepthTest.Always;
      }
    }

    if (child.isLight) {
      child.castShadow = false;
      child.distance = 30;
      child.intensity *= 0.7;
    }
  });

  model.traverse(child => {
    if (child.isMesh && child.geometry) {
      child.geometry.computeBoundingSphere();
    }
  });

  return model;
}

const ASSET_PATHS = {
  elementModels: {
    'H': 'assets/elements/hydrogen.glb',
    'C': 'assets/elements/carbon.glb',
    'Fe': 'assets/elements/iron.glb',
    'Au': 'assets/elements/gold.glb',
    'U': 'assets/elements/uranium.glb',
    'Na': 'assets/elements/sodium.glb',
    'He': 'assets/elements/helium.glb',
    'O': 'assets/elements/oxygen.glb',
    'N': 'assets/elements/nitrogen.glb',
    'S': 'assets/elements/sulfur.glb',
    'Cu': 'assets/elements/copper.glb',
    'Al': 'assets/elements/aluminum.glb',
    'Si': 'assets/elements/silicon.glb',
    'Ca': 'assets/elements/calcium.glb',
    'Mg': 'assets/elements/magnesium.glb',
  },
  moleculeModels: {
    'H2O': 'assets/molecules/water.glb',
    'CO2': 'assets/molecules/carbon_dioxide.glb',
    'CH4': 'assets/molecules/methane.glb',
    'NaCl': 'assets/molecules/salt.glb',
    'O2': 'assets/molecules/oxygen.glb',
    'N2': 'assets/molecules/nitrogen.glb',
    'C6H12O6': 'assets/molecules/glucose.glb',
    'DNA': 'assets/molecules/dna.glb',
    'NH3': 'assets/molecules/ammonia.glb',
  },
  compoundModels: {
    'steel': 'assets/compounds/steel.glb',
    'bronze': 'assets/compounds/bronze.glb',
    'brass': 'assets/compounds/brass.glb',
    'quartz': 'assets/compounds/quartz.glb',
    'diamond': 'assets/compounds/diamond.glb',
    'graphite': 'assets/compounds/graphite.glb',
  }
};

export function getElementModelPath(elementSymbol) {
  return ASSET_PATHS.elementModels[elementSymbol] || null;
}

export function getMoleculeModelPath(formula) {
  return ASSET_PATHS.moleculeModels[formula] || null;
}

export function getCompoundModelPath(compoundName) {
  return ASSET_PATHS.compoundModels[compoundName] || null;
}

export function loadElementModel(element, callback) {
  const modelPath = getElementModelPath(element.symbol);

  if (modelPath) {
    loadModel(modelPath, (scene, error) => {
      if (error) {
        console.warn(`Failed to load model for ${element.symbol}, using procedural`);
        callback(createThemedElementDisplay(element, element.theme || 'standard'), null);
      } else {
        const optimized = optimizeModelForVR(scene);
        optimized.scale.set(0.5, 0.5, 0.5);
        callback(optimized, null);
      }
    });
  } else {
    const themed = createThemedElementDisplay(element, element.theme || 'standard');
    callback(themed, null);
  }
}

export function loadMoleculeModel(formula, elementData, callback) {
  const modelPath = getMoleculeModelPath(formula);

  if (modelPath) {
    loadModel(modelPath, (scene, error) => {
      if (error) {
        console.warn(`Failed to load molecule ${formula}, using procedural`);
        callback(createMoleculeModel(formula, elementData), null);
      } else {
        const optimized = optimizeModelForVR(scene);
        optimized.scale.set(0.5, 0.5, 0.5);
        callback(optimized, null);
      }
    });
  } else {
    const procedural = createMoleculeModel(formula, elementData);
    callback(procedural, null);
  }
}

export function createElementDisplay(element, displayType = 'standard') {
  const displayMap = {
    'cosmic': () => createThemedElementDisplay(element, 'cosmic'),
    'solar': () => createThemedElementDisplay(element, 'solar'),
    'energy': () => createThemedElementDisplay(element, 'energy'),
    'metallic': () => createThemedElementDisplay(element, 'metallic'),
    'crystalline': () => createThemedElementDisplay(element, 'crystalline'),
    'gaseous': () => createThemedElementDisplay(element, 'gaseous'),
    'radioactive': () => createThemedElementDisplay(element, 'radioactive'),
    'biological': () => createThemedElementDisplay(element, 'biological'),
    'industry': () => createThemedElementDisplay(element, 'metallic'),
    'technology': () => createThemedElementDisplay(element, 'metallic'),
    'toxic': () => createThemedElementDisplay(element, 'metallic'),
    'precious': () => createThemedElementDisplay(element, 'metallic'),
    'historical': () => createThemedElementDisplay(element, 'metallic'),
    'medical': () => createThemedElementDisplay(element, 'metallic'),
    'nuclear': () => createThemedElementDisplay(element, 'radioactive'),
    'space': () => createThemedElementDisplay(element, 'cosmic'),
    'research': () => createThemedElementDisplay(element, 'metallic'),
    'light': () => createThemedElementDisplay(element, 'cosmic'),
    'fire': () => createThemedElementDisplay(element, 'energy'),
    'volcano': () => createThemedElementDisplay(element, 'radioactive'),
    'swimming': () => createThemedElementDisplay(element, 'gaseous'),
    'welding': () => createThemedElementDisplay(element, 'gaseous'),
    'skeleton': () => createThemedElementDisplay(element, 'biological'),
    'forge': () => createThemedElementDisplay(element, 'metallic'),
    'electric': () => createThemedElementDisplay(element, 'metallic'),
    'treasure': () => createThemedElementDisplay(element, 'metallic'),
    'kitchen': () => createThemedElementDisplay(element, 'metallic'),
    'silicon': () => createThemedElementDisplay(element, 'crystalline'),
    'desert': () => createThemedElementDisplay(element, 'crystalline'),
    'breath': () => createThemedElementDisplay(element, 'gaseous'),
    'atmosphere': () => createThemedElementDisplay(element, 'gaseous'),
    'protection': () => createThemedElementDisplay(element, 'metallic'),
    'lights': () => createThemedElementDisplay(element, 'solar'),
  };

  const displayFn = displayMap[displayType] || displayMap['standard'];
  return displayFn ? displayFn() : createPlaceholderModel(element);
}

export function scaleModelForVR(model, targetScale = 1.0) {
  const bbox = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const scaleFactor = targetScale / maxDim;

  model.scale.multiplyScalar(scaleFactor);

  return model;
}

export function positionModelAt(model, position = {x: 0, y: 0, z: 0}, lookAt = null) {
  model.position.set(position.x, position.y, position.z);

  if (lookAt) {
    const target = new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z);
    model.lookAt(target);
  }

  return model;
}

export function createModelPedestal(size = 1.0, color = 0x333333) {
  const group = new THREE.Group();

  const baseGeo = new THREE.CylinderGeometry(size * 0.6, size * 0.8, size * 0.2, 32);
  const baseMat = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.3,
    roughness: 0.7
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0;
  group.add(base);

  const pillarGeo = new THREE.CylinderGeometry(size * 0.4, size * 0.5, size * 1.0, 32);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.2,
    roughness: 0.6
  });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.y = size * 0.6;
  group.add(pillar);

  const topGeo = new THREE.CylinderGeometry(size * 0.5, size * 0.6, size * 0.15, 32);
  const topMat = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.5,
    roughness: 0.4
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = size * 1.7;
  group.add(top);

  return group;
}

export function createInteractiveHotspot(size = 0.2, color = 0xff6b6b) {
  const group = new THREE.Group();

  const sphereGeo = new THREE.SphereGeometry(size, 16, 16);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.6
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  group.add(sphere);

  const ringGeo = new THREE.RingGeometry(size * 1.5, size * 1.5, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  group.userData.interactive = true;
  group.userData.hotspotType = 'info';

  return group;
}

export function batchOptimizeModels(models) {
  const scene = new THREE.Scene();

  models.forEach(model => {
    scene.add(model);
  });

  scene.traverse(child => {
    if (child.isMesh) {
      child.geometry.computeBoundingSphere();
    }
  });

  return scene;
}

export function createLODModel(baseModel, levels = 3) {
  const lodGroup = new THREE.Group();
  const distances = [0, 5, 10, 20];

  for (let level = 0; level < levels; level++) {
    const clone = baseModel.clone();
    const simplifyFactor = level / (levels - 1);

    clone.traverse(child => {
      if (child.isMesh && child.geometry) {
        const originalVertices = child.geometry.attributes.position.count;
        const targetVertices = Math.floor(originalVertices * (1 - simplifyFactor * 0.5));

        if (child.geometry.index) {
          child.geometry.setDrawRange(0, targetVertices);
        }

        if (child.material) {
          const simplifiedMat = child.material.clone();
          simplifiedMat.wireframe = level === levels - 1;
          child.material = simplifiedMat;
        }
      }
    });

    clone.position.set(0, 0, 0);
    lodGroup.add(clone);
  }

  return lodGroup;
}

export class VRObjectPool {
  constructor() {
    this.pools = new Map();
    this.maxSize = 50;
  }

  get(type, key) {
    const poolKey = `${type}_${key}`;
    if (!this.pools.has(poolKey)) {
      this.pools.set(poolKey, []);
    }

    const pool = this.pools.get(poolKey);
    return pool.length > 0 ? pool.pop() : null;
  }

  release(type, key, object) {
    const poolKey = `${type}_${key}`;
    if (!this.pools.has(poolKey)) {
      this.pools.set(poolKey, []);
    }

    const pool = this.pools.get(poolKey);
    if (pool.length < this.maxSize) {
      object.visible = false;
      object.position.set(0, 0, 0);
      object.rotation.set(0, 0, 0);
      pool.push(object);
    } else {
      object.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
  }

  dispose() {
    this.pools.forEach(pool => {
      pool.forEach(object => {
        object.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      });
    });
    this.pools.clear();
  }
}

export function optimizeForMobileVR(model) {
  const simplified = model.clone();

  simplified.traverse(child => {
    if (child.isMesh) {
      if (child.geometry) {
        child.geometry.computeVertexNormals();

        if (child.geometry.attributes.uv) {
          const uv = child.geometry.attributes.uv;
          for (let i = 0; i < uv.count; i++) {
            uv.setXY(i, Math.round(uv.getX(i) * 64) / 64, Math.round(uv.getY(i) * 64) / 64);
          }
          uv.needsUpdate = true;
        }
      }

      if (child.material) {
        if (child.material.map) {
          if (child.material.map.image) {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(child.material.map.image, 0, 0, 64, 64);
            const texture = new THREE.CanvasTexture(canvas);
            child.material.map = texture;
          }
        }

        child.material.side = THREE.DoubleSide;

        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            mat.side = THREE.DoubleSide;
          });
        }
      }
    }
  });

  return simplified;
}

export function createDistanceCuller(models, camera) {
  return {
    update: function() {
      const frustum = new THREE.Frustum();
      frustum.setFromProjectionMatrix(camera.projectionMatrix);
      frustum.multiplyMatrices(camera.matrixWorldInverse, frustum);

      models.forEach(model => {
        if (model.userData.boundingSphere) {
          model.visible = frustum.intersectsSphere(model.userData.boundingSphere);
        } else {
          const sphere = new THREE.Sphere();
          sphere.setFromObject(model);
          model.userData.boundingSphere = sphere;
          model.visible = frustum.intersectsSphere(sphere);
        }
      });
    }
  };
}

export function measureModelPerformance(model) {
  const stats = {
    vertices: 0,
    triangles: 0,
    materials: 0,
    drawCalls: 0
  };

  model.traverse(child => {
    if (child.isMesh) {
      if (child.geometry) {
        if (child.geometry.attributes.position) {
          stats.vertices += child.geometry.attributes.position.count;
        }
        if (child.geometry.index) {
          stats.triangles += child.geometry.index.count / 3;
        } else {
          stats.triangles += child.geometry.attributes.position.count / 3;
        }
      }

      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        stats.materials += mats.length;
        stats.drawCalls++;
      }
    }
  });

  return stats;
}

export function validateModelForVR(model, warnings = []) {
  const stats = measureModelPerformance(model);

  if (stats.triangles > 100000) {
    warnings.push({
      type: 'high_poly',
      message: `Model has ${stats.triangles.toLocaleString()} triangles. Consider simplifying.`,
      severity: 'warning'
    });
  }

  if (stats.triangles > 50000) {
    warnings.push({
      type: 'medium_poly',
      message: `Model has ${stats.triangles.toLocaleString()} triangles. Recommended: <50k for VR.`,
      severity: 'info'
    });
  }

  if (stats.materials > 10) {
    warnings.push({
      type: 'high_materials',
      message: `Model uses ${stats.materials} materials. Consider batching.`,
      severity: 'warning'
    });
  }

  const hasAnimation = model.animations && model.animations.length > 0;
  if (hasAnimation && stats.triangles > 20000) {
    warnings.push({
      type: 'animated_poly',
      message: `Animated model has ${stats.triangles.toLocaleString()} triangles. High for VR animation.`,
      severity: 'warning'
    });
  }

  model.userData.validationWarnings = warnings;
  model.userData.performanceStats = stats;

  return {stats, warnings};
}

export function createBillboard(text, color, size = 1) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 256;

  ctx.font = `${size * 60}px Arial`;
  ctx.fillStyle = color || '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const geo = new THREE.PlaneGeometry(1, 0.5);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 0, 0);

  const group = new THREE.Group();
  group.add(mesh);

  return group;
}
