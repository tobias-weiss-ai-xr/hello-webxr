import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

import { World } from 'ecsy';
import { SDFTextSystem } from '../systems/SDFTextSystem.js';
import { DebugHelperSystem } from '../systems/DebugHelperSystem.js';
import { AreaCheckerSystem } from '../systems/AreaCheckerSystem.js';
import { ControllersSystem } from '../systems/ControllersSystem.js';
import HierarchySystem from '../systems/HierarchySystem.js';
import TransformSystem from '../systems/TransformSystem.js';
import BillboardSystem from '../systems/BillboardSystem.js';

import SystemsGroup from '../systems/SystemsGroup.js';
import { VRButton } from '../lib/VRButton.js';
import { slideshow } from '../lib/slideshow.js';
import { loadAssets } from '../lib/assetManager.js';
import RayControl from '../lib/RayControl.js';
import Teleport from '../lib/Teleport.js';

import assets from '../assets.js';
import { shaders } from '../lib/shaders.js';
import { Text, Object3D, AreaChecker } from '../components/index.js';

import { SceneManager } from './SceneManager.js';
import { RoomManager } from './RoomManager.js';
import { Controllers } from './Controllers.js';
import { AudioManager } from './AudioManager.js';
import { ROOMS, DEBUG_KEYS } from './config.js';

import WebXRPolyfill from 'webxr-polyfill';

const polyfill = new WebXRPolyfill();

export class App {
  constructor() {
    this.clock = new THREE.Clock();
    this.vrMode = false;
    this.debug = false;
    this.handedness = 'right';
    this.context = {};
  }

  init() {
    this.parseURL();
    this.detectWebXR();
    this.setupECSY();
    this.setupScene();
    this.setupAudio();
    this.setupControllers();
    this.setupControls();
    this.setupAssets();
  }

  parseURL() {
    const url = new URL(window.location);
    const roomName = url.searchParams.get('room');
    this.startRoomIndex = ROOMS.indexOf(roomName) !== -1 ? ROOMS.indexOf(roomName) : 0;
    this.debug = url.searchParams.has('debug');
    this.handedness = url.searchParams.has('handedness') ? url.searchParams.get('handedness') : 'right';
  }

