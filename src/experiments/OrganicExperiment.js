/**
 * OrganicExperiment - VR experiment for organic chemistry visualization
 * 
 * Features:
 * - DNA double helix with rotation and zoom
 * - Protein folding animation
 * - Polymer chain visualization
 * 
 * Phases: IDLE → LOADING → ROTATING → ZOOMING → COMPLETE
 */
import * as THREE from 'three';
import ExperimentBase from './ExperimentBase.js';

class OrganicExperiment extends ExperimentBase {
  // Experiment-specific phases
  static PHASES = {
    IDLE: 'IDLE',
    LOADING: 'LOADING',
    ROTATING: 'ROTATING',
    ZOOMING: 'ZOOMING',
    COMPLETE: 'COMPLETE'
  };

  // Visualization modes
  static MODES = {
    DNA: 'dna',
    PROTEIN: 'protein',
    POLYMER: 'polymer'
  };

  constructor() {
    super();
    
    // Phase state
    this._phase = OrganicExperiment.PHASES.IDLE;
    
    // Visualization mode
    this._visualizationMode = OrganicExperiment.MODES.DNA;
    
    // Rotation and zoom parameters
    this.rotationSpeed = 0.5;
    this.zoomLevel = 0;
    this.maxZoomLevel = 1;
    this.zoomSpeed = 0.5;
    
    // DNA helix components
    this.dnaHelixGroup = null;
    this.helixStrands = [];
    this.basePairs = [];
    
    // Protein components
    this.proteinChain = null;
    this.aminoAcidNodes = [];
    this.proteinTargetPositions = [];
    
    // Polymer components
    this.polymerChain = null;
    this.monomerUnits = [];
    
    // Audio manager reference
    this._audioManager = null;
    
    // Haptic callback
    this.onHapticPulse = null;
    
    // Haptic timing
    this._hapticTimer = 0;
    this._hapticInterval = 0.1; // seconds between pulses
  }

  /**
   * Current phase of the organic experiment
   */
  get phase() {
    return this._phase;
  }

  set phase(newPhase) {
    this._phase = newPhase;
  }

  /**
   * Current visualization mode
   */
  get visualizationMode() {
    return this._visualizationMode;
  }

  /**
   * Set audio manager for sound playback
   */
  setAudioManager(manager) {
    this._audioManager = manager;
  }

  /**
   * Set visualization mode
   */
  setVisualizationMode(mode) {
    if (mode === OrganicExperiment.MODES.DNA ||
        mode === OrganicExperiment.MODES.PROTEIN ||
        mode === OrganicExperiment.MODES.POLYMER) {
      this._visualizationMode = mode;
    }
  }

  /**
   * Play sound via audio manager
   */
  _playSound(eventType) {
    if (this._audioManager) {
      this._audioManager.playExperimentSound('organic', eventType);
    }
  }

  /**
   * Trigger haptic pulse
   */
  _triggerHaptic() {
    if (this.onHapticPulse) {
      this.onHapticPulse();
    }
  }

  /**
   * Create DNA double helix visualization
   */
  _createDNAHelix() {
    this.dnaHelixGroup = new THREE.Group();
    this.helixStrands = [];
    this.basePairs = [];

    const helixRadius = 0.3;
    const helixHeight = 2;
    const turns = 3;
    const pointsPerStrand = 100;
    const basePairCount = 20;

    // Create two helix strands
    for (let strand = 0; strand < 2; strand++) {
      var points = [];
      var phaseOffset = strand * Math.PI;
      
      for (var i = 0; i < pointsPerStrand; i++) {
        var t = i / pointsPerStrand;
        var angle = t * Math.PI * 2 * turns + phaseOffset;
        var y = (t - 0.5) * helixHeight;
        var x = Math.cos(angle) * helixRadius;
        var z = Math.sin(angle) * helixRadius;
        points.push(new THREE.Vector3(x, y, z));
      }

      var curve = new THREE.CatmullRomCurve3(points);
      var tubeGeo = new THREE.TubeGeometry(curve, 100, 0.03, 8, false);
      var tubeMat = new THREE.MeshBasicMaterial({
        color: strand === 0 ? 0x3498db : 0xe74c3c
      });
      var helix = new THREE.Mesh(tubeGeo, tubeMat);
      this.helixStrands.push(helix);
      this.dnaHelixGroup.add(helix);
    }

    // Create base pairs connecting the strands
    for (var bp = 0; bp < basePairCount; bp++) {
      var t = bp / basePairCount;
      var angle = t * Math.PI * 2 * turns;
      var y = (t - 0.5) * helixHeight;
      
      // Position on first strand
      var x1 = Math.cos(angle) * helixRadius;
      var z1 = Math.sin(angle) * helixRadius;
      
      // Position on second strand (opposite side)
      var x2 = Math.cos(angle + Math.PI) * helixRadius;
      var z2 = Math.sin(angle + Math.PI) * helixRadius;
      
      // Create base pair connection
      var bpGeo = new THREE.CylinderGeometry(0.015, 0.015, helixRadius * 2, 6);
      var bpMat = new THREE.MeshBasicMaterial({
        color: bp % 2 === 0 ? 0x2ecc71 : 0xf1c40f
      });
      var basePair = new THREE.Mesh(bpGeo, bpMat);
      
      basePair.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      basePair.rotation.z = Math.PI / 2;
      basePair.rotation.y = angle;
      
      this.basePairs.push(basePair);
      this.dnaHelixGroup.add(basePair);
    }

    this.dnaHelixGroup.position.set(0, 1.5, 0);
  }

