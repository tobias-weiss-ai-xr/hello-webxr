/**
 * CrystalExperiment - Crystal lattice structure visualization and formation
 * 
 * Provides interactive crystal visualization with:
 * - Lattice structure display (cubic, hexagonal)
 * - Crystal formation animation (atoms -> lattice)
 * - Unit cell highlighting on interaction
 * 
 * Phase Flow:
 * IDLE -> FORMING -> CRYSTALLIZING -> COMPLETE
 * 
 * Uses ExperimentBase states with internal phase tracking.
 */
import ExperimentBase from './ExperimentBase.js';

class CrystalExperiment extends ExperimentBase {
  // Internal phases for crystal formation
  static PHASES = {
    IDLE: 'IDLE',
    FORMING: 'FORMING',
    CRYSTALLIZING: 'CRYSTALLIZING',
    COMPLETE: 'COMPLETE'
  };

  // Supported lattice types
  static LATTICE_TYPES = {
    CUBIC: 'cubic',
    HEXAGONAL: 'hexagonal'
  };

  // Formation timing constants
  static FORMATION_DURATION = 3.0; // seconds for forming phase
  static CRYSTALLIZATION_DURATION = 2.0; // seconds for crystallization

  /**
   * Check if a lattice type is valid
   * @param {string} type - Lattice type to validate
   * @returns {boolean}
   */
  static isValidLatticeType(type) {
    return type === CrystalExperiment.LATTICE_TYPES.CUBIC || 
           type === CrystalExperiment.LATTICE_TYPES.HEXAGONAL;
  }

  /**
   * @param {Object} options - Configuration options
   * @param {Object} options.audioManager - AudioManager instance for sounds
   */
  constructor(options) {
    super();
    
    // Configuration
    this._audioManager = options && options.audioManager ? options.audioManager : null;
    
    // Internal phase (separate from base state)
    this._phase = CrystalExperiment.PHASES.IDLE;
    
    // Lattice configuration
    this._latticeType = null;
    this._latticeColor = 0x4a90e2;
    
    // Formation state
    this._formationProgress = 0;
    this._crystallizationProgress = 0;
    
    // Unit cell highlighting
    this._highlightedCell = null;
    
    // Haptic feedback callback
    this._hapticCallback = null;
    
    // Visual elements
    this._latticeMesh = null;
    this._atomMeshes = [];
    this._highlightMesh = null;
    this._sceneRef = null;
  }

  // ============== Properties ==============

  get phase() {
    return this._phase;
  }

  get latticeType() {
    return this._latticeType;
  }

  get formationProgress() {
    return this._formationProgress;
  }

  get highlightedCell() {
    return this._highlightedCell;
  }

  get hapticCallback() {
    return this._hapticCallback;
  }

  // ============== Configuration ==============

  /**
   * Configure the crystal experiment with lattice type
   * @param {string} latticeType - 'cubic' or 'hexagonal'
   * @returns {boolean} True if configuration succeeded
   */
  configure(latticeType) {
    // Cannot configure while not idle
    if (this._state !== ExperimentBase.STATES.IDLE) {
      return false;
    }

    // Validate lattice type
    if (!CrystalExperiment.isValidLatticeType(latticeType)) {
      return false;
    }

    this._latticeType = latticeType;
    this._formationProgress = 0;
    this._crystallizationProgress = 0;
    
    return true;
  }

  // ============== Experiment Lifecycle ==============

  /**
   * Start the experiment (IDLE -> PREPARING)
   * @returns {boolean} True if transition succeeded
   */
  start() {
    // Must be configured first
    if (!this._latticeType) {
      return false;
    }

    if (this._state !== ExperimentBase.STATES.IDLE) {
      return false;
    }

    this._transition(ExperimentBase.STATES.PREPARING);
    this._playSound('start');
    this.onStart();
    return true;
  }

  /**
   * Complete preparation phase (PREPARING -> RUNNING)
   * Override base prepare to set internal phase
   * @returns {boolean} True if transition succeeded
   */
  prepare() {
    if (this._state !== ExperimentBase.STATES.PREPARING) {
      return false;
    }

    this._transition(ExperimentBase.STATES.RUNNING);
    this._phase = CrystalExperiment.PHASES.FORMING;
    this._playSound('forming');
    return true;
  }

