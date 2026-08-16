import { Engine } from '@babylonjs/core/Engines/engine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera.js';
import { Vector3, Color4 } from '@babylonjs/core/Maths/math.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { WebXRState } from '@babylonjs/core/XR/webXRTypes.js';

import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';
import type { EmbedOptions, AppContext } from '../types/index.js';
import { ELEMENTS, EXPERIMENTAL_ROOMS } from '../data/elements.js';
import { RoomManager, ROOM_LOBBY, ROOM_ELEMENTS_START, ROOM_PERIODIC_PAVILION } from '../rooms/RoomManager.js';
import * as Lobby from '../rooms/Lobby.js';
import * as ElementRoom from '../rooms/ElementRoom.js';
import * as ExperimentalRoom from '../rooms/ExperimentalRoom.js';
import * as PeriodicPavilion from '../rooms/PeriodicPavilion.js';
import { loadAssets, type AssetManifest } from '../lib/AssetLoader.js';
import { AudioManager } from '../lib/AudioManager.js';
import { DesktopControls } from '../movement/DesktopControls.js';
import { VRNavigation } from '../movement/VRNavigation.js';
import { RoomTransitionManager } from '../movement/RoomTransitionManager.js';
import { injectScopedStyles, removeScopedStyles } from './scoped-styles.js';
import { initThemeAdmin } from '../ui/themeAdmin.js';

const ROOM_ELEMENTS_END = ROOM_ELEMENTS_START + ELEMENTS.length - 1;
const ROOM_EXP_START = ROOM_ELEMENTS_END + 1;

const ASSET_MANIFEST: AssetManifest = {
  generic_controller: { url: 'generic_controller.glb' },
  sky: { url: 'sky.png' },
  grid: { url: 'grid.png' },
};

let app: {
  engine: Engine;
  scene: Scene;
  camera: UniversalCamera;
  desktopControls: DesktopControls;
  vrNav: VRNavigation | null;
  roomManager: RoomManager;
  audioManager: AudioManager;
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  resizeObserver: ResizeObserver;
  context: AppContext;
  onReady?: () => void;
  onVREnter?: () => void;
  onVRExit?: () => void;
  onRoomChange?: (roomName: string) => void;
  currentVRFloor: AbstractMesh | null;
  gotoRoom: (roomIndex: number, elementSymbol?: string, expRoomId?: string) => void;
} | null = null;