  /**
   * Create protein folding visualization
   */
  _createProteinChain() {
    this.proteinChain = new THREE.Group();
    this.aminoAcidNodes = [];
    this.proteinTargetPositions = [];

    var nodeCount = 15;
    var colors = [0x9b59b6, 0x1abc9c, 0xe67e22, 0x3498db, 0xe74c3c];
    
    // Create unfolded chain positions
    for (var i = 0; i < nodeCount; i++) {
      var nodeGeo = new THREE.SphereGeometry(0.08, 16, 16);
      var nodeMat = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length]
      });
      var node = new THREE.Mesh(nodeGeo, nodeMat);
      
      // Initial position: unfolded chain
      node.position.set(i * 0.2 - 1.4, 1.5, 0);
      
      this.aminoAcidNodes.push(node);
      this.proteinChain.add(node);
      
      // Target position: folded structure (simplified)
      var foldAngle = i * 0.5;
      var foldRadius = 0.3 + (i % 3) * 0.1;
      this.proteinTargetPositions.push(new THREE.Vector3(
        Math.cos(foldAngle) * foldRadius,
        1.5 + Math.sin(foldAngle * 2) * 0.3,
        Math.sin(foldAngle) * foldRadius
      ));
    }

    // Create bonds between nodes
    for (var j = 0; j < nodeCount - 1; j++) {
      var bondGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6);
      var bondMat = new THREE.MeshBasicMaterial({ color: 0x95a5a6 });
      var bond = new THREE.Mesh(bondGeo, bondMat);
      bond.position.set(j * 0.2 - 1.3, 1.5, 0);
      this.proteinChain.add(bond);
    }

    this.proteinChain.position.set(0, 0, 0);
  }

  /**
   * Create polymer chain visualization
   */
  _createPolymerChain() {
    this.polymerChain = new THREE.Group();
    this.monomerUnits = [];

    var monomerCount = 10;
    var colors = [0x3498db, 0x2ecc71];
    
    for (var i = 0; i < monomerCount; i++) {
      var monomerGeo = new THREE.SphereGeometry(0.06, 12, 12);
      var monomerMat = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length]
      });
      var monomer = new THREE.Mesh(monomerGeo, monomerMat);
      
      monomer.position.set(i * 0.15 - 0.675, 1.5, 0);
      
      this.monomerUnits.push(monomer);
      this.polymerChain.add(monomer);
    }

    this.polymerChain.position.set(0, 0, 0);
    // Start small, will extend during animation
    this.polymerChain.scale.set(0.1, 1, 1);
  }

  /**
   * Called when experiment starts
   */
  onStart() {
    this._phase = OrganicExperiment.PHASES.LOADING;
    this._playSound('start');
    
    // Create visualization based on current mode
    if (this._visualizationMode === OrganicExperiment.MODES.DNA) {
      this._createDNAHelix();
    } else if (this._visualizationMode === OrganicExperiment.MODES.PROTEIN) {
      this._createProteinChain();
    } else if (this._visualizationMode === OrganicExperiment.MODES.POLYMER) {
      this._createPolymerChain();
    }
  }

  /**
   * Trigger zoom transition
   */
  triggerZoom() {
    if (this._phase === OrganicExperiment.PHASES.ROTATING) {
      this._phase = OrganicExperiment.PHASES.ZOOMING;
      this._playSound('progress');
    }
  }

  /**
   * Called each frame while RUNNING
   */
  onUpdate(delta) {
    // Handle haptic pulses during rotation
    if (this._phase === OrganicExperiment.PHASES.ROTATING ||
        this._phase === OrganicExperiment.PHASES.ZOOMING) {
      this._hapticTimer += delta;
      if (this._hapticTimer >= this._hapticInterval) {
        this._triggerHaptic();
        this._hapticTimer = 0;
      }
    }

    // Update based on mode and phase
    if (this._visualizationMode === OrganicExperiment.MODES.DNA) {
      this._updateDNAHelix(delta);
    } else if (this._visualizationMode === OrganicExperiment.MODES.PROTEIN) {
      this._updateProteinChain(delta);
    } else if (this._visualizationMode === OrganicExperiment.MODES.POLYMER) {
      this._updatePolymerChain(delta);
    }
  }

  /**
   * Update DNA helix animation
   */
  _updateDNAHelix(delta) {
    if (!this.dnaHelixGroup) return;

    if (this._phase === OrganicExperiment.PHASES.ROTATING) {
      // Rotate helix
      this.dnaHelixGroup.rotation.y += this.rotationSpeed * delta;
    } else if (this._phase === OrganicExperiment.PHASES.ZOOMING) {
      // Continue rotating while zooming
      this.dnaHelixGroup.rotation.y += this.rotationSpeed * delta;
      
      // Zoom in
      if (this.zoomLevel < this.maxZoomLevel) {
        this.zoomLevel = Math.min(this.maxZoomLevel, this.zoomLevel + this.zoomSpeed * delta);
        
        // Scale up for zoom effect
        var scale = 1 + this.zoomLevel * 0.5;
        this.dnaHelixGroup.scale.set(scale, scale, scale);
        
        // Move closer
        this.dnaHelixGroup.position.z = -this.zoomLevel * 0.5;
      }
    }
  }

  /**
   * Update protein folding animation
   */
  _updateProteinChain(delta) {
    if (!this.proteinChain) return;

    var self = this;
    
    // Animate nodes toward folded positions
    this.aminoAcidNodes.forEach(function(node, index) {
      if (index < self.proteinTargetPositions.length) {
        var target = self.proteinTargetPositions[index];
        node.position.lerp(target, delta * 2);
      }
    });
  }

  /**
   * Update polymer chain animation
   */
  _updatePolymerChain(delta) {
    if (!this.polymerChain) return;

    // Extend the polymer chain
    if (this.polymerChain.scale.x < 1) {
      this.polymerChain.scale.x = Math.min(1, this.polymerChain.scale.x + delta * 0.5);
    }
  }

  /**
   * Called when experiment completes
   */
  onComplete() {
    this._phase = OrganicExperiment.PHASES.COMPLETE;
    this._playSound('complete');
  }

  /**
   * Override prepare to transition phase
   */
  prepare() {
    var result = super.prepare();
    if (result) {
      this._phase = OrganicExperiment.PHASES.ROTATING;
      this._playSound('progress');
    }
    return result;
  }

  /**
   * Reset experiment to initial state
   */
  reset() {
    super.reset();
    this._phase = OrganicExperiment.PHASES.IDLE;
    this.zoomLevel = 0;
    this._hapticTimer = 0;
    
    // Clear visualization references
    this.dnaHelixGroup = null;
    this.helixStrands = [];
    this.basePairs = [];
    this.proteinChain = null;
    this.aminoAcidNodes = [];
    this.proteinTargetPositions = [];
    this.polymerChain = null;
    this.monomerUnits = [];
  }

  /**
   * Render visual elements to scene
   */
  render(scene) {
    if (!scene) return;

    if (this._visualizationMode === OrganicExperiment.MODES.DNA && this.dnaHelixGroup) {
      scene.add(this.dnaHelixGroup);
    } else if (this._visualizationMode === OrganicExperiment.MODES.PROTEIN && this.proteinChain) {
      scene.add(this.proteinChain);
    } else if (this._visualizationMode === OrganicExperiment.MODES.POLYMER && this.polymerChain) {
      scene.add(this.polymerChain);
    }
  }
}

export default OrganicExperiment;