  /**
   * Start the crystallization phase
   * @returns {boolean} True if transition succeeded
   */
  startCrystallization() {
    if (this._phase !== CrystalExperiment.PHASES.FORMING) {
      return false;
    }

    this._phase = CrystalExperiment.PHASES.CRYSTALLIZING;
    this._playSound('crystallizing');
    this._triggerHaptic(0.7);
    return true;
  }

  /**
   * Complete the crystal experiment
   * @returns {boolean} True if completion succeeded
   */
  completeExperiment() {
    if (this._phase !== CrystalExperiment.PHASES.CRYSTALLIZING) {
      return false;
    }

    this._phase = CrystalExperiment.PHASES.COMPLETE;
    this._transition(ExperimentBase.STATES.COMPLETED);
    this._playSound('complete');
    this._triggerHaptic(1.0);
    this.onComplete();
    return true;
  }

  // ============== Unit Cell Highlighting ==============

  /**
   * Highlight a specific unit cell
   * @param {number|null} cellIndex - Cell index to highlight, or null to clear
   */
  highlightCell(cellIndex) {
    this._highlightedCell = cellIndex;
    if (cellIndex !== null) {
      this._playSound('highlight');
      this._triggerHaptic(0.3);
    }
  }

  /**
   * Clear the cell highlight
   */
  clearHighlight() {
    this._highlightedCell = null;
  }

  // ============== Reset ==============

  /**
   * Reset experiment to initial state
   * Override base reset to clear internal state
   */
  reset() {
    super.reset();

    this._phase = CrystalExperiment.PHASES.IDLE;
    this._latticeType = null;
    this._formationProgress = 0;
    this._crystallizationProgress = 0;
    this._highlightedCell = null;

    // Clear visual elements
    this._latticeMesh = null;
    this._atomMeshes = [];
    this._highlightMesh = null;
  }

  // ============== Update Loop ==============

  /**
   * Called each frame while base state is RUNNING
   * @param {number} delta - Time since last frame
   */
  onUpdate(delta) {
    if (this._phase === CrystalExperiment.PHASES.FORMING) {
      this._updateFormation(delta);
    } else if (this._phase === CrystalExperiment.PHASES.CRYSTALLIZING) {
      this._updateCrystallization(delta);
    }
  }

  /**
   * Update formation phase progress
   * @param {number} delta - Time since last frame
   */
  _updateFormation(delta) {
    this._formationProgress += delta / CrystalExperiment.FORMATION_DURATION;
    
    // Update atom positions based on formation progress
    this._updateAtomPositions(this._formationProgress);

    // Auto-transition to crystallization when complete
    if (this._formationProgress >= 1.0) {
      this._formationProgress = 1.0;
      this.startCrystallization();
    }
  }

  /**
   * Update crystallization phase progress
   * @param {number} delta - Time since last frame
   */
  _updateCrystallization(delta) {
    this._crystallizationProgress += delta / CrystalExperiment.CRYSTALLIZATION_DURATION;
    
    // Update lattice opacity based on crystallization
    this._updateLatticeOpacity(this._crystallizationProgress);

    // Auto-complete when crystallization done
    if (this._crystallizationProgress >= 1.0) {
      this._crystallizationProgress = 1.0;
      this.completeExperiment();
    }
  }

  /**
   * Update atom positions during formation
   * @param {number} progress - Formation progress (0-1)
   */
  _updateAtomPositions(progress) {
    // Atoms move from random positions to lattice positions
    for (var i = 0; i < this._atomMeshes.length; i++) {
      var atom = this._atomMeshes[i];
      if (atom && atom.userData && atom.userData.targetPosition) {
        var target = atom.userData.targetPosition;
        var start = atom.userData.startPosition;
        atom.position.x = start.x + (target.x - start.x) * progress;
        atom.position.y = start.y + (target.y - start.y) * progress;
        atom.position.z = start.z + (target.z - start.z) * progress;
      }
    }
  }

  /**
   * Update lattice wireframe opacity during crystallization
   * @param {number} progress - Crystallization progress (0-1)
   */
  _updateLatticeOpacity(progress) {
    if (this._latticeMesh && this._latticeMesh.material) {
      // Fade in the lattice wireframe
      this._latticeMesh.material.opacity = 0.2 + progress * 0.6;
    }
  }

