import * as THREE from 'three';
import { CONTROLLER_RAYCASTER } from './config.js';

export class Controllers {
  constructor(renderer, context, handedness, onSelectStart, onSelectEnd) {
    this.renderer = renderer;
    this.context = context;
    this.handedness = handedness;
    this.onSelectStart = onSelectStart;
    this.onSelectEnd = onSelectEnd;
    this.controllers = [];
    this.setupControllers();
  }

  setupControllers() {
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      controller.raycaster = new THREE.Raycaster();
      controller.raycaster.near = CONTROLLER_RAYCASTER.near;
      controller.boundingBox = new THREE.Box3();
      controller.userData.grabbing = null;

      controller.addEventListener('selectstart', this.onSelectStart);
      controller.addEventListener('selectend', this.onSelectEnd);

      controller.addEventListener('connected', (event) => {
        this.setupControllerModel(controller, event.data);
      });

      controller.addEventListener('disconnect', () => {
        if (controller.children.length > 0) {
          controller.remove(controller.children[0]);
        }
        if (this.context.raycontrol) {
          this.context.raycontrol.removeController(controller, event.data);
        }
      });

      this.controllers.push(controller);
    }
  }

  setupControllerModel(controller, data) {
    const assets = this.context.assets;
    if (!assets['generic_controller_model']) {
      console.warn('Controller model not loaded');
      return;
    }

    const model = assets['generic_controller_model'].scene.clone();
    const material = new THREE.MeshLambertMaterial({
      map: assets['controller_tex'],
    });

    const body = model.getObjectByName('body');
    const trigger = model.getObjectByName('trigger');

    if (body) body.material = material;
    if (trigger) trigger.material = material;

    controller.add(model);
    if (this.context.raycontrol) {
      this.context.raycontrol.addController(controller, data);
    }
  }

  updateBoundingBoxes() {
    for (let i = 0; i < this.controllers.length; i++) {
      const model = this.controllers[i].getObjectByName('Scene');
      if (model) {
        this.controllers[i].boundingBox.setFromObject(model);
      }
    }
  }

  getControllers() {
    return this.controllers;
  }

  getController(index) {
    return this.controllers[index];
  }
}
