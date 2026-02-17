/**
 * ElectrochemicalExperiment - VR visualization for electrochemical processes
 * 
 * Supports three experiment types:
 * - Battery: Li-ion battery discharge simulation
 * - Electrolysis: Water electrolysis (H2O -> H2 + O2)
 * - Galvanic: Zn-Cu galvanic cell electron flow
 * 
 * Internal modes: IDLE -> CHARGING -> DISCHARGING -> COMPLETE
 * Base states follow ExperimentBase state machine
 */

import ExperimentBase from './ExperimentBase.js';

class ElectrochemicalExperiment extends ExperimentBase {
  // Experiment modes (internal to this experiment)
  static MODES = {
    IDLE: 'IDLE',
    CHARGING: 'CHARGING',
    DISCHARGING: 'DISCHARGING',
    COMPLETE: 'COMPLETE'
  };

  // Available experiment types
  static TYPES = {
    BATTERY: 'battery',
    ELECTROLYSIS: 'electrolysis',
    GALVANIC: 'galvanic'
  };

  constructor(type) {
    super();
    
    // Experiment type (default to battery)
    this.experimentType = type || ElectrochemicalExperiment.TYPES.BATTERY;
    
    // Internal mode
    this._mode = ElectrochemicalExperiment.MODES.IDLE;
    
    // Audio and haptics
    this.audioManager = null;
    this._hapticCallback = null;
    
    // Visualization meshes
    this.meshes = [];
    this._scene = null;
    
    // Initialize based on type
    this._initializeForType();
  }

  /**
   * Initialize experiment-specific properties based on type
   */
  _initializeForType() {
    // Common properties
    this.elapsedTime = 0;
    
    switch (this.experimentType) {
      case ElectrochemicalExperiment.TYPES.BATTERY:
        this._initBattery();
        break;
      case ElectrochemicalExperiment.TYPES.ELECTROLYSIS:
        this._initElectrolysis();
        break;
      case ElectrochemicalExperiment.TYPES.GALVANIC:
        this._initGalvanic();
        break;
      default:
        this._initBattery();
    }
  }

  _initBattery() {
    this.batteryCharge = 1.0;
    this.dischargeRate = 0.05; // 5% per second
  }

  _initElectrolysis() {
    this.hydrogenBubbles = [];
    this.oxygenBubbles = [];
    this.hydrogenBubbleCount = 0;
    this.oxygenBubbleCount = 0;
    this.bubbleGenerationRate = 2; // bubbles per second
    this.completionTime = 30; // seconds until complete
  }

  _initGalvanic() {
    this.anode = 'Zn';
    this.cathode = 'Cu';
    this.zincLevel = 1.0;
    this.zincDepletionRate = 0.02; // 2% per second
    this.currentFlow = 0;
    this.maxCurrent = 1.0;
    this.electronFlowDirection = 'anode-to-cathode';
  }

  /**
   * Current internal mode
   */
  get mode() {
    return this._mode;
  }

  set mode(newMode) {
    this._mode = newMode;
  }

  /**
   * Set audio manager for sound playback
   */
  setAudioManager(manager) {
    this.audioManager = manager;
  }

  /**
   * Set haptic feedback callback
   */
  setHapticCallback(callback) {
    this._hapticCallback = callback;
  }

  /**
   * Trigger haptic feedback
   */
  triggerHaptic(eventType) {
    if (this._hapticCallback) {
      this._hapticCallback(eventType);
    }
  }

  /**
   * Play sound via audio manager
   */
  _playSound(eventType) {
    if (this.audioManager && this.audioManager.playExperimentSound) {
      this.audioManager.playExperimentSound('electrochemical', eventType);
    }
  }

  /**
   * Called when experiment starts (after transition to PREPARING)
   */
  onStart() {
    this.mode = ElectrochemicalExperiment.MODES.CHARGING;
    this._playSound('start');
  }

  /**
   * Override prepare() to transition mode to DISCHARGING
   */
  prepare() {
    var result = super.prepare();
    if (result) {
      this.mode = ElectrochemicalExperiment.MODES.DISCHARGING;
    }
    return result;
  }

  /**
   * Called each frame while RUNNING
   */
  onUpdate(delta) {
    this.elapsedTime += delta;
    
    switch (this.experimentType) {
      case ElectrochemicalExperiment.TYPES.BATTERY:
        this._updateBattery(delta);
        break;
      case ElectrochemicalExperiment.TYPES.ELECTROLYSIS:
        this._updateElectrolysis(delta);
        break;
      case ElectrochemicalExperiment.TYPES.GALVANIC:
        this._updateGalvanic(delta);
        break;
    }
  }

