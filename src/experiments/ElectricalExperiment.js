/**
 * ElectricalExperiment - Circuit building and electromagnetism experiment
 * 
 * Provides interactive circuit building with:
 * - Wire connections to complete circuit
 * - Conductivity testing with different materials
 * - Magnetic field visualization with iron filings pattern
 * 
 * Phase Flow:
 * IDLE -> CONNECTING -> FLOWING -> MEASURING -> COMPLETE
 * 
 * Uses ExperimentBase states with internal phase tracking.
 */
import ExperimentBase from './ExperimentBase.js';

class ElectricalExperiment extends ExperimentBase {
  // Internal phases for electrical experiment
  static PHASES = {
    IDLE: 'IDLE',
    CONNECTING: 'CONNECTING',
    FLOWING: 'FLOWING',
    MEASURING: 'MEASURING',
    COMPLETE: 'COMPLETE'
  };

  // Conductive materials list
  static CONDUCTIVE_MATERIALS = [
    'copper',
    'aluminum',
    'gold',
    'silver',
    'iron',
    'steel',
    'brass',
    'bronze',
    'nickel',
    'zinc'
  ];

  // Non-conductive materials
  static INSULATING_MATERIALS = [
    'rubber',
    'glass',
    'plastic',
    'wood',
    'ceramic',
    'air',
    'paper',
    'cloth'
  ];

  /**
   * @param {Object} options - Configuration options
   * @param {Object} options.audioManager - AudioManager instance for sounds
   */
  constructor(options) {
    super();
    
    // Configuration
    this._audioManager = options && options.audioManager ? options.audioManager : null;
    
    // Internal phase (separate from base state)
    this._phase = ElectricalExperiment.PHASES.IDLE;
    
    // Circuit state
    this._connectedWires = 0;
    this._circuitActive = false;
    this._requiredWires = 3;
    
    // Conductivity test
    this._conductivityResult = null;
    
    // Magnetic field
    this._magneticFieldVisible = false;
    
    // Haptic feedback
    this._hapticPulse = null;
    
    // Visual elements (created in render)
    this._wires = [];
    this._electrons = [];
    this._magneticFieldLines = [];
    this._sceneRef = null;
  }

  // ============== Properties ==============

  get phase() {
    return this._phase;
  }

  get connectedWires() {
    return this._connectedWires;
  }

  get circuitActive() {
    return this._circuitActive;
  }

  get conductivityResult() {
    return this._conductivityResult;
  }

  get magneticFieldVisible() {
    return this._magneticFieldVisible;
  }

  get hapticPulse() {
    return this._hapticPulse;
  }

  // ============== Wire Connection ==============

  /**
   * Connect a wire to the circuit
   * @returns {boolean} True if wire was connected
   */
  connectWire() {
    if (this._connectedWires >= this._requiredWires) {
      return false;
    }

    this._connectedWires++;
    
    // Transition to CONNECTING on first wire
    if (this._connectedWires === 1) {
      this._phase = ElectricalExperiment.PHASES.CONNECTING;
    }

    // Play connection sound
    this._playSound('connect');

    // Check if circuit is complete
    if (this._connectedWires >= this._requiredWires) {
      this._circuitActive = true;
      this._phase = ElectricalExperiment.PHASES.FLOWING;
      
      // Enable haptic feedback for current flow
      this._hapticPulse = {
        intensity: 0.5,
        duration: 100
      };
      
      this._playSound('current');
    }

    return true;
  }

  // ============== Conductivity Testing ==============

  /**
   * Test if a material is conductive
   * Requires active circuit
   * @param {string} material - Material name to test
   * @returns {boolean|null} True if conductive, false if insulating, null if circuit inactive
   */
  testConductivity(material) {
    if (!this._circuitActive) {
      return null;
    }

    // Normalize material name
    const normalizedMaterial = material.toLowerCase().trim();
    
    // Check if conductive
    const isConductive = ElectricalExperiment.CONDUCTIVE_MATERIALS.includes(normalizedMaterial);
    
    this._conductivityResult = isConductive;
    this._phase = ElectricalExperiment.PHASES.MEASURING;
    
    // Play measurement sound
    this._playSound('measure');
    
    // LED effect based on conductivity
    if (isConductive) {
      this._playSound('spark');
    }

    return isConductive;
  }

