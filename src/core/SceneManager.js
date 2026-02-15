import * as THREE from 'three';
import { CAMERA_DEFAULTS, RENDERER_DEFAULTS, LIGHT_DEFAULTS, ASSET_PATHS } from './config.js';

export class SceneManager {
  constructor() {
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.cameraRig = null;
    this.parent = null;
    this.clock = new THREE.Clock();
  }

  init() {
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initCameraRig();
    this.initLights();
    this.initEnvironment();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: RENDERER_DEFAULTS.antialias,
      logarithmicDepthBuffer: RENDERER_DEFAULTS.logarithmicDepthBuffer,
      powerPreference: 'high-performance'
    });
    this.renderer.gammaFactor = RENDERER_DEFAULTS.gammaFactor;
    this.renderer.outputEncoding = RENDERER_DEFAULTS.outputEncoding;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    
    // Enable shadow maps for better visual quality
    this.renderer.shadowMap.enabled = false; // Disabled for VR performance
    
    // Tone mapping for better color reproduction
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.parent = new THREE.Object3D();
    this.scene.add(this.parent);
    
    // Enable frustum culling optimization
    this.scene.autoUpdate = true;
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
    
    // Enable layers for selective rendering
    this.camera.layers.enable(0); // Default layer
  }

  initCameraRig() {
    this.cameraRig = new THREE.Group();
    this.cameraRig.add(this.camera);
    this.cameraRig.position.set(0, 0, 0);
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
    
    // Add subtle ambient light for better fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    ambientLight.name = 'ambient';
    this.scene.add(ambientLight);
  }
  
  initEnvironment() {
    // Initialize fog for depth perception (can be overridden per room)
    this.scene.fog = null;
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
    const delta = this.clock.getDelta();
    
    // Update frustum culling
    this.scene.updateMatrixWorld(true);
    
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
  
  getDelta() {
    return this.clock.getDelta();
  }
  
  getElapsedTime() {
    return this.clock.getElapsedTime();
  }
}
