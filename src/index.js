import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

import {VRButton} from './lib/VRButton.js';
import {slideshow} from './lib/slideshow.js';
import {loadAssets} from './lib/assetManager.js';

// ECSY
import { World } from 'ecsy';
import { SDFTextSystem } from './systems/SDFTextSystem.js';
import { DebugHelperSystem } from './systems/DebugHelperSystem.js';
import { AreaCheckerSystem } from './systems/AreaCheckerSystem.js';
import { ControllersSystem } from './systems/ControllersSystem.js';
import HierarchySystem from './systems/HierarchySystem.js';
import TransformSystem from './systems/TransformSystem.js';
import BillboardSystem from './systems/BillboardSystem.js';

import SystemsGroup from './systems/SystemsGroup.js';

import assets from './assets.js';
import shaders from './lib/shaders.js';

import { Text, Object3D, AreaChecker } from './components/index.js';

import RayControl from './lib/RayControl.js';
import Teleport from './lib/Teleport.js';

import * as roomLobby from './rooms/Lobby.js';
import * as ElementRoom from './rooms/ElementRoom.js';
import * as ExperimentalRoom from './rooms/ExperimentalRoom.js';

import {ELEMENTS, EXPERIMENTAL_ROOMS} from './data/elements.js';
import ParticleSystem from './lib/ParticleSys.js';
// import VoiceCommander from './lib/VoiceCommander.js';

var clock = new THREE.Clock();

var scene, renderer, camera, controls, context = {};
var raycontrol, teleport, controllers = [];
// var voiceCommander;

var listener, ambientMusic;

var rooms = [];
var setupCalledRooms = new Set();
var currentElementRoom = null;
var currentExpRoom = null;

const ROOM_LOBBY = 0;
const ROOM_ELEMENTS_START = 1;
const ROOM_ELEMENTS_END = ROOM_ELEMENTS_START + ELEMENTS.length - 1;
const ROOM_EXP_START = ROOM_ELEMENTS_END + 1;
var elementRooms = [];
var expRooms = [];

const urlObject = new URL(window.location);
const roomName = urlObject.searchParams.get('room');
const debug = urlObject.searchParams.has('debug');
const handedness = urlObject.searchParams.has('handedness') ? urlObject.searchParams.get('handedness') : "right";

const targetPositions = {
  lobby: {
    fromElement: new THREE.Vector3(0, 0, 5)
  },
  elements: {
    toLobby: new THREE.Vector3(0, 0, -5)
  },
  expRooms: {
    toLobby: new THREE.Vector3(0, 0, -5)
  }
};

function gotoRoom(roomIndex, elementSymbol = null, expRoomId = null) {
  rooms[context.room].exit(context);
  raycontrol.deactivateAll();

  const prevRoom = context.room;

  if (roomIndex === ROOM_LOBBY) {
    currentElementRoom = null;
    currentExpRoom = null;
  } else if (roomIndex >= ROOM_ELEMENTS_START && roomIndex <= ROOM_ELEMENTS_END) {
    currentElementRoom = elementSymbol;
    currentExpRoom = null;
    if (!setupCalledRooms.has(roomIndex)) {
      rooms[roomIndex].setup(context, elementSymbol);
      setupCalledRooms.add(roomIndex);
    }
  } else if (roomIndex >= ROOM_EXP_START) {
    currentElementRoom = null;
    currentExpRoom = expRoomId;
    if (!setupCalledRooms.has(roomIndex)) {
      rooms[roomIndex].setup(context, expRoomId);
      setupCalledRooms.add(roomIndex);
    }
  }

  context.room = roomIndex;
  playMusic(roomIndex);

  rooms[context.room].enter(context, elementSymbol || expRoomId);
}

function playMusic(roomIndex) {
  if (ambientMusic && ambientMusic.source) ambientMusic.stop();

  if (roomIndex !== ROOM_LOBBY) {
  }
}