  /**
   * Check if a material is conductive (static helper)
   * @param {string} material - Material name
   * @returns {boolean}
   */
  static isConductive(material) {
    const normalized = material.toLowerCase().trim();
    return ElectricalExperiment.CONDUCTIVE_MATERIALS.includes(normalized);
  }

  // ============== Magnetic Field Visualization ==============

  /**
   * Show magnetic field visualization (iron filings pattern)
   * @returns {boolean} True if field was shown
   */
  showMagneticField() {
    if (!this._circuitActive) {
      return false;
    }

    this._magneticFieldVisible = true;
    this._playSound('field');
    
    return true;
  }

  /**
   * Hide magnetic field visualization
   */
  hideMagneticField() {
    this._magneticFieldVisible = false;
  }

  // ============== Experiment Completion ==============

  /**
   * Complete the electrical experiment
   */
  completeExperiment() {
    this._phase = ElectricalExperiment.PHASES.COMPLETE;
    this._playSound('complete');
  }

  // ============== Reset ==============

  /**
   * Reset experiment to initial state
   * Override base reset to clear internal state
   */
  reset() {
    super.reset();
    
    this._phase = ElectricalExperiment.PHASES.IDLE;
    this._connectedWires = 0;
    this._circuitActive = false;
    this._conductivityResult = null;
    this._magneticFieldVisible = false;
    this._hapticPulse = null;
    
    // Clear visual elements
    this._wires = [];
    this._electrons = [];
    this._magneticFieldLines = [];
  }

  // ============== Update Loop ==============

  /**
   * Called each frame while base state is RUNNING
   * @param {number} delta - Time since last frame
   */
  onUpdate(delta) {
    if (this._circuitActive) {
      this._updateElectrons(delta);
    }
  }

  /**
   * Update electron particle animation
   * @param {number} delta - Time since last frame
   */
  _updateElectrons(delta) {
    // Animate electrons along circuit path
    for (let i = 0; i < this._electrons.length; i++) {
      const electron = this._electrons[i];
      if (electron && electron.userData) {
        // Move electron along path
        electron.userData.progress = (electron.userData.progress || 0) + delta * 0.5;
        if (electron.userData.progress > 1) {
          electron.userData.progress = 0;
        }
      }
    }
  }

  // ============== Rendering ==============

  /**
   * Render visual elements to scene
   * @param {THREE.Scene} scene - Three.js scene
   */
  render(scene) {
    if (!scene) return;
    
    this._sceneRef = scene;
    
    // Render circuit components when active
    if (this._circuitActive) {
      this._renderCircuit(scene);
      this._renderElectrons(scene);
    }
    
    // Render magnetic field if visible
    if (this._magneticFieldVisible) {
      this._renderMagneticField(scene);
    }
  }

  /**
   * Render circuit wires and components
   * @param {THREE.Scene} scene 
   */
  _renderCircuit(scene) {
    // Circuit is rendered via setupElectricalExperiment in room
    // This is a placeholder for additional effects
  }

  /**
   * Render electron flow particles
   * @param {THREE.Scene} scene 
   */
  _renderElectrons(scene) {
    // Electron particles created by room setup
    // This manages animation via _updateElectrons
  }

  /**
   * Render magnetic field lines (iron filings pattern)
   * @param {THREE.Scene} scene 
   */
  _renderMagneticField(scene) {
    // Magnetic field visualization created by room setup
    // Pattern of iron filings around current-carrying wire
  }

  // ============== Audio ==============

  /**
   * Play experiment sound via AudioManager
   * @param {string} eventType - Type of sound event
   */
  _playSound(eventType) {
    if (this._audioManager && this._audioManager.playExperimentSound) {
      this._audioManager.playExperimentSound('electrical', eventType);
    }
  }

  // ============== Hooks ==============

  /**
   * Called when experiment starts
   */
  onStart() {
    this._phase = ElectricalExperiment.PHASES.IDLE;
    this._playSound('start');
  }

  /**
   * Called when experiment completes
   */
  onComplete() {
    this._phase = ElectricalExperiment.PHASES.COMPLETE;
  }
}

export default ElectricalExperiment;
