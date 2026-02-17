/**
 * NuclearExperiment - Unit Tests
 * Tests for nuclear fission, fusion, and decay chain visualizations
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import NuclearExperiment from '../NuclearExperiment.js';

// Mock THREE.js with proper class constructors
vi.mock('three', () => {
  // Create mock mesh class
  class MockMesh {
    constructor(geometry, material) {
      this.geometry = geometry;
      this.material = material;
      this.position = { 
        set: vi.fn(), 
        copy: vi.fn(),
        x: 0, y: 0, z: 0
      };
      this.rotation = { x: 0, y: 0, z: 0 };
      this.scale = { set: vi.fn(), setScalar: vi.fn() };
      this.userData = {};
      this.visible = true;
      this.parent = null;
    }
    add() {}
    remove() {}
  }

  // Create mock group class
  class MockGroup {
    constructor() {
      this.children = [];
      this.position = { set: vi.fn() };
      this.parent = null;
    }
    add(child) {
      this.children.push(child);
      child.parent = this;
    }
    remove(child) {
      var idx = this.children.indexOf(child);
      if (idx > -1) this.children.splice(idx, 1);
      child.parent = null;
    }
  }

  // Create mock geometry class
  class MockGeometry {
    constructor() {
      this.parameters = {};
    }
    dispose() {}
  }

  // Create mock material class
  class MockMaterial {
    constructor(options) {
      options = options || {};
      this.color = { setHex: vi.fn(), getHex: function() { return options.color || 0; } };
      this.opacity = options.opacity !== undefined ? options.opacity : 1;
      this.transparent = options.transparent || false;
    }
    dispose() {}
  }

  // Create mock vector class
  class MockVector3 {
    constructor(x, y, z) {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
    }
  }

  return {
    default: {
      Group: MockGroup,
      Mesh: MockMesh,
      SphereGeometry: MockGeometry,
      BoxGeometry: MockGeometry,
      RingGeometry: MockGeometry,
      MeshBasicMaterial: MockMaterial,
      Vector3: MockVector3,
      DoubleSide: 2
    },
    Group: MockGroup,
    Mesh: MockMesh,
    SphereGeometry: MockGeometry,
    BoxGeometry: MockGeometry,
    RingGeometry: MockGeometry,
    MeshBasicMaterial: MockMaterial,
    Vector3: MockVector3,
    DoubleSide: 2
  };
});

describe('NuclearExperiment', () => {
  let experiment;
  let mockAudioManager;
  let mockScene;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockAudioManager = {
      playExperimentSound: vi.fn()
    };

    mockScene = {
      add: vi.fn(),
      remove: vi.fn()
    };

    experiment = new NuclearExperiment({
      audioManager: mockAudioManager
    });
  });

  describe('Construction and Initial State', () => {
    it('should extend ExperimentBase', () => {
      expect(experiment.state).toBe('IDLE');
    });

    it('should initialize with default experiment type as fission', () => {
      expect(experiment.experimentType).toBe('fission');
    });

    it('should store audio manager reference', () => {
      expect(experiment.audioManager).toBe(mockAudioManager);
    });

    it('should have experiment phases', () => {
      expect(experiment.PHASES).toEqual({
        IDLE: 'IDLE',
        FIRING: 'FIRING',
        REACTING: 'REACTING',
        DECAYING: 'DECAYING',
        COMPLETE: 'COMPLETE'
      });
    });

    it('should start with IDLE phase', () => {
      expect(experiment.currentPhase).toBe('IDLE');
    });
  });

  describe('Fission Experiment', () => {
    it('should set experiment type to fission', () => {
      experiment.setExperimentType('fission');
      expect(experiment.experimentType).toBe('fission');
    });

    it('should fire neutron on startFission()', () => {
      experiment.setExperimentType('fission');
      experiment.startFission();
      expect(experiment.currentPhase).toBe('FIRING');
      expect(experiment.neutronFired).toBe(true);
    });

    it('should transition to REACTING phase after neutron hits nucleus', () => {
      experiment.setExperimentType('fission');
      experiment.startFission();
      experiment.simulateNeutronHit();
      expect(experiment.currentPhase).toBe('REACTING');
    });

    it('should create fission fragments when reacting', () => {
      experiment.setExperimentType('fission');
      experiment.startFission();
      experiment.simulateNeutronHit();
      expect(experiment.fragments).toBeDefined();
      expect(experiment.fragments.length).toBe(2); // Kr-92 + Ba-141
    });

    it('should release energy particles on fission', () => {
      experiment.setExperimentType('fission');
      experiment.startFission();
      experiment.simulateNeutronHit();
      expect(experiment.energyParticles).toBeDefined();
      expect(experiment.energyParticles.length).toBeGreaterThan(0);
    });

    it('should play nuclear sound on fission start', () => {
      experiment.setExperimentType('fission');
      experiment.startFission();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('nuclear', 'start');
    });

    it('should trigger haptic feedback on fission', () => {
      const mockHapticPulse = vi.fn();
      experiment.hapticPulse = mockHapticPulse;
      experiment.setExperimentType('fission');
      experiment.startFission();
      experiment.simulateNeutronHit();
      expect(mockHapticPulse).toHaveBeenCalledWith('strong');
    });

    it('should transition to COMPLETE after reaction finishes', () => {
      experiment.setExperimentType('fission');
      experiment.startFission();
      experiment.simulateNeutronHit();
      experiment.completeReaction();
      expect(experiment.currentPhase).toBe('COMPLETE');
    });
  });

  describe('Fusion Experiment', () => {
    beforeEach(() => {
      experiment.setExperimentType('fusion');
    });

    it('should set experiment type to fusion', () => {
      expect(experiment.experimentType).toBe('fusion');
    });

    it('should create hydrogen atoms for fusion', () => {
      experiment.startFusion();
      expect(experiment.hydrogenAtoms).toBeDefined();
      expect(experiment.hydrogenAtoms.length).toBe(2); // H + H -> He
    });

    it('should transition to REACTING phase during fusion', () => {
      experiment.startFusion();
      experiment.simulateFusionCollision();
      expect(experiment.currentPhase).toBe('REACTING');
    });

    it('should create helium nucleus after fusion', () => {
      experiment.startFusion();
      experiment.simulateFusionCollision();
      expect(experiment.heliumNucleus).toBeDefined();
    });

    it('should play sound on fusion start', () => {
      experiment.startFusion();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('nuclear', 'start');
    });
  });

  describe('Decay Chain Visualization', () => {
    beforeEach(() => {
      experiment.setExperimentType('decay');
    });

    it('should set experiment type to decay', () => {
      expect(experiment.experimentType).toBe('decay');
    });

    it('should create parent nucleus for decay', () => {
      experiment.startDecay();
      expect(experiment.parentNucleus).toBeDefined();
    });

    it('should track decay chain generations', () => {
      experiment.startDecay();
      expect(experiment.decayGeneration).toBe(0);
    });

    it('should advance to next generation on decay', () => {
      experiment.startDecay();
      experiment.simulateDecay();
      expect(experiment.decayGeneration).toBe(1);
      expect(experiment.currentPhase).toBe('DECAYING');
    });

    it('should track daughter nucleus after decay', () => {
      experiment.startDecay();
      experiment.simulateDecay();
      expect(experiment.daughterNucleus).toBeDefined();
    });

    it('should emit alpha/beta particle on decay', () => {
      experiment.startDecay();
      experiment.simulateDecay();
      expect(experiment.decayParticle).toBeDefined();
    });

    it('should complete after reaching stable isotope (3 generations)', () => {
      experiment.startDecay();
      experiment.simulateDecay(); // gen 1
      experiment.simulateDecay(); // gen 2
      experiment.simulateDecay(); // gen 3 (stable)
      expect(experiment.currentPhase).toBe('COMPLETE');
    });
  });

  describe('State Transitions', () => {
    it('should not allow startFission when not IDLE', () => {
      experiment.currentPhase = 'FIRING';
      const result = experiment.startFission();
      expect(result).toBe(false);
    });

    it('should reset to IDLE phase on reset()', () => {
      experiment.setExperimentType('fission');
      experiment.startFission();
      experiment.reset();
      expect(experiment.currentPhase).toBe('IDLE');
    });

    it('should clear all fragments on reset', () => {
      experiment.setExperimentType('fission');
      experiment.startFission();
      experiment.simulateNeutronHit();
      experiment.reset();
      expect(experiment.fragments).toEqual([]);
      expect(experiment.energyParticles).toEqual([]);
    });
  });

  describe('Visual Elements', () => {
    it('should create nucleus mesh on render', () => {
      experiment.render(mockScene);
      expect(mockScene.add).toHaveBeenCalled();
    });

    it('should create Cherenkov glow effect', () => {
      experiment.setExperimentType('fission');
      experiment.startFission();
      experiment.simulateNeutronHit();
      expect(experiment.cherenkovGlow).toBeDefined();
    });

    it('should create energy wave expansion effect', () => {
      experiment.setExperimentType('fission');
      experiment.startFission();
      experiment.simulateNeutronHit();
      expect(experiment.energyWave).toBeDefined();
    });
  });

  describe('Update Loop', () => {
    it('should update particle positions on update', () => {
      experiment.setExperimentType('fission');
      experiment.startFission();
      experiment.simulateNeutronHit();
      
      var initialPositions = experiment.energyParticles.map(function(p) { 
        return { x: p.userData.x, y: p.userData.y, z: p.userData.z }; 
      });
      
      // Set state to RUNNING to allow update
      experiment._state = 'RUNNING';
      experiment.update(0.016);
      
      // Particles should have moved
      var moved = false;
      for (var i = 0; i < experiment.energyParticles.length; i++) {
        var p = experiment.energyParticles[i];
        if (p.userData.x !== initialPositions[i].x || 
            p.userData.y !== initialPositions[i].y || 
            p.userData.z !== initialPositions[i].z) {
          moved = true;
          break;
        }
      }
      expect(moved).toBe(true);
    });

    it('should expand energy wave on update', () => {
      experiment.setExperimentType('fission');
      experiment.startFission();
      experiment.simulateNeutronHit();
      
      var initialScale = experiment.energyWaveScale;
      
      // Set state to RUNNING to allow update
      experiment._state = 'RUNNING';
      experiment.update(0.016);
      
      expect(experiment.energyWaveScale).toBeGreaterThan(initialScale);
    });
  });

  describe('Experiment Type Selection', () => {
    it('should support fission experiment type', () => {
      const result = experiment.setExperimentType('fission');
      expect(result).toBe(true);
      expect(experiment.experimentType).toBe('fission');
    });

    it('should support fusion experiment type', () => {
      const result = experiment.setExperimentType('fusion');
      expect(result).toBe(true);
      expect(experiment.experimentType).toBe('fusion');
    });

    it('should support decay experiment type', () => {
      const result = experiment.setExperimentType('decay');
      expect(result).toBe(true);
      expect(experiment.experimentType).toBe('decay');
    });

    it('should reject invalid experiment type', () => {
      const result = experiment.setExperimentType('invalid');
      expect(result).toBe(false);
    });

    it('should not change type if invalid', () => {
      experiment.setExperimentType('fission');
      experiment.setExperimentType('invalid');
      expect(experiment.experimentType).toBe('fission');
    });
  });

  describe('Cleanup', () => {
    it('should dispose resources on reset', () => {
      experiment.setExperimentType('fission');
      experiment.startFission();
      experiment.simulateNeutronHit();
      
      const disposeSpy = vi.spyOn(experiment, 'disposeResources');
      experiment.reset();
      
      expect(disposeSpy).toHaveBeenCalled();
    });

    it('should clear scene references on dispose', () => {
      experiment.render(mockScene);
      // Manually set parent to simulate proper scene hierarchy
      experiment.sceneGroup.parent = mockScene;
      experiment.dispose();
      
      expect(mockScene.remove).toHaveBeenCalled();
    });
  });
});
