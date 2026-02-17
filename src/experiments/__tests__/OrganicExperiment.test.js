/**
 * Unit tests for OrganicExperiment
 * Tests state transitions, phase management, and visualization modes
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrganicExperiment from '../OrganicExperiment.js';

describe('OrganicExperiment', () => {
  let experiment;
  let mockAudioManager;
  let mockScene;

  beforeEach(() => {
    experiment = new OrganicExperiment();
    mockAudioManager = {
      playExperimentSound: vi.fn()
    };
    mockScene = {
      add: vi.fn(),
      remove: vi.fn()
    };
    experiment.setAudioManager(mockAudioManager);
  });

  describe('constructor', () => {
    it('should initialize with IDLE state', () => {
      expect(experiment.state).toBe('IDLE');
    });

    it('should initialize with IDLE phase', () => {
      expect(experiment.phase).toBe('IDLE');
    });

    it('should have DNA visualization mode by default', () => {
      expect(experiment.visualizationMode).toBe('dna');
    });

    it('should initialize rotation speed', () => {
      expect(experiment.rotationSpeed).toBeDefined();
      expect(experiment.rotationSpeed).toBeGreaterThan(0);
    });

    it('should initialize zoom level', () => {
      expect(experiment.zoomLevel).toBeDefined();
      expect(experiment.zoomLevel).toBeGreaterThanOrEqual(0);
    });
  });

  describe('phases', () => {
    it('should define PHASES constant', () => {
      expect(OrganicExperiment.PHASES).toBeDefined();
      expect(OrganicExperiment.PHASES.IDLE).toBe('IDLE');
      expect(OrganicExperiment.PHASES.LOADING).toBe('LOADING');
      expect(OrganicExperiment.PHASES.ROTATING).toBe('ROTATING');
      expect(OrganicExperiment.PHASES.ZOOMING).toBe('ZOOMING');
      expect(OrganicExperiment.PHASES.COMPLETE).toBe('COMPLETE');
    });

    it('should transition to LOADING phase when started', () => {
      experiment.start();
      expect(experiment.phase).toBe('LOADING');
    });

    it('should transition to ROTATING phase after loading', () => {
      experiment.start();
      experiment.prepare();
      expect(experiment.phase).toBe('ROTATING');
    });

    it('should transition to ZOOMING phase when zoom is triggered', () => {
      experiment.start();
      experiment.prepare();
      experiment.triggerZoom();
      expect(experiment.phase).toBe('ZOOMING');
    });

    it('should transition to COMPLETE phase when complete', () => {
      experiment.start();
      experiment.prepare();
      experiment.complete();
      expect(experiment.phase).toBe('COMPLETE');
    });
  });

  describe('visualization modes', () => {
    it('should support DNA visualization mode', () => {
      experiment.setVisualizationMode('dna');
      expect(experiment.visualizationMode).toBe('dna');
    });

    it('should support protein folding visualization mode', () => {
      experiment.setVisualizationMode('protein');
      expect(experiment.visualizationMode).toBe('protein');
    });

    it('should support polymer chain visualization mode', () => {
      experiment.setVisualizationMode('polymer');
      expect(experiment.visualizationMode).toBe('polymer');
    });

    it('should ignore invalid visualization modes', () => {
      experiment.setVisualizationMode('invalid');
      expect(experiment.visualizationMode).toBe('dna'); // default
    });
  });

  describe('DNA helix', () => {
    it('should create DNA helix group on start', () => {
      experiment.start();
      expect(experiment.dnaHelixGroup).toBeDefined();
    });

    it('should have two helix strands', () => {
      experiment.start();
      expect(experiment.helixStrands).toBeDefined();
      expect(experiment.helixStrands.length).toBe(2);
    });

    it('should have base pairs connecting strands', () => {
      experiment.start();
      expect(experiment.basePairs).toBeDefined();
      expect(experiment.basePairs.length).toBeGreaterThan(0);
    });

    it('should rotate helix during ROTATING phase', () => {
      experiment.start();
      experiment.prepare();
      const initialRotation = experiment.dnaHelixGroup.rotation.y;
      experiment.update(0.016); // one frame
      expect(experiment.dnaHelixGroup.rotation.y).not.toBe(initialRotation);
    });
  });

  describe('zoom functionality', () => {
    it('should track zoom level', () => {
      expect(experiment.zoomLevel).toBe(0);
    });

    it('should increase zoom level when zooming in', () => {
      experiment.start();
      experiment.prepare();
      experiment.triggerZoom();
      experiment.update(0.016);
      expect(experiment.zoomLevel).toBeGreaterThan(0);
    });

    it('should limit zoom level to maximum', () => {
      experiment.start();
      experiment.prepare();
      experiment.triggerZoom();
      // Simulate many frames of zooming
      for (let i = 0; i < 100; i++) {
        experiment.update(0.016);
      }
      expect(experiment.zoomLevel).toBeLessThanOrEqual(1);
    });
  });

  describe('protein folding', () => {
    beforeEach(() => {
      experiment.setVisualizationMode('protein');
    });

    it('should create protein chain on start', () => {
      experiment.start();
      expect(experiment.proteinChain).toBeDefined();
    });

    it('should have amino acid nodes', () => {
      experiment.start();
      expect(experiment.aminoAcidNodes).toBeDefined();
      expect(experiment.aminoAcidNodes.length).toBeGreaterThan(0);
    });

    it('should animate folding during RUNNING state', () => {
      experiment.start();
      experiment.prepare();
      const initialPositions = experiment.aminoAcidNodes.map(function(n) { return n.position.clone(); });
      experiment.update(0.016);
      // At least one node should have moved
      const moved = experiment.aminoAcidNodes.some(function(n, i) {
        return !n.position.equals(initialPositions[i]);
      });
      expect(moved).toBe(true);
    });
  });

  describe('polymer chain', () => {
    beforeEach(() => {
      experiment.setVisualizationMode('polymer');
    });

    it('should create polymer chain on start', () => {
      experiment.start();
      expect(experiment.polymerChain).toBeDefined();
    });

    it('should have monomer units', () => {
      experiment.start();
      expect(experiment.monomerUnits).toBeDefined();
      expect(experiment.monomerUnits.length).toBeGreaterThan(0);
    });

    it('should extend chain during RUNNING state', () => {
      experiment.start();
      experiment.prepare();
      const initialLength = experiment.polymerChain.scale.x;
      experiment.update(0.016);
      expect(experiment.polymerChain.scale.x).toBeGreaterThanOrEqual(initialLength);
    });
  });

  describe('audio integration', () => {
    it('should play start sound when experiment starts', () => {
      experiment.start();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('organic', 'start');
    });

    it('should play progress sound during phase transitions', () => {
      experiment.start();
      experiment.prepare();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('organic', 'progress');
    });

    it('should play complete sound when experiment completes', () => {
      experiment.start();
      experiment.prepare();
      experiment.complete();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('organic', 'complete');
    });
  });

  describe('state transitions', () => {
    it('should inherit from ExperimentBase', () => {
      expect(experiment.start).toBeDefined();
      expect(experiment.prepare).toBeDefined();
      expect(experiment.complete).toBeDefined();
      expect(experiment.reset).toBeDefined();
      expect(experiment.error).toBeDefined();
    });

    it('should reset to initial state and phase', () => {
      experiment.start();
      experiment.prepare();
      experiment.triggerZoom();
      experiment.reset();
      expect(experiment.state).toBe('IDLE');
      expect(experiment.phase).toBe('IDLE');
      expect(experiment.zoomLevel).toBe(0);
    });

    it('should handle error from any state', () => {
      experiment.start();
      experiment.prepare();
      experiment.error('Test error');
      expect(experiment.state).toBe('ERROR');
      expect(experiment.errorMessage).toBe('Test error');
    });
  });

  describe('render', () => {
    it('should add visualization to scene', () => {
      experiment.start();
      experiment.render(mockScene);
      expect(mockScene.add).toHaveBeenCalled();
    });

    it('should not throw when rendering without scene', () => {
      experiment.start();
      expect(function() { experiment.render(null); }).not.toThrow();
    });
  });

  describe('haptic feedback', () => {
    it('should have haptic pulse callback', () => {
      expect(experiment.onHapticPulse).toBeDefined();
    });

    it('should call haptic callback during rotation', () => {
      const hapticCallback = vi.fn();
      experiment.onHapticPulse = hapticCallback;
      experiment.start();
      experiment.prepare();
      // Haptic interval is 0.1 seconds, so update multiple times to trigger
      experiment.update(0.05);
      experiment.update(0.05);
      experiment.update(0.05);
      expect(hapticCallback).toHaveBeenCalled();
    });
  });
});