var ecsyWorld;
var systemsGroup = {};
var initialized = false;

function detectWebXR() {
  if ('xr' in navigator) {
    navigator.xr.isSessionSupported('immersive-vr').then( supported => {
      const noWebXRElement = document.getElementById('no-webxr');
      if (!supported && noWebXRElement) {
        noWebXRElement.classList.remove('hidden');
      }
    } );

  } else {
    const noWebXRElement = document.getElementById('no-webxr');
    if (noWebXRElement) {
      noWebXRElement.classList.remove('hidden');
    }
  }
  }

export function init() {
  if (initialized) {
    console.log('init() already called, skipping');
    return;
  }
  initialized = true;

  console.log('init() called');
  detectWebXR();

  const handElement = document.getElementById(handedness + 'hand');
  if (handElement) {
    handElement.classList.add('activehand');
  }

  ecsyWorld = new World();
  ecsyWorld
    .registerSystem(SDFTextSystem)
    .registerSystem(AreaCheckerSystem)
    .registerSystem(ControllersSystem)
    .registerSystem(DebugHelperSystem)
    .registerSystem(TransformSystem)
    .registerSystem(BillboardSystem)
    .registerSystem(HierarchySystem);

  systemsGroup['lobby'] = new SystemsGroup(ecsyWorld, [
    AreaCheckerSystem, ControllersSystem, DebugHelperSystem
  ]);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false
  });
  renderer.gammaFactor = 2.2;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;

  renderer.sortObjects = false;
  renderer.autoClear = true;
  renderer.autoClearDepth = true;
  renderer.autoClearStencil = true;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.005, 10000);
  camera.position.set(0, 1.6, 0);
  listener = new THREE.AudioListener();
  camera.add(listener);

  ambientMusic = new THREE.Audio(listener);

  controls = new PointerLockControls(camera, renderer.domElement);

  document.body.addEventListener('click', () => {
    if (!context.vrMode) {
      controls.lock();
    }
  });

  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;

  document.addEventListener('keydown', (ev) => {
    switch(ev.keyCode) {
      case 87: case 38: moveForward = true; break;
      case 65: case 37: moveLeft = true; break;
      case 83: case 40: moveBackward = true; break;
      case 68: case 39: moveRight = true; break;
    }
  });

  document.addEventListener('keyup', (ev) => {
    switch(ev.keyCode) {
      case 87: case 38: moveForward = false; break;
      case 65: case 37: moveLeft = false; break;
      case 83: case 40: moveBackward = false; break;
      case 68: case 39: moveRight = false; break;
    }
  });

  context.browserControls = {
    controls: controls,
    moveForward: () => moveForward,
    moveBackward: () => moveBackward,
    moveLeft: () => moveLeft,
    moveRight: () => moveRight
  };

  for (let i = 0; i < 2; i++) {
    controllers[i] = renderer.xr.getController(i);
    controllers[i].raycaster = new THREE.Raycaster();
    controllers[i].raycaster.near = 0.1;
    controllers[i].addEventListener('selectstart', onSelectStart);
    controllers[i].addEventListener('selectend', onSelectEnd);
  }

  const lightSun = new THREE.DirectionalLight(0xeeffff);
  lightSun.name = 'sun';
  lightSun.position.set(0.2, 1, 0.1);
  const lightFill = new THREE.DirectionalLight(0xfff0ee, 0.3);
  lightFill.name = 'fillLight';
  lightFill.position.set(-0.2, -1, -0.1);

  scene.add(lightSun, lightFill);

  var cameraRig = new THREE.Group();
  cameraRig.add(camera);
  cameraRig.add(controllers[0]);
  cameraRig.add(controllers[1]);
  cameraRig.position.set(0, 0, 2);
  scene.add(cameraRig);

  context.vrMode = false;
  context.assets = assets;
  context.shaders = shaders;
  context.scene = scene;
  context.renderer = renderer;
  context.camera = camera;
  context.audioListener = listener;
  context.goto = null;
  context.cameraRig = cameraRig;
  context.controllers = controllers;
  context.world = ecsyWorld;
  context.systemsGroup = systemsGroup;
  context.handedness = handedness;
  context.GotoRoom = gotoRoom;
  context.rooms = rooms;

  window.context = context;

  loadAssets(renderer, 'assets/', assets, () => {
    raycontrol = new RayControl(context, handedness);
    context.raycontrol = raycontrol;

    teleport = new Teleport(context);
    context.teleport = teleport;

    // voiceCommander = new VoiceCommander(context);

    setupControllers();

  // Register rooms
  rooms[ROOM_LOBBY] = roomLobby;
  rooms[ROOM_LOBBY].setup(context);
  rooms[ROOM_LOBBY].setupCalled = true;

  ELEMENTS.forEach((element, index) => {
    const roomIndex = ROOM_ELEMENTS_START + index;
    rooms[roomIndex] = ElementRoom;
  });

  EXPERIMENTAL_ROOMS.forEach((room, index) => {
    const roomIndex = ROOM_EXP_START + index;
    rooms[roomIndex] = ExperimentalRoom;
  });

  document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer, status => {
      const wasVrMode = context.vrMode;
      context.vrMode = status === 'sessionStarted';

      if (context.vrMode && !wasVrMode) {
        rooms[context.room].exit(context);
        context.cameraRig.position.set(0, 0, 2);
      } else if (!context.vrMode && wasVrMode) {
        rooms[context.room].enter(context);
      }
    }));

    document.getElementById('loading').style.display = 'none';

    var initialRoom = ROOM_LOBBY;
    var currentElementRoom = null;
    var currentExpRoom = null;

    if (roomName) {
      console.log('URL parameter roomName:', roomName);

      // URL Validation: Check if roomName is a valid element or experimental room
      const elementIndex = ELEMENTS.findIndex(e => e.symbol === roomName);
      console.log('elementIndex:', elementIndex);
      if (elementIndex !== -1) {
        initialRoom = ROOM_ELEMENTS_START + elementIndex;
        currentElementRoom = roomName;
        currentExpRoom = null;
        console.log('Setting initial room to:', initialRoom);

        // VR Mode Safety: Verify room has all required exports
        if (rooms[initialRoom] && typeof rooms[initialRoom].setup === 'function' &&
            typeof rooms[initialRoom].enter === 'function' &&
            typeof rooms[initialRoom].exit === 'function' &&
            typeof rooms[initialRoom].execute === 'function') {
          if (!setupCalledRooms.has(initialRoom)) {
            rooms[initialRoom].setup(context, roomName);
            setupCalledRooms.add(initialRoom);
          }
        } else {
          console.error('Invalid room module at index:', initialRoom, 'Missing required exports');
          initialRoom = ROOM_LOBBY;
        }
      } else {
        const expIndex = EXPERIMENTAL_ROOMS.findIndex(r => r.id === roomName);
        console.log('expIndex:', expIndex);
        if (expIndex !== -1) {
          initialRoom = ROOM_EXP_START + expIndex;
          currentElementRoom = null;
          currentExpRoom = roomName;
          console.log('Setting initial room to:', initialRoom);

          // VR Mode Safety: Verify room has all required exports
          if (rooms[initialRoom] && typeof rooms[initialRoom].setup === 'function' &&
              typeof rooms[initialRoom].enter === 'function' &&
              typeof rooms[initialRoom].exit === 'function' &&
              typeof rooms[initialRoom].execute === 'function') {
            if (!setupCalledRooms.has(initialRoom)) {
              rooms[initialRoom].setup(context, roomName);
              setupCalledRooms.add(initialRoom);
            }
          } else {
            console.error('Invalid room module at index:', initialRoom, 'Missing required exports');
            initialRoom = ROOM_LOBBY;
          }
        } else {
          // URL Validation: Invalid room ID, fall back to lobby
          console.warn('Invalid room ID in URL parameter:', roomName, '- Falling back to lobby');
          initialRoom = ROOM_LOBBY;
        }
      }
      context.room = initialRoom;
    }

