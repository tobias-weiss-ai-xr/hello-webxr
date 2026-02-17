/**
 * NuclearExperiment - Nuclear physics visualizations for VR
 * 
 * Implements three experiment types:
 * - Fission: U-235 nucleus splits when hit by neutron
 * - Fusion: Hydrogen atoms combine to form Helium (sun process)
 * - Decay: Radioactive decay chain visualization
 * 
 * Visual effects:
 * - Cherenkov blue glow
 * - Particle emissions
 * - Energy wave expansion
 * 
 * Uses ExperimentBase state machine with custom phases.
 */
import * as THREE from 'three';
import ExperimentBase from './ExperimentBase.js';

class NuclearExperiment extends ExperimentBase {
  // Experiment-specific phases
  static PHASES = {
    IDLE: 'IDLE',
    FIRING: 'FIRING',
    REACTING: 'REACTING',
    DECAYING: 'DECAYING',
    COMPLETE: 'COMPLETE'
  };

  // Valid experiment types
  static EXPERIMENT_TYPES = ['fission', 'fusion', 'decay'];

  constructor(options) {
    super();
    
    // Configuration
    options = options || {};
    this.audioManager = options.audioManager || null;
    this.hapticPulse = options.hapticPulse || null;
    
    // Experiment state
    this.experimentType = 'fission';
    this.currentPhase = NuclearExperiment.PHASES.IDLE;
    
    // Visual elements
    this.sceneGroup = null;
    this.nucleusMesh = null;
    this.neutronMesh = null;
    this.fragments = [];
    this.energyParticles = [];
    this.cherenkovGlow = null;
    this.energyWave = null;
    
    // Fission specific
    this.neutronFired = false;
    this.neutronPosition = { x: 0, y: 0, z: 0 };
    this.neutronVelocity = { x: 0, y: 0, z: 0.5 };
    
    // Fusion specific
    this.hydrogenAtoms = [];
    this.heliumNucleus = null;
    
    // Decay specific
    this.parentNucleus = null;
    this.daughterNucleus = null;
    this.decayParticle = null;
    this.decayGeneration = 0;
    this.maxDecayGenerations = 3;
    
    // Animation state
    this.animationTime = 0;
    this.energyWaveScale = 1;
  }

  // Expose PHASES as instance property for tests
  get PHASES() {
    return NuclearExperiment.PHASES;
  }

  /**
   * Set the experiment type
   * @param {string} type - 'fission', 'fusion', or 'decay'
   * @returns {boolean} True if valid type was set
   */
  setExperimentType(type) {
    if (NuclearExperiment.EXPERIMENT_TYPES.indexOf(type) === -1) {
      return false;
    }
    this.experimentType = type;
    return true;
  }

  /**
   * Start fission experiment
   * @returns {boolean} True if started successfully
   */
  startFission() {
    if (this.currentPhase !== NuclearExperiment.PHASES.IDLE) {
      return false;
    }
    
    this.currentPhase = NuclearExperiment.PHASES.FIRING;
    this.neutronFired = true;
    
    // Initialize neutron position (coming from front)
    this.neutronPosition = { x: 0, y: 0, z: -2 };
    this.neutronVelocity = { x: 0, y: 0, z: 0.5 };
    
    // Play start sound
    if (this.audioManager) {
      this.audioManager.playExperimentSound('nuclear', 'start');
    }
    
    return true;
  }

  /**
   * Simulate neutron hitting the nucleus
   */
  simulateNeutronHit() {
    if (this.currentPhase !== NuclearExperiment.PHASES.FIRING) {
      return;
    }
    
    this.currentPhase = NuclearExperiment.PHASES.REACTING;
    
    // Create fission fragments (Kr-92 + Ba-141)
    this._createFissionFragments();
    
    // Create energy particles
    this._createEnergyParticles();
    
    // Create visual effects
    this._createCherenkovGlow();
    this._createEnergyWave();
    
    // Trigger haptic feedback
    if (this.hapticPulse) {
      this.hapticPulse('strong');
    }
    
    // Play progress sound
    if (this.audioManager) {
      this.audioManager.playExperimentSound('nuclear', 'progress');
    }
  }

