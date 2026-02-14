import * as THREE from 'three';
import { ELEMENTS } from '../data/elements.js';

export { ELEMENTS };

// Room indices
export const ROOM_LOBBY = 0;
export const ROOM_ELEMENTS_START = 1;
export const ROOM_ELEMENTS_END = 118;
export const ROOM_EXP_START = 119;

// Experimental room names
const EXPERIMENTAL_ROOMS = [
  'extreme_conditions',
  'industrial_apps',
  'historical_lab',
  'space_chem',
  'nano_world',
  'reaction_lab',
  'nuclear_lab',
  'electrochem_lab',
  'organic_lab',
  'challenge_arena',
];

export const ROOMS = [
  'lobby',           // 0
  ...ELEMENTS.map(e => e.symbol.toLowerCase()), // 1-118
  ...EXPERIMENTAL_ROOMS, // 119-128
];

export const MUSIC_THEMES = [
  false,
  false,
  'chopin_snd',
  'wind_snd',
  false,
  false,
  'birds_snd',
  'birds_snd',
  'forest_snd',
  'wind_snd',
  'birds_snd',
];

export const TARGET_POSITIONS = {
  hall: {
    sound: new THREE.Vector3(0, 0, 0),
    photogrammetry: new THREE.Vector3(1, 0, 0),
    vertigo: new THREE.Vector3(0, 0, 0),
    arachnophobia: new THREE.Vector3(0, 0, 0)
  },
  photogrammetry: {
    hall: new THREE.Vector3(-3.6, 0, 2.8)
  },
  sound: {
    hall: new THREE.Vector3(4.4, 0, 4.8)
  },
  vertigo: {
    hall: new THREE.Vector3(-1.8, 0, -5)
  },
  arachnophobia: {
    hall: new THREE.Vector3(0, 0, -3)
  }
};

export const CAMERA_DEFAULTS = {
  fov: 80,
  near: 0.005,
  far: 10000,
  position: { x: 0, y: 1.6, z: 0 }
};

export const RENDERER_DEFAULTS = {
  antialias: true,
  logarithmicDepthBuffer: false,
  gammaFactor: 2.2,
  outputEncoding: THREE.sRGBEncoding
};

export const LIGHT_DEFAULTS = {
  sun: {
    color: 0xeeffff,
    position: new THREE.Vector3(0.2, 1, 0.1)
  },
  fill: {
    color: 0xfff0ee,
    intensity: 0.3,
    position: new THREE.Vector3(-0.2, -1, -0.1)
  }
};

export const CONTROLLER_RAYCASTER = {
  near: 0.1
};

export const ASSET_PATHS = {
  basis: 'src/vendor/',
  draco: 'src/vendor/',
  assets: 'assets/'
};

export const DEBUG_KEYS = {
  forward: 87,
  left: 65,
  backward: 83,
  right: 68,
  nextRoom: 78
};