console.log('Entering initial room:', initialRoom);
    rooms[initialRoom].enter(context, currentElementRoom || currentExpRoom);

    renderer.setAnimationLoop(animate);
  },

  loadProgress => {
    document.querySelector('#progressbar').setAttribute('stroke-dashoffset',
      - (282 - Math.floor(loadProgress / 27 * 282)));
  },

  debug);
}

function setupControllers() {
  // voiceCommander.init();

  var model = assets['generic_controller_model'].scene;
  var material = new THREE.MeshLambertMaterial({
    map: assets['controller_tex'],
  });
  model.getObjectByName('body').material = material;
  model.getObjectByName('trigger').material = material;

  for (let i = 0; i < 2; i++) {
    let controller = controllers[i];
    controller.boundingBox = new THREE.Box3();
    controller.userData.grabbing = null;
    controller.addEventListener( 'connected', function ( event ) {
      this.add(model.clone());
      raycontrol.addController(this, event.data);
    } );
    controller.addEventListener( 'disconnect', function () {
      this.remove(this.children[0]);
      raycontrol.removeController(this, event.data);
    });
  }
}

var selectStartSkip = {};
var selectEndSkip = {};
var OculusBrowser = navigator.userAgent.indexOf("OculusBrowser") !== -1 &&
  parseInt(navigator.userAgent.match(/OculusBrowser\/([0-9]+)./)[1]) < 8;