export function mount(options: EmbedOptions): { unmount: () => void } {
  const container = typeof options.container === 'string'
    ? document.querySelector<HTMLElement>(options.container)!
    : options.container;

  if (!container) {
    throw new Error(`[PSE VR] Container not found: ${options.container}`);
  }

  if (app) {
    throw new Error('[PSE VR] Already mounted. Call unmount() first.');
  }

  // Read URL params
  const urlParams = new URLSearchParams(window.location.search);
  const roomName = options.startRoom || urlParams.get('room');
  const handedness = (urlParams.get('handedness') as 'left' | 'right') || 'right';

  // Inject scoped styles
  injectScopedStyles();

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'pse-vr-canvas';
  canvas.style.width = options.width ? `${options.width}px` : '100%';
  canvas.style.height = options.height ? `${options.height}px` : '100%';
  container.style.position = 'relative';
  container.appendChild(canvas);

  // Engine creation
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: false,
    stencil: true,
    antialias: true,
  });
  engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio, 2));

  // Scene creation
  const scene = new Scene(engine);
  scene.clearColor = options.backgroundColor
    ? Color4.FromHexString(options.backgroundColor)
    : new Color4(0.04, 0.04, 0.1, 1);

  // Camera
  const camera = new UniversalCamera('camera', new Vector3(0, 1.6, 8), scene);
  camera.attachControl(canvas, true);
  camera.minZ = 0.1;
  camera.fov = 1.2;
  camera.rotation = new Vector3(0, Math.PI, 0);
  camera.inertia = 0.8;
  camera.angularSensibility = 2000;
  camera.keysUp = [87];    // W
  camera.keysDown = [83];  // S
  camera.keysLeft = [65];  // A
  camera.keysRight = [68]; // D
  scene.activeCamera = camera;

  // Collision detection: enable on camera and scene
  scene.collisionsEnabled = true;
  camera.checkCollisions = true;
  camera.ellipsoid = new Vector3(0.5, 0.9, 0.5);   // player capsule half-extents
  camera.ellipsoidOffset = new Vector3(0, 0.9, 0);  // center of capsule from feet

  // Desktop controls
  const desktopControls = new DesktopControls(camera, scene);

  const transitionManager = new RoomTransitionManager();

  // Light
  const hemiLight = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.3;

  // Room manager
  const roomManager = new RoomManager(scene);

  roomManager.registerRoom(ROOM_LOBBY, Lobby);
  roomManager.registerRoom(ROOM_PERIODIC_PAVILION, PeriodicPavilion);
  ELEMENTS.forEach((_, i) => {
    roomManager.registerRoom(ROOM_ELEMENTS_START + i, ElementRoom);
  });
  EXPERIMENTAL_ROOMS.forEach((_, i) => {
    roomManager.registerRoom(ROOM_EXP_START + i, ExperimentalRoom);
  });

  // Audio
  const audioManager = new AudioManager(scene);
  if (options.audio !== false) {
    audioManager.init().catch(e => console.warn('[AudioManager] Init failed:', e));
  }

  // Assets
  const assetStore = { ...ASSET_MANIFEST } as Record<string, any>;
  loadAssets(scene, 'assets', ASSET_MANIFEST, () => {
    console.log('[AssetLoader] All assets loaded');
  }, (loaded, total) => {
    // Progress callback — no DOM loading element in embed mode
  });

  // VR navigation placeholder
  let vrNav: VRNavigation | null = null;
  let currentVRFloor: AbstractMesh | null = null;