  /**
   * Update battery discharge
   */
  _updateBattery(delta) {
    this.batteryCharge -= this.dischargeRate * delta;
    
    // Clamp to 0
    if (this.batteryCharge < 0) {
      this.batteryCharge = 0;
    }
    
    // Update charge bar visualization
    this._updateChargeBar();
    
    // Trigger haptic pulse as battery depletes
    if (this.batteryCharge < 0.5 && Math.random() < delta) {
      this.triggerHaptic('discharge');
    }
    
    // Complete when battery is empty
    if (this.batteryCharge <= 0) {
      this.mode = ElectrochemicalExperiment.MODES.COMPLETE;
      this.complete();
    }
  }

  /**
   * Update electrolysis process
   */
  _updateElectrolysis(delta) {
    // Generate bubbles based on time
    const bubblesToGenerate = this.bubbleGenerationRate * delta;
    
    // H2O -> 2H2 + O2, so 2:1 ratio
    const hydrogenBubbles = bubblesToGenerate * 2;
    const oxygenBubbles = bubblesToGenerate * 1;
    
    // Add to counts (with some randomness)
    this.hydrogenBubbleCount += Math.floor(hydrogenBubbles) + (Math.random() < (hydrogenBubbles % 1) ? 1 : 0);
    this.oxygenBubbleCount += Math.floor(oxygenBubbles) + (Math.random() < (oxygenBubbles % 1) ? 1 : 0);
    
    // Create bubble objects for visualization
    for (let i = 0; i < hydrogenBubbles; i++) {
      this.hydrogenBubbles.push({
        position: { x: -0.5, y: 0, z: 0 },
        velocity: { x: 0, y: 0.5, z: 0 },
        size: 0.05 + Math.random() * 0.05
      });
    }
    
    for (let i = 0; i < oxygenBubbles; i++) {
      this.oxygenBubbles.push({
        position: { x: 0.5, y: 0, z: 0 },
        velocity: { x: 0, y: 0.5, z: 0 },
        size: 0.05 + Math.random() * 0.05
      });
    }
    
    // Update bubble positions
    this._updateBubbles(delta);
    
    // Play bubbling sound occasionally
    if (Math.random() < delta * 2) {
      this._playSound('bubbling');
    }
    
    // Complete after sufficient time
    if (this.elapsedTime >= this.completionTime) {
      this.mode = ElectrochemicalExperiment.MODES.COMPLETE;
      this.complete();
    }
  }

  /**
   * Update bubble positions and remove off-screen bubbles
   */
  _updateBubbles(delta) {
    // Update hydrogen bubbles
    this.hydrogenBubbles = this.hydrogenBubbles.filter(function(bubble) {
      bubble.position.y += bubble.velocity.y * delta;
      return bubble.position.y < 2; // Remove when too high
    });
    
    // Update oxygen bubbles
    this.oxygenBubbles = this.oxygenBubbles.filter(function(bubble) {
      bubble.position.y += bubble.velocity.y * delta;
      return bubble.position.y < 2;
    });
  }

  /**
   * Update galvanic cell
   */
  _updateGalvanic(delta) {
    // Calculate current flow based on zinc level
    this.currentFlow = this.maxCurrent * this.zincLevel;
    
    // Deplete zinc
    this.zincLevel -= this.zincDepletionRate * delta;
    
    if (this.zincLevel < 0) {
      this.zincLevel = 0;
    }
    
    // Update visualization
    this._updateGalvanicVisualization();
    
    // Trigger haptic for electron flow
    if (Math.random() < delta * 5) {
      this.triggerHaptic('electron-flow');
    }
    
    // Play electrical hum
    if (Math.random() < delta * 0.5) {
      this._playSound('hum');
    }
    
    // Complete when zinc is depleted
    if (this.zincLevel <= 0) {
      this.currentFlow = 0;
      this.mode = ElectrochemicalExperiment.MODES.COMPLETE;
      this.complete();
    }
  }

  /**
   * Update charge bar visualization
   */
  _updateChargeBar() {
    if (this.meshes && this.meshes.length > 1) {
      var chargeBar = this.meshes[1];
      if (chargeBar && chargeBar.scale) {
        chargeBar.scale.y = Math.max(0.01, this.batteryCharge);
        
        // Change color based on charge level
        if (chargeBar.material) {
          if (this.batteryCharge > 0.5) {
            chargeBar.material.color.setHex(0x00ff00); // Green
          } else if (this.batteryCharge > 0.2) {
            chargeBar.material.color.setHex(0xffff00); // Yellow
          } else {
            chargeBar.material.color.setHex(0xff0000); // Red
          }
        }
      }
    }
  }