function onSelectStart(ev) {
  if (OculusBrowser) {
    const controller = ev.target;
    if (!selectStartSkip[controller]) {
      selectStartSkip[controller] = true;
      return;
    }
    selectStartSkip[controller] = false;
  }

  const trigger = ev.target.getObjectByName('trigger');
  trigger.rotation.x = -0.3;
  raycontrol.onSelectStart(ev);
}

function onSelectEnd(ev) {
  if (OculusBrowser) {
    const controller = ev.target;
    if (!selectEndSkip[controller]) {
      selectEndSkip[controller] = true;
      return;
    }
    selectEndSkip[controller] = false;
  }

  const trigger = ev.target.getObjectByName('trigger');
  trigger.rotation.x = 0;
  raycontrol.onSelectEnd(ev);
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  var delta = clock.getDelta();
  var elapsedTime = clock.elapsedTime;

  ecsyWorld.execute(delta, elapsedTime);

  for (let i = 0; i < controllers.length; i++) {
    const model = controllers[i].getObjectByName('Scene');
    if (model) {
      controllers[i].boundingBox.setFromObject(model);
    }
  }

  if (!context.vrMode && context.browserControls) {
    const velocity = 3.0;
    const bc = context.browserControls;

    if (bc.controls.isLocked) {
      if (bc.moveForward()) context.camera.translateZ(-velocity * delta);
      if (bc.moveBackward()) context.camera.translateZ(velocity * delta);
      if (bc.moveLeft()) context.camera.translateX(-velocity * delta);
      if (bc.moveRight()) context.camera.translateX(velocity * delta);
    }
  }

  if (context.raycontrol) {
    context.raycontrol.execute(context, delta, elapsedTime);
  }
  if (typeof context.room !== 'undefined' && rooms[context.room]) {
    const currentRoom = rooms[context.room];
    if (typeof currentRoom.execute === 'function') {
      currentRoom.execute(context, delta, elapsedTime);
    }
  }

  renderer.render(scene, camera);
  if (typeof context.goto !== 'undefined' && context.goto !== null) {
    gotoRoom(context.goto);
    context.goto = null;
  }
}

window.addEventListener('resize', onWindowResize, false);
window.onload = () => {init()};