  // ============== Lattice Structure ==============

  /**
   * Get atom positions for current lattice type
   * @returns {Array} Array of {x, y, z} positions
   */
  getAtomPositions() {
    if (this._latticeType === CrystalExperiment.LATTICE_TYPES.CUBIC) {
      return this._getCubicLatticePositions();
    } else if (this._latticeType === CrystalExperiment.LATTICE_TYPES.HEXAGONAL) {
      return this._getHexagonalLatticePositions();
    }
    return [];
  }

  /**
   * Get cubic lattice atom positions
   * @returns {Array} Array of {x, y, z} positions
   */
  _getCubicLatticePositions() {
    var positions = [];
    // 2x2x2 unit cell with atoms at corners
    for (var x = 0; x < 2; x++) {
      for (var y = 0; y < 2; y++) {
        for (var z = 0; z < 2; z++) {
          positions.push({
            x: (x - 0.5) * 0.7,
            y: (y - 0.5) * 0.7,
            z: (z - 0.5) * 0.7
          });
        }
      }
    }
    return positions;
  }

  /**
   * Get hexagonal lattice atom positions
   * @returns {Array} Array of {x, y, z} positions
   */
  _getHexagonalLatticePositions() {
    var positions = [];
    // Simplified hexagonal close-packed structure
    // Two layers with 3 atoms each
    for (var layer = 0; layer < 2; layer++) {
      var yPos = (layer - 0.5) * 0.6;
      for (var i = 0; i < 3; i++) {
        var angle = (i * Math.PI * 2) / 3;
        positions.push({
          x: Math.cos(angle) * 0.4,
          y: yPos,
          z: Math.sin(angle) * 0.4
        });
      }
      // Center atom for bottom layer only
      if (layer === 0) {
        positions.push({ x: 0, y: yPos, z: 0 });
      }
    }
    return positions;
  }

  /**
   * Get unit cell count for current lattice type
   * @returns {number} Number of unit cells
   */
  getUnitCellCount() {
    if (this._latticeType === CrystalExperiment.LATTICE_TYPES.CUBIC) {
      return 1; // Single cubic unit cell
    } else if (this._latticeType === CrystalExperiment.LATTICE_TYPES.HEXAGONAL) {
      return 2; // Two hexagonal layers
    }
    return 0;
  }

  // ============== Rendering ==============

  /**
   * Render visual elements to scene
   * @param {THREE.Scene} scene - Three.js scene
   */
  render(scene) {
    if (!scene || !this._latticeType) return;

    this._sceneRef = scene;
    
    // Create lattice structure
    this._createLatticeStructure(scene);
  }

  /**
   * Create the lattice structure in the scene
   * @param {THREE.Scene} scene 
   */
  _createLatticeStructure(scene) {
    // This is a placeholder - actual THREE.js mesh creation
    // happens in the room setup (see ElementRoom.js:675-710)
    // The experiment manages the state, the room renders visuals
  }

  // ============== Audio ==============

  /**
   * Play experiment sound via AudioManager
   * @param {string} eventType - Type of sound event
   */
  _playSound(eventType) {
    if (this._audioManager && this._audioManager.playExperimentSound) {
      this._audioManager.playExperimentSound('crystal', eventType);
    }
  }

  // ============== Haptic Feedback ==============

  /**
   * Set haptic feedback callback
   * @param {Function} callback - Callback function for haptic pulses
   */
  setHapticCallback(callback) {
    this._hapticCallback = callback;
  }

  /**
   * Trigger haptic feedback
   * @param {number} intensity - Haptic intensity (0-1)
   */
  _triggerHaptic(intensity) {
    if (this._hapticCallback) {
      this._hapticCallback(intensity);
    }
  }

  // ============== Error Handling ==============

  /**
   * Transition to error state
   * @param {string} message - Error description
   */
  error(message) {
    this._errorMessage = message;
    this._transition(ExperimentBase.STATES.ERROR);
    this._playSound('error');
  }

  // ============== Hooks ==============

  /**
   * Called when experiment starts
   */
  onStart() {
    // Override in subclass or assign directly
  }

  /**
   * Called when experiment completes
   */
  onComplete() {
    // Override in subclass or assign directly
  }
}

export default CrystalExperiment;