  /**
   * Update galvanic cell visualization
   */
  _updateGalvanicVisualization() {
    // Electron flow visualization would go here
    // For now, just a placeholder for the mesh update
  }

  /**
   * Called when experiment completes
   */
  onComplete() {
    this.mode = ElectrochemicalExperiment.MODES.COMPLETE;
    this._playSound('complete');
    this.triggerHaptic('complete');
  }

  /**
   * Reset experiment to initial state
   */
  reset() {
    super.reset();
    this.mode = ElectrochemicalExperiment.MODES.IDLE;
    this.elapsedTime = 0;
    this._initializeForType();
  }

  /**
   * Render visual elements to scene
   * @param {THREE.Scene} scene - Three.js scene to render into
   */
  render(scene) {
    if (!scene) {
      return;
    }
    
    this._scene = scene;
    
    switch (this.experimentType) {
      case ElectrochemicalExperiment.TYPES.BATTERY:
        this._renderBattery(scene);
        break;
      case ElectrochemicalExperiment.TYPES.ELECTROLYSIS:
        this._renderElectrolysis(scene);
        break;
      case ElectrochemicalExperiment.TYPES.GALVANIC:
        this._renderGalvanic(scene);
        break;
    }
  }

  /**
   * Render battery visualization
   */
  _renderBattery(scene) {
    // Use THREE from global or require
    var THREE = window.THREE;
    if (!THREE) {
      return;
    }
    
    // Create battery body
    var batteryGeo = new THREE.BoxGeometry(0.6, 1, 0.4);
    var batteryMat = new THREE.MeshBasicMaterial({
      color: 0x3498db,
      transparent: true,
      opacity: 0.8
    });
    var battery = new THREE.Mesh(batteryGeo, batteryMat);
    battery.position.set(0, 1.5, 0);
    battery.name = 'battery';
    scene.add(battery);
    this.meshes.push(battery);
    
    // Create charge bar
    var chargeBarGeo = new THREE.BoxGeometry(0.5, 0.8, 0.05);
    var chargeBarMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var chargeBar = new THREE.Mesh(chargeBarGeo, chargeBarMat);
    chargeBar.position.set(0, 2.1, 0);
    chargeBar.name = 'chargeBar';
    scene.add(chargeBar);
    this.meshes.push(chargeBar);
    
    // Create battery terminals
    var terminalGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16);
    var positiveMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    var negativeMat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    
    var positiveTerminal = new THREE.Mesh(terminalGeo, positiveMat);
    positiveTerminal.position.set(0, 2.1, 0);
    positiveTerminal.name = 'positiveTerminal';
    scene.add(positiveTerminal);
    this.meshes.push(positiveTerminal);
    