// gotoRoom function
  function gotoRoom(roomIndex: number, elementSymbol?: string, expRoomId?: string): void {
    if (!app) {
      console.warn('[gotoRoom] Called before app is initialized, ignoring');
      return;
    }
    console.log('[gotoRoom] Navigating to room', roomIndex, 'param:', elementSymbol || expRoomId);

    if (app.context.room !== roomIndex) {
      roomManager.exitRoom(app.context.room, app.context);
      audioManager.stopAmbience();
    }

    if (roomIndex >= ROOM_ELEMENTS_START && roomIndex <= ROOM_ELEMENTS_END && !elementSymbol) {
      elementSymbol = ELEMENTS[roomIndex - ROOM_ELEMENTS_START].symbol;
    }
    if (roomIndex >= ROOM_EXP_START && !expRoomId) {
      expRoomId = EXPERIMENTAL_ROOMS[roomIndex - ROOM_EXP_START].id;
    }

    const param = elementSymbol || expRoomId;
    roomManager.setupRoom(roomIndex, app.context, param);

    if (roomIndex === ROOM_LOBBY) {
      audioManager.playRoomAmbience('lobby');
    } else if (roomIndex >= ROOM_ELEMENTS_START && roomIndex <= ROOM_ELEMENTS_END) {
      const element = ELEMENTS[roomIndex - ROOM_ELEMENTS_START];
      const group = element.group as 'alkali' | 'alkalineEarth' | 'transition' | 'lanthanide' | 'actinide' | 'metal' | 'metalloid' | 'nonmetal' | 'halogen' | 'nobleGas';
      audioManager.playRoomAmbience(group);
    } else if (roomIndex >= ROOM_EXP_START) {
      audioManager.playRoomAmbience('lobby');
    }

    const roomExchange = () => {
      if (!app) return;

      if (app.context.vrMode) {
        // VR camera position is handled by VRNavigation
      } else {
        camera.position = new Vector3(0, 1.6, 8);
        camera.rotation = new Vector3(0, Math.PI, 0);
      }

      app.context.room = roomIndex;
      roomManager.enterRoom(roomIndex, app.context, param);

      if (app.onRoomChange) {
        const name = param || `room-${roomIndex}`;
        app.onRoomChange(name);
      }
    };

    if (!app) return;

    transitionManager.transitionTo(app.context, roomIndex, roomExchange, {
      duration: 500,
      fadeEnabled: true,
      animationEnabled: true
    }).catch(error => {
      console.warn('[RoomTransitionManager] Animation failed:', error);
      roomExchange();
    });
  }

  // AppContext
  const context: AppContext = {
    scene,
    engine,
    camera,
    xr: null,
    room: ROOM_LOBBY,
    vrMode: false,
    handedness,
    goto: null,
    GotoRoom: gotoRoom,
    assets: assetStore,
    trackMesh: (mesh) => roomManager.trackMesh(mesh),
    trackNode: (node) => roomManager.trackNode(node),
    trackParticleSystem: (ps) => roomManager.trackParticleSystem(ps),
    setFloorMesh: (mesh) => {
      if (vrNav && currentVRFloor) {
        vrNav.removeFloorMesh(currentVRFloor);
      }
      currentVRFloor = mesh;
      if (vrNav) {
        vrNav.addFloorMesh(mesh);
      }
    },
    roomManager,
  };

  // Store on window for debugging (same as original)
  (window as any).context = context;

  // Setup initial room
  roomManager.setupRoom(ROOM_LOBBY, context);

  // VR Navigation
  try {
    vrNav = new VRNavigation(scene, {
      disableTeleportation: false,
    });

    vrNav.ready.then(xrExperience => {
      context.xr = xrExperience;

      xrExperience.baseExperience.onStateChangedObservable.add((state) => {
        const wasVrMode = context.vrMode;
        context.vrMode = state === WebXRState.IN_XR;

        if (context.vrMode && !wasVrMode) {
          roomManager.exitRoom(context.room, context);
          if (app?.onVREnter) app.onVREnter();
        } else if (!context.vrMode && wasVrMode) {
          roomManager.enterRoom(context.room, context);
          if (app?.onVRExit) app.onVRExit();
        }
      });
    }).catch(e => {
      console.warn('WebXR not available:', e);
    });
  } catch (e) {
    console.warn('WebXR not available:', e);
  }

  // Determine initial room from URL params or options
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

  // Render loop
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

  // Resize observer
  const resizeObserver = new ResizeObserver(() => {
    engine.resize();
  });
  resizeObserver.observe(container);

  // Store app state
  app = {
    engine,
    scene,
    camera,
    desktopControls,
    vrNav,
    roomManager,
    audioManager,
    canvas,
    container,
    resizeObserver,
    context,
    onReady: options.onReady,
    onVREnter: options.onVREnter,
    onVRExit: options.onVRExit,
    onRoomChange: options.onRoomChange,
    currentVRFloor,
    gotoRoom,
  };

  // Navigate to initial room from URL params or options
  gotoRoom(initialRoom, initialParam);

  // Fire onReady
  if (options.onReady) {
    options.onReady();
  }

  // Optional in-app theme admin (only active with ?admin in the URL)
  initThemeAdmin();

  return {
    unmount,
  };
}

function unmount(): void {
  if (!app) return;

  const { engine, scene, desktopControls, vrNav, roomManager, audioManager, canvas, container, resizeObserver } = app;

  engine.stopRenderLoop();
  desktopControls.dispose();
  vrNav?.dispose();
  roomManager.exitRoom(app.context.room, app.context);
  audioManager.dispose();
  scene.dispose();
  engine.dispose();

  canvas.remove();
  resizeObserver.disconnect();
  removeScopedStyles();

  app = null;
}
