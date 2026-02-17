/**
 * ReactionExperiment - Simulates chemical reactions for alkali metals
 * 
 * Implements water and flame reactions for Lithium, Sodium, and Potassium
 * with varying vigor levels and visual effects.
 * 
 * State machine:
 * IDLE -> DROPPING -> REACTING -> BUBBLING -> COMPLETE
 *                  \-> ERROR (from any state)
 */
import * as THREE from 'three';

// Reaction configuration for supported elements
const REACTION_CONFIGS = {
  Li: {
    water: {
      vigor: 'gentle',
      flameColor: 0xFF4444,      // Crimson red
      bubbleIntensity: 0.3,
      reactionTime: 4.0,          // seconds
      hapticIntensity: 0.3,
      waterLevelDrop: 0.1
    },
    flame: {
      flameColor: 0xFF4444,       // Crimson red
      intensity: 0.5
    }
  },
  Na: {
    water: {
      vigor: 'moderate',
      flameColor: 0xFFAA00,       // Bright yellow/orange
      bubbleIntensity: 0.6,
      reactionTime: 3.0,
      hapticIntensity: 0.6,
      waterLevelDrop: 0.2
    },
    flame: {
      flameColor: 0xFFAA00,       // Bright yellow
      intensity: 0.7
    }
  },
  K: {
    water: {
      vigor: 'vigorous',
      flameColor: 0x8844FF,       // Violet
      bubbleIntensity: 1.0,
      reactionTime: 2.0,
      hapticIntensity: 1.0,
      waterLevelDrop: 0.3
    },
    flame: {
      flameColor: 0x8844FF,       // Violet
      intensity: 1.0
    }
  }
};

class ReactionExperiment {
  // Custom reaction states
  static STATES = {
    IDLE: 'IDLE',
    DROPPING: 'DROPPING',
    REACTING: 'REACTING',
    BUBBLING: 'BUBBLING',
    COMPLETE: 'COMPLETE',
    ERROR: 'ERROR'
  };

  /**
   * Get reaction configuration for an element and reaction type
   * @param {string} elementSymbol - Element symbol (Li, Na, K)
   * @param {string} reactionType - Reaction type (water, flame)
   * @returns {Object|null} Configuration object or null if not supported
   */
  static getReactionConfig(elementSymbol, reactionType) {
    var elementConfig = REACTION_CONFIGS[elementSymbol];
    if (!elementConfig) {
      return null;
    }
    var reactionConfig = elementConfig[reactionType];
    if (!reactionConfig) {
      return null;
    }
    return reactionConfig;
  }

  constructor(options) {
    options = options || {};
    
    this._state = ReactionExperiment.STATES.IDLE;
    this._errorMessage = null;
    this._stateChangeCallback = null;
    
    // Configuration
    this._elementSymbol = null;
    this._reactionType = null;
    this._config = null;
    
    // Dependencies
    this._audioManager = options.audioManager || null;
    
    // Visual elements
    this._meshes = [];
    this._waterMesh = null;
    this._flameMeshes = [];
    this._bubbleParticles = null;
    
    // Timing
    this._reactionTimer = 0;
    this._bubbleTimer = 0;
    
    // Haptic feedback
    this._hapticActuator = null;
  }

  /**
   * Current state of the experiment
   */
  get state() {
    return this._state;
  }

  set state(newState) {
    if (!Object.values(ReactionExperiment.STATES).includes(newState)) {
      throw new Error('Invalid state: ' + newState);
    }
    this._state = newState;
  }

  /**
   * Error message if in ERROR state
   */
  get errorMessage() {
    return this._errorMessage;
  }

  set errorMessage(msg) {
    this._errorMessage = msg;
  }

  /**
   * Current element symbol
   */
  get elementSymbol() {
    return this._elementSymbol;
  }

  /**
   * Current reaction type
   */
  get reactionType() {
    return this._reactionType;
  }

  /**
   * Register callback for state changes
   * @param {Function} callback - Called with (newState, oldState)
   */
  onStateChange(callback) {
    this._stateChangeCallback = callback;
  }

  /**
   * Internal: Transition to new state with validation
   */
  _transition(newState) {
    var oldState = this._state;
    this._state = newState;
    if (this._stateChangeCallback) {
      this._stateChangeCallback(newState, oldState);
    }
    return true;
  }

  /**
   * Configure the experiment with element and reaction type
   * @param {string} elementSymbol - Element symbol (Li, Na, K)
   * @param {string} reactionType - Reaction type (water, flame)
   * @returns {boolean} True if configuration succeeded
   */
  configure(elementSymbol, reactionType) {
    // Cannot configure while not idle
    if (this._state !== ReactionExperiment.STATES.IDLE) {
      return false;
    }
    
    var config = ReactionExperiment.getReactionConfig(elementSymbol, reactionType);
    if (!config) {
      return false;
    }
    
    this._elementSymbol = elementSymbol;
    this._reactionType = reactionType;
    this._config = config;
    return true;
  }