    var negativeTerminal = new THREE.Mesh(terminalGeo, negativeMat);
    negativeTerminal.position.set(0, 0.9, 0);
    negativeTerminal.name = 'negativeTerminal';
    scene.add(negativeTerminal);
    this.meshes.push(negativeTerminal);
  }

  /**
   * Render electrolysis visualization
   */
  _renderElectrolysis(scene) {
    var THREE = window.THREE;
    if (!THREE) {
      return;
    }
    
    // Create water container
    var containerGeo = new THREE.BoxGeometry(2, 1.5, 1);
    var containerMat = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    var container = new THREE.Mesh(containerGeo, containerMat);
    container.position.set(0, 1, 0);
    container.name = 'waterContainer';
    scene.add(container);
    this.meshes.push(container);
    
    // Create electrodes
    var electrodeGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 16);
    var cathodeMat = new THREE.MeshBasicMaterial({ color: 0x808080 });
    var anodeMat = new THREE.MeshBasicMaterial({ color: 0xc0c0c0 });
    
    // Cathode (hydrogen side, negative)
    var cathode = new THREE.Mesh(electrodeGeo, cathodeMat);
    cathode.position.set(-0.5, 1, 0);
    cathode.name = 'cathode';
    scene.add(cathode);
    this.meshes.push(cathode);
    
    // Anode (oxygen side, positive)
    var anode = new THREE.Mesh(electrodeGeo, anodeMat);
    anode.position.set(0.5, 1, 0);
    anode.name = 'anode';
    scene.add(anode);
    this.meshes.push(anode);
    
    // Create collection tubes above electrodes
    var tubeGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16);
    var tubeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      wireframe: true
    });
    
    var h2Tube = new THREE.Mesh(tubeGeo, tubeMat);
    h2Tube.position.set(-0.5, 1.9, 0);
    h2Tube.name = 'h2Tube';
    scene.add(h2Tube);
    this.meshes.push(h2Tube);
    
    var o2Tube = new THREE.Mesh(tubeGeo, tubeMat);
    o2Tube.position.set(0.5, 1.9, 0);
    o2Tube.name = 'o2Tube';
    scene.add(o2Tube);
    this.meshes.push(o2Tube);
  }

  /**
   * Render galvanic cell visualization
   */
  _renderGalvanic(scene) {
    var THREE = window.THREE;
    if (!THREE) {
      return;
    }
    
    // Create two beakers
    var beakerGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.8, 16);
    var beakerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    
    // Zinc beaker (anode side)
    var zincBeaker = new THREE.Mesh(beakerGeo, beakerMat);
    zincBeaker.position.set(-0.6, 0.6, 0);
    zincBeaker.name = 'zincBeaker';
    scene.add(zincBeaker);
    this.meshes.push(zincBeaker);
    
    // Copper beaker (cathode side)
    var copperBeaker = new THREE.Mesh(beakerGeo, beakerMat);
    copperBeaker.position.set(0.6, 0.6, 0);
    copperBeaker.name = 'copperBeaker';
    scene.add(copperBeaker);
    this.meshes.push(copperBeaker);
    
    // Create zinc electrode
    var zincGeo = new THREE.BoxGeometry(0.08, 0.6, 0.08);
    var zincMat = new THREE.MeshBasicMaterial({ color: 0x7f7f7f });
    var zincElectrode = new THREE.Mesh(zincGeo, zincMat);
    zincElectrode.position.set(-0.6, 0.8, 0);
    zincElectrode.name = 'zincElectrode';
    scene.add(zincElectrode);
    this.meshes.push(zincElectrode);
    
    // Create copper electrode
    var copperGeo = new THREE.BoxGeometry(0.08, 0.6, 0.08);
    var copperMat = new THREE.MeshBasicMaterial({ color: 0xb87333 });
    var copperElectrode = new THREE.Mesh(copperGeo, copperMat);
    copperElectrode.position.set(0.6, 0.8, 0);
    copperElectrode.name = 'copperElectrode';
    scene.add(copperElectrode);
    this.meshes.push(copperElectrode);
    
    // Create salt bridge
    var bridgeGeo = new THREE.TorusGeometry(0.5, 0.05, 8, 16, Math.PI);
    var bridgeMat = new THREE.MeshBasicMaterial({
      color: 0xffc0cb,
      transparent: true,
      opacity: 0.6
    });
    var saltBridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    saltBridge.position.set(0, 1.2, 0);
    saltBridge.rotation.x = Math.PI;
    saltBridge.rotation.z = Math.PI / 2;
    saltBridge.name = 'saltBridge';
    scene.add(saltBridge);
    this.meshes.push(saltBridge);
    
    // Create wire connecting electrodes
    var wireGeo = new THREE.TorusGeometry(0.5, 0.02, 8, 16, Math.PI);
    var wireMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    var wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.set(0, 1.5, 0);
    wire.name = 'wire';
    scene.add(wire);
    this.meshes.push(wire);
    
    // Labels
    this._createLabel(scene, 'Zn (Anode)', -0.6, 0.2, 0);
    this._createLabel(scene, 'Cu (Cathode)', 0.6, 0.2, 0);
  }

  /**
   * Create a text label (placeholder - would need sprite/text geometry)
   */
  _createLabel(scene, text, x, y, z) {
    // Placeholder for text labels
    // In production, this would use THREE.Sprite or TextGeometry
    var labelData = { text: text, position: { x: x, y: y, z: z } };
    this.meshes.push({ type: 'label', data: labelData });
  }

  /**
   * Clean up meshes from scene
   */
  cleanup() {
    if (!this._scene) {
      return;
    }
    
    var self = this;
    this.meshes.forEach(function(mesh) {
      if (mesh && mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh && mesh.material) {
        mesh.material.dispose();
      }
      if (mesh && self._scene) {
        self._scene.remove(mesh);
      }
    });
    
    this.meshes = [];
  }
}

export default ElectrochemicalExperiment;
