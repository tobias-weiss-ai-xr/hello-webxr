import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { Vector3, Color4 } from '@babylonjs/core/Maths/math.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { WebXRState } from '@babylonjs/core/XR/webXRTypes.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';

import type { AppContext } from './types/index.js';
import { ELEMENTS, EXPERIMENTAL_ROOMS } from './data/elements.js';
import { RoomManager, ROOM_LOBBY, ROOM_ELEMENTS_START } from './rooms/RoomManager.js';
import * as Lobby from './rooms/Lobby.js';
import * as ElementRoom from './rooms/ElementRoom.js';
import * as ExperimentalRoom from './rooms/ExperimentalRoom.js';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const loadingEl = document.getElementById('loading');
const noWebGLEl = document.getElementById('no-webgl');

const ROOM_ELEMENTS_END = ROOM_ELEMENTS_START + ELEMENTS.length - 1;
const ROOM_EXP_START = ROOM_ELEMENTS_END + 1;

const urlParams = new URLSearchParams(window.location.search);
const roomName = urlParams.get('room');
const handedness = (urlParams.get('handedness') as 'left' | 'right') || 'right';

let engine: Engine;
let scene: Scene;
let camera: ArcRotateCamera;
let xrExperience: import('@babylonjs/core/XR/webXRDefaultExperience').WebXRDefaultExperience | null = null;
let roomManager: RoomManager;
let context: AppContext;

async function init() {
  engine = new Engine(canvas, true, {
    preserveDrawingBuffer: false,
    stencil: true,
    antialias: true
  });
  engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio, 2));

  scene = new Scene(engine);
  scene.clearColor = new Color4(0.04, 0.04, 0.1, 1);

  camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, 8, Vector3.Zero(), scene);
  camera.lowerRadiusLimit = 0.5;
  camera.upperRadiusLimit = 50;
  camera.wheelPrecision = 20;
  camera.attachControl(canvas, true);

  const hemiLight = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.3;

  roomManager = new RoomManager(scene);

  roomManager.registerRoom(ROOM_LOBBY, Lobby);
  ELEMENTS.forEach((_, i) => {
    roomManager.registerRoom(ROOM_ELEMENTS_START + i, ElementRoom);
  });
  EXPERIMENTAL_ROOMS.forEach((_, i) => {
    roomManager.registerRoom(ROOM_EXP_START + i, ExperimentalRoom);
  });

  context = {
    scene,
    engine,
    camera,
    xr: null,
    room: ROOM_LOBBY,
    vrMode: false,
    roomRoot: roomManager.roomRootNode,
    handedness,
    goto: null,
    GotoRoom: gotoRoom,
    assets: {}
  };

  (window as any).context = context;

  roomManager.setupRoom(ROOM_LOBBY, context);

  try {
    xrExperience = await scene.createDefaultXRExperienceAsync({
      floorMeshes: [createFloorMesh()],
      optionalFeatures: true
    });
    context.xr = xrExperience;

    xrExperience.baseExperience.onStateChangedObservable.add((state) => {
      const wasVrMode = context.vrMode;
      context.vrMode = state === WebXRState.IN_XR;

      if (context.vrMode && !wasVrMode) {
        roomManager.exitRoom(context.room, context);
      } else if (!context.vrMode && wasVrMode) {
        roomManager.enterRoom(context.room, context);
      }
    });
  } catch (e) {
    console.warn('WebXR not available:', e);
  }

  setupDesktopControls();

  let initialRoom = ROOM_LOBBY;
  let initialParam: string | undefined;

  if (roomName) {
    const elementIndex = ELEMENTS.findIndex(e => e.symbol === roomName);
    if (elementIndex !== -1) {
      initialRoom = ROOM_ELEMENTS_START + elementIndex;
      initialParam = roomName;
    } else {
      const expIndex = EXPERIMENTAL_ROOMS.findIndex(r => r.id === roomName);
      if (expIndex !== -1) {
        initialRoom = ROOM_EXP_START + expIndex;
        initialParam = EXPERIMENTAL_ROOMS[expIndex].id;
      }
    }
  }

  gotoRoom(initialRoom, initialParam);

  if (loadingEl) loadingEl.style.display = 'none';

  engine.runRenderLoop(() => {
    const delta = engine.getDeltaTime() / 1000;
    const time = performance.now() / 1000;

    const currentRoom = roomManager.getRoom(context.room);
    if (currentRoom) {
      currentRoom.execute(context, delta, time);
    }

    if (context.goto !== null) {
      gotoRoom(context.goto);
      context.goto = null;
    }

    scene.render();
  });

  window.addEventListener('resize', () => engine.resize());
}

function createFloorMesh(): import('@babylonjs/core').Mesh {
  const floor = MeshBuilder.CreateGround('teleportFloor', { width: 30, height: 30 }, scene);
  floor.isVisible = false;
  floor.isPickable = false;
  return floor;
}

function gotoRoom(roomIndex: number, elementSymbol?: string, expRoomId?: string): void {
  roomManager.exitRoom(context.room, context);

  if (roomIndex >= ROOM_ELEMENTS_START && roomIndex <= ROOM_ELEMENTS_END && !elementSymbol) {
    elementSymbol = ELEMENTS[roomIndex - ROOM_ELEMENTS_START].symbol;
  }
  if (roomIndex >= ROOM_EXP_START && !expRoomId) {
    expRoomId = EXPERIMENTAL_ROOMS[roomIndex - ROOM_EXP_START].id;
  }

  const param = elementSymbol || expRoomId;
  roomManager.setupRoom(roomIndex, context, param);

  if (context.vrMode && xrExperience?.baseExperience.camera) {
    xrExperience.baseExperience.camera.position = new Vector3(0, 1.6, 6.8);
  } else {
    camera.position = Vector3.Zero();
    camera.target = Vector3.Zero();
  }

  context.room = roomIndex;
  roomManager.enterRoom(roomIndex, context, param);
}

function setupDesktopControls(): void {
  const keys: Record<string, boolean> = {};
  const velocity = 0.1;

  window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

  scene.onBeforeRenderObservable.add(() => {
    if (context.vrMode) return;
    const forward = camera.getDirection(Vector3.Forward());
    const right = camera.getDirection(Vector3.Right());
    forward.y = 0;
    forward.normalize();
    right.y = 0;
    right.normalize();

    if (keys['w'] || keys['arrowup']) camera.position.addInPlace(forward.scale(velocity));
    if (keys['s'] || keys['arrowdown']) camera.position.addInPlace(forward.scale(-velocity));
    if (keys['a'] || keys['arrowleft']) camera.position.addInPlace(right.scale(-velocity));
    if (keys['d'] || keys['arrowright']) camera.position.addInPlace(right.scale(velocity));
  });
}

try {
  init();
} catch (e) {
  console.error('Failed to initialize:', e);
  if (loadingEl) loadingEl.style.display = 'none';
  if (noWebGLEl) noWebGLEl.classList.remove('hidden');
}
