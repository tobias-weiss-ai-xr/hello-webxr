/**
 * ExperimentBase - Abstract base class for VR experiments
 * 
 * Provides a simple state machine for experiment lifecycle:
 * IDLE -> PREPARING -> RUNNING -> COMPLETED
 *                   \-> ERROR (from any state)
 * 
 * Subclasses should override:
 * - onStart() - Called when experiment starts
 * - onUpdate(delta) - Called each frame while RUNNING
 * - onComplete() - Called when experiment completes
 * - render(scene) - Optional: Add visual elements to scene
 */
class ExperimentBase {
  // State constants
  static STATES = {
    IDLE: 'IDLE',
    PREPARING: 'PREPARING',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    ERROR: 'ERROR'
  };

  constructor() {
    this._state = ExperimentBase.STATES.IDLE;
    this._errorMessage = null;
    this._stateChangeCallback = null;
  }

  /**
   * Current state of the experiment
   */
  get state() {
    return this._state;
  }

  set state(newState) {
    if (!Object.values(ExperimentBase.STATES).includes(newState)) {
      throw new Error(`Invalid state: ${newState}`);
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
    const oldState = this._state;
    this._state = newState;
    if (this._stateChangeCallback) {
      this._stateChangeCallback(newState, oldState);
    }
    return true;
  }

  /**
   * Start the experiment (IDLE -> PREPARING)
   * @returns {boolean} True if transition succeeded
   */
  start() {
    if (this._state !== ExperimentBase.STATES.IDLE) {
      return false;
    }
    this._transition(ExperimentBase.STATES.PREPARING);
    this.onStart();
    return true;
  }

  /**
   * Complete preparation phase (PREPARING -> RUNNING)
   * @returns {boolean} True if transition succeeded
   */
  prepare() {
    if (this._state !== ExperimentBase.STATES.PREPARING) {
      return false;
    }
    return this._transition(ExperimentBase.STATES.RUNNING);
  }

  /**
   * Pause the experiment (RUNNING -> IDLE)
   * @returns {boolean} True if transition succeeded
   */
  pause() {
    if (this._state !== ExperimentBase.STATES.RUNNING) {
      return false;
    }
    return this._transition(ExperimentBase.STATES.IDLE);
  }

  /**
   * Reset experiment to initial state (any -> IDLE)
   */
  reset() {
    this._errorMessage = null;
    this._transition(ExperimentBase.STATES.IDLE);
  }

  /**
   * Complete the experiment (RUNNING -> COMPLETED)
   * @returns {boolean} True if transition succeeded
   */
  complete() {
    if (this._state !== ExperimentBase.STATES.RUNNING) {
      return false;
    }
    this._transition(ExperimentBase.STATES.COMPLETED);
    this.onComplete();
    return true;
  }

  /**
   * Transition to error state (any -> ERROR)
   * @param {string} message - Error description
   */
  error(message) {
    this._errorMessage = message;
    this._transition(ExperimentBase.STATES.ERROR);
  }

  /**
   * Update the experiment (called each frame)
   * Only executes onUpdate when in RUNNING state
   * @param {number} delta - Time since last frame in seconds
   */
  update(delta) {
    if (this._state === ExperimentBase.STATES.RUNNING) {
      this.onUpdate(delta);
    }
  }

  /**
   * Render visual elements to scene
   * Override in subclasses to add 3D objects
   * @param {THREE.Scene} scene - Three.js scene to render into
   */
  render(scene) {
    // Base implementation does nothing
    // Override in subclasses
  }

  // Hook methods - override in subclasses

  /**
   * Called when experiment starts (after transition to PREPARING)
   * Override to set up experiment resources
   */
  onStart() {
    // Override in subclass
  }

  /**
   * Called each frame while RUNNING
   * @param {number} delta - Time since last frame
   */
  onUpdate(delta) {
    // Override in subclass
  }

  /**
   * Called when experiment completes
   * Override to clean up or show results
   */
  onComplete() {
    // Override in subclass
  }
}

export default ExperimentBase;