  /**
   * Start the experiment (IDLE -> DROPPING)
   * @returns {boolean} True if transition succeeded
   */
  start() {
    if (this._state !== ReactionExperiment.STATES.IDLE) {
      return false;
    }
    
    // Must be configured first
    if (!this._config) {
      return false;
    }
    
    this._transition(ReactionExperiment.STATES.DROPPING);
    this._playSound('start');
    this.onStart();
    return true;
  }

  /**
   * Drop the element into water (DROPPING -> REACTING)
   * @returns {boolean} True if transition succeeded
   */
  drop() {
    if (this._state !== ReactionExperiment.STATES.DROPPING) {
      return false;
    }
    
    this._transition(ReactionExperiment.STATES.REACTING);
    this._reactionTimer = 0;
    this._triggerHapticFeedback();
    return true;
  }

  /**
   * Start the chemical reaction phase (REACTING -> BUBBLING)
   * @returns {boolean} True if transition succeeded
   */
  react() {
    if (this._state !== ReactionExperiment.STATES.REACTING) {
      return false;
    }
    
    this._transition(ReactionExperiment.STATES.BUBBLING);
    this._playSound('progress');
    this._bubbleTimer = 0;
    return true;
  }

  /**
   * Complete the bubbling phase (BUBBLING -> COMPLETE)
   * @returns {boolean} True if transition succeeded
   */
  bubble() {
    if (this._state !== ReactionExperiment.STATES.BUBBLING) {
      return false;
    }
    
    this._transition(ReactionExperiment.STATES.COMPLETE);
    this._playSound('complete');
    this.onComplete();
    return true;
  }

  /**
   * Reset experiment to initial state (any -> IDLE)
   */
  reset() {
    this._errorMessage = null;
    this._elementSymbol = null;
    this._reactionType = null;
    this._config = null;
    this._reactionTimer = 0;
    this._bubbleTimer = 0;
    this._transition(ReactionExperiment.STATES.IDLE);
  }

  /**
   * Transition to error state (any -> ERROR)
   * @param {string} message - Error description
   */
  error(message) {
    this._errorMessage = message;
    this._transition(ReactionExperiment.STATES.ERROR);
  }

  /**
   * Get haptic intensity based on reaction vigor
   * @returns {number} Haptic intensity 0-1
   */
  getHapticIntensity() {
    if (!this._config) {
      return 0;
    }
    return this._config.hapticIntensity || 0;
  }

  /**
   * Update the experiment (called each frame)
   * @param {number} delta - Time since last frame in seconds
   */
  update(delta) {
    if (this._state === ReactionExperiment.STATES.REACTING) {
      this._updateReacting(delta);
      this.onUpdate(delta);
    } else if (this._state === ReactionExperiment.STATES.BUBBLING) {
      this._updateBubbling(delta);
      this.onUpdate(delta);
    }
    // Only call onUpdate when in REACTING or BUBBLING state
  }

  /**
   * Update during REACTING state
   * @param {number} delta - Time since last frame
   */
  _updateReacting(delta) {
    if (!this._config) {
      return;
    }
    
    this._reactionTimer += delta;
    
    // Auto-transition to BUBBLING after reaction time
    if (this._reactionTimer >= this._config.reactionTime) {
      this.react();
    }
    
    // Update visual effects
    this._updateWaterLevel(delta);
    this._updateFlameEffect(delta);
  }

  /**
   * Update during BUBBLING state
   * @param {number} delta - Time since last frame
   */
  _updateBubbling(delta) {
    if (!this._config) {
      return;
    }
    
    this._bubbleTimer += delta;
    
    // Bubbling phase lasts 2 seconds
    if (this._bubbleTimer >= 2.0) {
      this.bubble();
    }
    
    // Update bubble particles
    this._updateBubbles(delta);
  }

  /**
   * Update water level during reaction
   * @param {number} delta - Time since last frame
   */
  _updateWaterLevel(delta) {
    if (!this._waterMesh || !this._config) {
      return;
    }
    // Animate water level dropping
    var currentScale = this._waterMesh.scale.y;
    var targetScale = 1.0 - (this._config.waterLevelDrop || 0);
    this._waterMesh.scale.y = Math.max(targetScale, currentScale - delta * 0.1);
  }

  /**
   * Update flame effect during reaction
   * @param {number} delta - Time since last frame
   */
  _updateFlameEffect(delta) {
    for (var i = 0; i < this._flameMeshes.length; i++) {
      var flame = this._flameMeshes[i];
      if (flame) {
        // Flicker effect
        flame.scale.y = 1.0 + Math.sin(Date.now() * 0.01 + i) * 0.2;
        flame.material.opacity = 0.5 + Math.sin(Date.now() * 0.02 + i) * 0.2;
      }
    }
  }

