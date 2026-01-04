import * as THREE from 'three';
import { CAMERA_DEFAULTS, RENDERER_DEFAULTS, LIGHT_DEFAULTS, ASSET_PATHS } from './config.js';

export class SceneManager {
  constructor() {
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.cameraRig = null;
    this.parent = null;
  }

  init() {
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initCameraRig();
    this.initLights();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: RENDERER_DEFAULTS.antialias,
      logarithmicDepthBuffer: RENDERER_DEFAULTS.logarithmicDepthBuffer
    });
    this.renderer.gammaFactor = RENDERER_DEFAULTS.gammaFactor;
    this.renderer.outputEncoding = RENDERER_DEFAULTS.outputEncoding;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.parent = new THREE.Object3D();
    this.scene.add(this.parent);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_DEFAULTS.fov,
      window.innerWidth / window.innerHeight,
      CAMERA_DEFAULTS.near,
      CAMERA_DEFAULTS.far
    );
    this.camera.position.set(
      CAMERA_DEFAULTS.position.x,
      CAMERA_DEFAULTS.position.y,
      CAMERA_DEFAULTS.position.z
    );
  }

  initCameraRig() {
    this.cameraRig = new THREE.Group();
    this.cameraRig.add(this.camera);
    this.cameraRig.position.set(0, 0, 2);
  }

  initLights() {
    const sunLight = new THREE.DirectionalLight(LIGHT_DEFAULTS.sun.color);
    sunLight.name = 'sun';
    sunLight.position.copy(LIGHT_DEFAULTS.sun.position);

    const fillLight = new THREE.DirectionalLight(
      LIGHT_DEFAULTS.fill.color,
      LIGHT_DEFAULTS.fill.intensity
    );
    fillLight.name = 'fillLight';
    fillLight.position.copy(LIGHT_DEFAULTS.fill.position);

    this.scene.add(sunLight, fillLight);
  }

  addCameraListener(listener) {
    this.camera.add(listener);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  getScene() {
    return this.scene;
  }

  getRenderer() {
    return this.renderer;
  }

  getCamera() {
    return this.camera;
  }

  getCameraRig() {
    return this.cameraRig;
  }

  getParent() {
    return this.parent;
  }

  getDomElement() {
    return this.renderer.domElement;
  }
}