  /**
   * Complete the current reaction
   */
  completeReaction() {
    if (this.currentPhase !== NuclearExperiment.PHASES.REACTING) {
      return;
    }
    
    this.currentPhase = NuclearExperiment.PHASES.COMPLETE;
    
    if (this.audioManager) {
      this.audioManager.playExperimentSound('nuclear', 'complete');
    }
  }

  /**
   * Start fusion experiment
   */
  startFusion() {
    this.currentPhase = NuclearExperiment.PHASES.FIRING;
    this._createHydrogenAtoms();
    
    if (this.audioManager) {
      this.audioManager.playExperimentSound('nuclear', 'start');
    }
  }

  /**
   * Simulate fusion collision
   */
  simulateFusionCollision() {
    if (this.currentPhase !== NuclearExperiment.PHASES.FIRING) {
      return;
    }
    
    this.currentPhase = NuclearExperiment.PHASES.REACTING;
    this._createHeliumNucleus();
    
    if (this.audioManager) {
      this.audioManager.playExperimentSound('nuclear', 'progress');
    }
  }

  /**
   * Start decay chain visualization
   */
  startDecay() {
    this.currentPhase = NuclearExperiment.PHASES.IDLE;
    this.decayGeneration = 0;
    this._createParentNucleus();
    
    if (this.audioManager) {
      this.audioManager.playExperimentSound('nuclear', 'start');
    }
  }

  /**
   * Simulate one decay step
   */
  simulateDecay() {
    // Check if already at max generations before incrementing
    if (this.decayGeneration >= this.maxDecayGenerations) {
      this.currentPhase = NuclearExperiment.PHASES.COMPLETE;
      return;
    }
    
    this.currentPhase = NuclearExperiment.PHASES.DECAYING;
    
    // Create daughter nucleus
    this._createDaughterNucleus();
    
    // Emit decay particle (alpha or beta)
    this._createDecayParticle();
    
    this.decayGeneration++;
    
    // Check if we've reached max generations after increment
    if (this.decayGeneration >= this.maxDecayGenerations) {
      this.currentPhase = NuclearExperiment.PHASES.COMPLETE;
      return;
    }
    
    if (this.audioManager) {
      this.audioManager.playExperimentSound('nuclear', 'progress');
    }
  }

  /**
   * Reset experiment to initial state
   */
  reset() {
    super.reset();
    
    this.currentPhase = NuclearExperiment.PHASES.IDLE;
    this.neutronFired = false;
    this.decayGeneration = 0;
    this.animationTime = 0;
    this.energyWaveScale = 1;
    
    this.disposeResources();
    
    this.fragments = [];
    this.energyParticles = [];
    this.hydrogenAtoms = [];
    this.heliumNucleus = null;
    this.parentNucleus = null;
    this.daughterNucleus = null;
    this.decayParticle = null;
    this.cherenkovGlow = null;
    this.energyWave = null;
  }

  /**
   * Dispose visual resources
   */
  disposeResources() {
    // Dispose fragments
    for (let i = 0; i < this.fragments.length; i++) {
      var fragment = this.fragments[i];
      if (fragment && fragment.geometry) {
        fragment.geometry.dispose();
      }
      if (fragment && fragment.material) {
        fragment.material.dispose();
      }
    }
    
    // Dispose energy particles
    for (let i = 0; i < this.energyParticles.length; i++) {
      var particle = this.energyParticles[i];
      if (particle && particle.geometry) {
        particle.geometry.dispose();
      }
      if (particle && particle.material) {
        particle.material.dispose();
      }
    }
    
    // Dispose other elements
    if (this.cherenkovGlow && this.cherenkovGlow.geometry) {
      this.cherenkovGlow.geometry.dispose();
    }
    if (this.cherenkovGlow && this.cherenkovGlow.material) {
      this.cherenkovGlow.material.dispose();
    }
    
    if (this.energyWave && this.energyWave.geometry) {
      this.energyWave.geometry.dispose();
    }
    if (this.energyWave && this.energyWave.material) {
      this.energyWave.material.dispose();
    }
  }

  /**
   * Dispose and remove from scene
   */
  dispose() {
    this.disposeResources();
    
    if (this.sceneGroup && this.sceneGroup.parent) {
      this.sceneGroup.parent.remove(this.sceneGroup);
    }
  }