  detectWebXR() {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr').then(supported => {
        if (!supported) {
          document.getElementById('no-webxr').classList.remove('hidden');
        }
      });
    } else {
      document.getElementById('no-webxr').classList.remove('hidden');
    }
  }

  setupECSY() {
    this.ecsyWorld = new World();
    this.ecsyWorld
      .registerSystem(SDFTextSystem)
      .registerSystem(AreaCheckerSystem)
      .registerSystem(ControllersSystem)
      .registerSystem(DebugHelperSystem)
      .registerSystem(TransformSystem)
      .registerSystem(BillboardSystem)
      .registerSystem(HierarchySystem);

    this.systemsGroup = {};
    this.systemsGroup['roomHall'] = new SystemsGroup(this.ecsyWorld, [
      AreaCheckerSystem, ControllersSystem, DebugHelperSystem
    ]);
  }

  setupScene() {
    this.sceneManager = new SceneManager();
    this.sceneManager.init();
    this.sceneManager.getScene().add(this.sceneManager.getCameraRig());
  }

  setupAudio() {
    const listener = new THREE.AudioListener();
    this.sceneManager.getCamera().add(listener);
    this.audioManager = new AudioManager(listener);
  }

  setupControllers() {
    const OculusBrowser = navigator.userAgent.indexOf("OculusBrowser") !== -1 &&
      parseInt(navigator.userAgent.match(/OculusBrowser\/([0-9]+)./)[1]) < 8;

    const handleSelectStart = (ev) => this.onSelectStart(ev, OculusBrowser);
    const handleSelectEnd = (ev) => this.onSelectEnd(ev, OculusBrowser);

    this.controllers = new Controllers(
      this.sceneManager.getRenderer(),
      this.context,
      this.handedness,
      handleSelectStart,
      handleSelectEnd
    );

    this.controllers.getControllers().forEach(controller => {
      this.sceneManager.getCameraRig().add(controller);
    });
  }

  setupControls() {
    if (!this.debug) {
      return;
    }

    this.controls = new PointerLockControls(
      this.sceneManager.getCamera(),
      this.sceneManager.getRenderer().domElement
    );
    this.sceneManager.getScene().add(this.controls.getObject());

    document.body.addEventListener('click', () => this.controls.lock());
    document.body.addEventListener('keydown', (ev) => this.handleDebugKeys(ev));
  }

  handleDebugKeys(ev) {
    switch (ev.keyCode) {
      case DEBUG_KEYS.forward:
        this.controls.moveForward(0.2);
        break;
      case DEBUG_KEYS.left:
        this.controls.moveRight(-0.2);
        break;
      case DEBUG_KEYS.backward:
        this.controls.moveForward(-0.2);
        break;
      case DEBUG_KEYS.right:
        this.controls.moveRight(0.2);
        break;
      case DEBUG_KEYS.nextRoom:
        this.roomManager.enterRoom((this.roomManager.getCurrentRoomIndex() + 1) % this.roomManager.rooms.length);
        break;
      default: {
        const room = ev.keyCode - 48;
        if (!ev.metaKey && room >= 0 && room < this.roomManager.rooms.length) {
          this.roomManager.enterRoom(room);
        }
      }
    }
  }

  setupAssets() {
    const context = this.buildContext();

    document.getElementById(this.handedness + 'hand').classList.add('activehand');

    const loadTotal = Object.keys(assets).length;

    loadAssets(
      this.sceneManager.getRenderer(),
      'assets/',
      assets,
      () => this.onAssetsLoaded(context),
      (loadProgress) => {
        document.querySelector('#progressbar').setAttribute('stroke-dashoffset',
          -(282 - Math.floor(loadProgress / loadTotal * 282)));
      },
      this.debug
    );
  }

  buildContext() {
    const context = {
      vrMode: this.vrMode,
      assets: assets,
      shaders: shaders,
      scene: this.sceneManager.getParent(),
      renderer: this.sceneManager.getRenderer(),
      camera: this.sceneManager.getCamera(),
      audioListener: this.audioManager.listener,
      goto: null,
      cameraRig: this.sceneManager.getCameraRig(),
      controllers: this.controllers.getControllers(),
      world: this.ecsyWorld,
      systemsGroup: this.systemsGroup,
      handedness: this.handedness,
      audioManager: this.audioManager,
    };

    this.context = context;
    window.context = context;
    return context;
  }

  onAssetsLoaded(context) {
    this.setupInteractions(context);
    this.roomManager = new RoomManager(context);
    this.roomManager.setup();
    this.roomManager.enterRoom(this.startRoomIndex);

    slideshow.setup(context);

    document.body.appendChild(this.sceneManager.getDomElement());
    document.body.appendChild(VRButton.createButton(this.sceneManager.getRenderer(), (status) => {
      this.onVRStatusChange(status);
    }));

    this.sceneManager.getRenderer().setAnimationLoop(() => this.animate());
    document.getElementById('loading').style.display = 'none';
  }

  setupInteractions(context) {
    this.raycontrol = new RayControl(context, this.handedness);
    context.raycontrol = this.raycontrol;

    this.teleport = new Teleport(context);
    context.teleport = this.teleport;
  }

  onVRStatusChange(status) {
    this.vrMode = status === 'sessionStarted';
    context.vrMode = this.vrMode;

    if (this.vrMode) {
      this.roomManager.enterRoom(0);
      this.context.cameraRig.position.set(0, 0, 2);
      this.context.goto = null;
    } else {
      slideshow.setup(this.context);
    }
  }

  onSelectStart(ev, OculusBrowser) {
    if (OculusBrowser) {
      const controller = ev.target;
      if (!this.selectStartSkip) {
        this.selectStartSkip = {};
      }
      if (!this.selectStartSkip[controller]) {
        this.selectStartSkip[controller] = true;
        return;
      }
      this.selectStartSkip[controller] = false;
    }

    const trigger = ev.target.getObjectByName('trigger');
    if (trigger) {
      trigger.rotation.x = -0.3;
    }
    this.raycontrol.onSelectStart(ev);
  }

  onSelectEnd(ev, OculusBrowser) {
    if (OculusBrowser) {
      const controller = ev.target;
      if (!this.selectEndSkip) {
        this.selectEndSkip = {};
      }
      if (!this.selectEndSkip[controller]) {
        this.selectEndSkip[controller] = true;
        return;
      }
      this.selectEndSkip[controller] = false;
    }

    const trigger = ev.target.getObjectByName('trigger');
    if (trigger) {
      trigger.rotation.x = 0;
    }
    this.raycontrol.onSelectEnd(ev);
  }

  animate() {
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.elapsedTime;

    this.ecsyWorld.execute(delta, elapsedTime);
    this.controllers.updateBoundingBoxes();

    this.context.raycontrol.execute(this.context, delta, elapsedTime);
    this.roomManager.execute(delta, elapsedTime);

    if (!this.vrMode) {
      slideshow.execute(this.context, delta, elapsedTime);
    }

    this.sceneManager.render();

    if (this.context.goto !== null) {
      this.roomManager.enterRoom(this.context.goto);
      this.context.goto = null;
    }
  }
}

export function init() {
  const app = new App();
  app.init();
}