  /**
   * Update bubble particles during bubbling phase
   * @param {number} delta - Time since last frame
   */
  _updateBubbles(delta) {
    if (!this._bubbleParticles || !this._config) {
      return;
    }
    // Animate bubbles rising
    var positions = this._bubbleParticles.geometry.attributes.position;
    if (positions) {
      for (var i = 0; i < positions.count; i++) {
        positions.array[i * 3 + 1] += delta * (1 + Math.random()) * this._config.bubbleIntensity;
        // Reset bubbles that rise too high
        if (positions.array[i * 3 + 1] > 3) {
          positions.array[i * 3 + 1] = 0;
        }
      }
      positions.needsUpdate = true;
    }
  }

  /**
   * Play sound via audio manager
   * @param {string} eventType - Event type (start, progress, complete, error)
   */
  _playSound(eventType) {
    if (this._audioManager) {
      this._audioManager.playExperimentSound('reaction', eventType);
    }
  }

  /**
   * Trigger haptic feedback on controller
   */
  _triggerHapticFeedback() {
    if (this._hapticActuator && this._config) {
      var intensity = this._config.hapticIntensity || 0.5;
      this._hapticActactor.pulse(intensity, 100);
    }
  }

  /**
   * Set haptic actuator for controller vibration
   * @param {GamepadHapticActuator} actuator - WebXR haptic actuator
   */
  setHapticActuator(actuator) {
    this._hapticActuator = actuator;
  }

  /**
   * Render visual elements to scene
   * @param {THREE.Scene} scene - Three.js scene to render into
   */
  render(scene) {
    if (!scene || !this._config) {
      return;
    }
    
    // Clear existing meshes
    this._clearMeshes(scene);
    
    // Create water cylinder for water reactions
    if (this._reactionType === 'water') {
      this._createWaterMesh(scene);
      this._createBubbleParticles(scene);
    }
    
    // Create flame meshes for both reaction types
    this._createFlameMeshes(scene);
  }

  /**
   * Clear existing meshes from scene
   * @param {THREE.Scene} scene - Three.js scene
   */
  _clearMeshes(scene) {
    for (var i = 0; i < this._meshes.length; i++) {
      scene.remove(this._meshes[i]);
    }
    this._meshes = [];
    this._waterMesh = null;
    this._flameMeshes = [];
    this._bubbleParticles = null;
  }

  /**
   * Create water mesh for water reactions
   * @param {THREE.Scene} scene - Three.js scene
   */
  _createWaterMesh(scene) {
    var waterGeo = new THREE.CylinderGeometry(1, 1, 3, 32);
    var waterMat = new THREE.MeshBasicMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.5
    });
    this._waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this._waterMesh.position.set(0, 1.5, 0.8);
    this._waterMesh.name = 'water';
    scene.add(this._waterMesh);
    this._meshes.push(this._waterMesh);
  }

  /**
   * Create flame meshes for reaction visualization
   * @param {THREE.Scene} scene - Three.js scene
   */
  _createFlameMeshes(scene) {
    var flameColor = this._config.flameColor || 0xFFAA00;
    
    for (var i = 0; i < 3; i++) {
      var flameGeo = new THREE.ConeGeometry(0.1, 0.5, 16);
      var flameMat = new THREE.MeshBasicMaterial({
        color: flameColor,
        transparent: true,
        opacity: 0.7
      });
      var flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(-0.3 + i * 0.3, 0.5, 0);
      flame.name = 'flame_' + i;
      flame.visible = false; // Hidden until reaction starts
      scene.add(flame);
      this._flameMeshes.push(flame);
      this._meshes.push(flame);
    }
  }

  /**
   * Create bubble particles for water reactions
   * @param {THREE.Scene} scene - Three.js scene
   */
  _createBubbleParticles(scene) {
    var bubbleCount = 50;
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(bubbleCount * 3);
    
    for (var i = 0; i < bubbleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5;     // x
      positions[i * 3 + 1] = Math.random() * 2;            // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;  // z
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    var material = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    
    this._bubbleParticles = new THREE.Points(geometry, material);
    this._bubbleParticles.position.set(0, 1.5, 0.8);
    this._bubbleParticles.visible = false;
    scene.add(this._bubbleParticles);
    this._meshes.push(this._bubbleParticles);
  }

  /**
   * Show/hide flame effect based on state
   * @param {boolean} visible - Whether flames should be visible
   */
  setFlameVisible(visible) {
    for (var i = 0; i < this._flameMeshes.length; i++) {
      if (this._flameMeshes[i]) {
        this._flameMeshes[i].visible = visible;
      }
    }
  }

  /**
   * Show/hide bubble effect based on state
   * @param {boolean} visible - Whether bubbles should be visible
   */
  setBubblesVisible(visible) {
    if (this._bubbleParticles) {
      this._bubbleParticles.visible = visible;
    }
  }

  // Hook methods - override in subclass or assign directly

  /**
   * Called when experiment starts (after transition to DROPPING)
   */
  onStart() {
    // Override in subclass or assign directly
  }

  /**
   * Called each frame while REACTING or BUBBLING
   * @param {number} delta - Time since last frame
   */
  onUpdate(delta) {
    // Override in subclass or assign directly
  }

  /**
   * Called when experiment completes
   */
  onComplete() {
    // Override in subclass or assign directly
  }
}

export default ReactionExperiment;
