import * as THREE from 'three';

export const ROOMS = [
  'hall',
  'sound',
  'photogrammetry',
  'vertigo',
  'arachnophobia',
  'panoramastereo',
  'panorama1',
  'panorama2',
  'panorama3',
  'panorama4',
  'panorama5',
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