  /**
   * Render visual elements to scene
   * @param {THREE.Scene} scene - Three.js scene
   */
  render(scene) {
    if (!this.sceneGroup) {
      this.sceneGroup = new THREE.Group();
    }
    
    // Create nucleus based on experiment type
    this._createNucleusMesh();
    
    scene.add(this.sceneGroup);
  }

  /**
   * Update animation each frame
   * @param {number} delta - Time since last frame in seconds
   */
  update(delta) {
    if (this.state !== ExperimentBase.STATES.RUNNING) {
      return;
    }
    
    this.animationTime += delta;
    
    // Update based on current phase
    if (this.currentPhase === NuclearExperiment.PHASES.FIRING) {
      this._updateFiringPhase(delta);
    } else if (this.currentPhase === NuclearExperiment.PHASES.REACTING) {
      this._updateReactingPhase(delta);
    } else if (this.currentPhase === NuclearExperiment.PHASES.DECAYING) {
      this._updateDecayingPhase(delta);
    }
    
    // Always update visual effects
    this._updateEnergyParticles(delta);
    this._updateEnergyWave(delta);
  }

  // Private methods

  _createNucleusMesh() {
    if (this.nucleusMesh) {
      return;
    }
    
    var geometry = new THREE.SphereGeometry(0.3, 32, 32);
    var material = new THREE.MeshBasicMaterial({
      color: 0x4A69BD,
      transparent: true,
      opacity: 0.8
    });
    
    this.nucleusMesh = new THREE.Mesh(geometry, material);
    this.nucleusMesh.position.set(0, 0, 0);
    this.sceneGroup.add(this.nucleusMesh);
  }

  _createFissionFragments() {
    // Clear existing fragments
    this.fragments = [];
    
    // Create two fragments: Kr-92 and Ba-141
    var fragmentColors = [0x3498DB, 0xE74C3C]; // Blue and red
    
    for (var i = 0; i < 2; i++) {
      var size = i === 0 ? 0.2 : 0.25; // Different sizes
      var geometry = new THREE.SphereGeometry(size, 16, 16);
      var material = new THREE.MeshBasicMaterial({
        color: fragmentColors[i],
        transparent: true,
        opacity: 0.9
      });
      
      var fragment = new THREE.Mesh(geometry, material);
      
      // Position fragments moving apart
      var angle = i === 0 ? Math.PI : 0;
      fragment.position.set(
        Math.cos(angle) * 0.1,
        0,
        Math.sin(angle) * 0.1
      );
      
      // Store velocity for animation
      fragment.userData.velocity = {
        x: Math.cos(angle) * 0.3,
        y: (Math.random() - 0.5) * 0.1,
        z: Math.sin(angle) * 0.3
      };
      
      this.fragments.push(fragment);
      
      if (this.sceneGroup) {
        this.sceneGroup.add(fragment);
      }
    }
    
    // Hide original nucleus
    if (this.nucleusMesh) {
      this.nucleusMesh.visible = false;
    }
  }

  _createEnergyParticles() {
    this.energyParticles = [];
    
    // Create 8-12 energy particles (representing released energy/neutrons)
    var particleCount = 8 + Math.floor(Math.random() * 5);
    
    for (var i = 0; i < particleCount; i++) {
      var geometry = new THREE.SphereGeometry(0.03, 8, 8);
      var material = new THREE.MeshBasicMaterial({
        color: 0xFFFF00, // Yellow for energy
        transparent: true,
        opacity: 1.0
      });
      
      var particle = new THREE.Mesh(geometry, material);
      particle.position.set(0, 0, 0);
      
      // Random velocity direction
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.random() * Math.PI;
      var speed = 0.5 + Math.random() * 0.5;
      
      particle.userData = {
        x: 0,
        y: 0,
        z: 0,
        velocityX: Math.sin(phi) * Math.cos(theta) * speed,
        velocityY: Math.sin(phi) * Math.sin(theta) * speed,
        velocityZ: Math.cos(phi) * speed
      };
      
      this.energyParticles.push(particle);
      
      if (this.sceneGroup) {
        this.sceneGroup.add(particle);
      }
    }
  }

  _createCherenkovGlow() {
    if (this.cherenkovGlow) {
      return;
    }
    
    // Create blue glow effect (Cherenkov radiation)
    var geometry = new THREE.SphereGeometry(0.5, 32, 32);
    var material = new THREE.MeshBasicMaterial({
      color: 0x00BFFF, // Deep sky blue
      transparent: true,
      opacity: 0.3
    });
    
    this.cherenkovGlow = new THREE.Mesh(geometry, material);
    this.cherenkovGlow.position.set(0, 0, 0);
    this.cherenkovGlow.userData.baseOpacity = 0.3;
    
    if (this.sceneGroup) {
      this.sceneGroup.add(this.cherenkovGlow);
    }
  }

  _createEnergyWave() {
    if (this.energyWave) {
      return;
    }
    
    // Create expanding ring for energy wave
    var geometry = new THREE.RingGeometry(0.1, 0.15, 32);
    var material = new THREE.MeshBasicMaterial({
      color: 0xFFA500, // Orange
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    this.energyWave = new THREE.Mesh(geometry, material);
    this.energyWave.position.set(0, 0, 0);
    this.energyWave.scale = 1;
    
    if (this.sceneGroup) {
      this.sceneGroup.add(this.energyWave);
    }
  }

  _createHydrogenAtoms() {
    this.hydrogenAtoms = [];
    
    // Create two hydrogen atoms
    for (var i = 0; i < 2; i++) {
      var geometry = new THREE.SphereGeometry(0.15, 16, 16);
      var material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF, // White
        transparent: true,
        opacity: 0.9
      });
      
      var atom = new THREE.Mesh(geometry, material);
      
      // Position on opposite sides
      var offset = i === 0 ? -0.8 : 0.8;
      atom.position.set(offset, 0, 0);
      
      atom.userData = {
        velocityX: i === 0 ? 0.2 : -0.2
      };
      
      this.hydrogenAtoms.push(atom);
      
      if (this.sceneGroup) {
        this.sceneGroup.add(atom);
      }
    }
  }

  _createHeliumNucleus() {
    // Hide hydrogen atoms
    for (var i = 0; i < this.hydrogenAtoms.length; i++) {
      this.hydrogenAtoms[i].visible = false;
    }
    
    // Create helium nucleus (larger than hydrogen)
    var geometry = new THREE.SphereGeometry(0.25, 16, 16);
    var material = new THREE.MeshBasicMaterial({
      color: 0xFFD700, // Gold
      transparent: true,
      opacity: 0.9
    });
    
    this.heliumNucleus = new THREE.Mesh(geometry, material);
    this.heliumNucleus.position.set(0, 0, 0);
    
    if (this.sceneGroup) {
      this.sceneGroup.add(this.heliumNucleus);
    }
    
    // Create glow effect
    this._createCherenkovGlow();
  }

  _createParentNucleus() {
    // Create parent nucleus for decay chain
    var geometry = new THREE.SphereGeometry(0.3, 32, 32);
    var material = new THREE.MeshBasicMaterial({
      color: 0x8E44AD, // Purple for unstable
      transparent: true,
      opacity: 0.8
    });
    
    this.parentNucleus = new THREE.Mesh(geometry, material);
    this.parentNucleus.position.set(0, 0, 0);
    
    if (this.sceneGroup) {
      this.sceneGroup.add(this.parentNucleus);
    }
  }

  _createDaughterNucleus() {
    // Store old daughter as new parent
    if (this.daughterNucleus) {
      if (this.parentNucleus && this.parentNucleus.parent) {
        this.parentNucleus.parent.remove(this.parentNucleus);
      }
      this.parentNucleus = this.daughterNucleus;
      this.parentNucleus.material.color.setHex(0x8E44AD);
    }
    
    // Create new daughter nucleus (smaller, more stable color)
    var size = 0.3 - (this.decayGeneration * 0.05);
    size = Math.max(0.15, size);
    
    var geometry = new THREE.SphereGeometry(size, 32, 32);
    var material = new THREE.MeshBasicMaterial({
      color: 0x27AE60, // Green for more stable
      transparent: true,
      opacity: 0.8
    });
    
    this.daughterNucleus = new THREE.Mesh(geometry, material);
    this.daughterNucleus.position.set(0.5, 0, 0);
    
    if (this.sceneGroup) {
      this.sceneGroup.add(this.daughterNucleus);
    }
  }

  _createDecayParticle() {
    // Create alpha or beta particle
    var isAlpha = Math.random() > 0.5;
    
    var size = isAlpha ? 0.08 : 0.03;
    var color = isAlpha ? 0xFF0000 : 0x00FF00; // Red for alpha, green for beta
    
    var geometry = new THREE.SphereGeometry(size, 8, 8);
    var material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1.0
    });
    
    this.decayParticle = new THREE.Mesh(geometry, material);
    this.decayParticle.position.set(0, 0, 0);
    
    // Random emission direction
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.4 + Math.random() * 0.3;
    
    this.decayParticle.userData = {
      velocityX: Math.cos(angle) * speed,
      velocityY: (Math.random() - 0.5) * speed,
      velocityZ: Math.sin(angle) * speed
    };
    
    if (this.sceneGroup) {
      this.sceneGroup.add(this.decayParticle);
    }
  }

  _updateFiringPhase(delta) {
    if (this.experimentType === 'fission' && this.neutronFired) {
      // Move neutron towards nucleus
      this.neutronPosition.x += this.neutronVelocity.x * delta * 60;
      this.neutronPosition.y += this.neutronVelocity.y * delta * 60;
      this.neutronPosition.z += this.neutronVelocity.z * delta * 60;
      
      // Check if neutron reached nucleus
      if (this.neutronPosition.z >= 0) {
        this.simulateNeutronHit();
      }
    }
  }

  _updateReactingPhase(delta) {
    // Update fragment positions
    for (var i = 0; i < this.fragments.length; i++) {
      var fragment = this.fragments[i];
      if (fragment && fragment.userData && fragment.userData.velocity) {
        fragment.position.x += fragment.userData.velocity.x * delta * 60;
        fragment.position.y += fragment.userData.velocity.y * delta * 60;
        fragment.position.z += fragment.userData.velocity.z * delta * 60;
      }
    }
    
    // Update Cherenkov glow pulse
    if (this.cherenkovGlow) {
      var pulse = Math.sin(this.animationTime * 5) * 0.1 + 0.3;
      this.cherenkovGlow.material.opacity = pulse;
      this.cherenkovGlow.scale.setScalar(1 + Math.sin(this.animationTime * 3) * 0.1);
    }
    
    // Check if reaction animation complete
    if (this.animationTime > 3) {
      this.completeReaction();
    }
  }

  _updateDecayingPhase(delta) {
    // Animate decay particle
    if (this.decayParticle && this.decayParticle.userData) {
      this.decayParticle.position.x += this.decayParticle.userData.velocityX * delta * 60;
      this.decayParticle.position.y += this.decayParticle.userData.velocityY * delta * 60;
      this.decayParticle.position.z += this.decayParticle.userData.velocityZ * delta * 60;
      
      // Fade out
      this.decayParticle.material.opacity -= delta * 0.5;
    }
  }

  _updateEnergyParticles(delta) {
    for (var i = 0; i < this.energyParticles.length; i++) {
      var particle = this.energyParticles[i];
      if (particle && particle.userData) {
        particle.userData.x += particle.userData.velocityX * delta * 60;
        particle.userData.y += particle.userData.velocityY * delta * 60;
        particle.userData.z += particle.userData.velocityZ * delta * 60;
        
        particle.position.x = particle.userData.x;
        particle.position.y = particle.userData.y;
        particle.position.z = particle.userData.z;
        
        // Fade out over time
        particle.material.opacity -= delta * 0.3;
        particle.material.opacity = Math.max(0, particle.material.opacity);
      }
    }
  }

  _updateEnergyWave(delta) {
    if (this.energyWave && this.currentPhase === NuclearExperiment.PHASES.REACTING) {
      this.energyWaveScale += delta * 2;
      this.energyWave.scale = this.energyWaveScale;
      
      // Fade out as it expands
      this.energyWave.material.opacity = Math.max(0, 0.7 - (this.energyWaveScale - 1) * 0.2);
    }
  }

  // Hook methods from ExperimentBase

  onStart() {
    this.start();
  }

  onUpdate(delta) {
    this.update(delta);
  }

  onComplete() {
    this.currentPhase = NuclearExperiment.PHASES.COMPLETE;
  }
}

export default NuclearExperiment;
