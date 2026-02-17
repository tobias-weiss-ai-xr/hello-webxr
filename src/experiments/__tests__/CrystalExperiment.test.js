import { describe, it, expect, vi, beforeEach } from 'vitest';
import CrystalExperiment from '../CrystalExperiment.js';

describe('CrystalExperiment', () => {
  let experiment;
  let stateChangeCallback;
  let mockAudioManager;
  let mockScene;

  beforeEach(() => {
    stateChangeCallback = vi.fn();
    mockAudioManager = {
      playExperimentSound: vi.fn()
    };
    mockScene = {
      add: vi.fn(),
      remove: vi.fn()
    };
    experiment = new CrystalExperiment({ audioManager: mockAudioManager });
    experiment.onStateChange(stateChangeCallback);
  });

  describe('Constants and Initial State', () => {
    it('should define phase constants', () => {
      expect(CrystalExperiment.PHASES.IDLE).toBe('IDLE');
      expect(CrystalExperiment.PHASES.FORMING).toBe('FORMING');
      expect(CrystalExperiment.PHASES.CRYSTALLIZING).toBe('CRYSTALLIZING');
      expect(CrystalExperiment.PHASES.COMPLETE).toBe('COMPLETE');
    });

    it('should define lattice type constants', () => {
      expect(CrystalExperiment.LATTICE_TYPES.CUBIC).toBe('cubic');
      expect(CrystalExperiment.LATTICE_TYPES.HEXAGONAL).toBe('hexagonal');
    });

    it('should start with phase IDLE', () => {
      expect(experiment.phase).toBe('IDLE');
    });

    it('should start with no lattice type configured', () => {
      expect(experiment.latticeType).toBeNull();
    });

    it('should start with no highlighted cell', () => {
      expect(experiment.highlightedCell).toBeNull();
    });

    it('should start with formation progress at 0', () => {
      expect(experiment.formationProgress).toBe(0);
    });

    it('should start with no haptic callback', () => {
      expect(experiment.hapticCallback).toBeNull();
    });
  });

  describe('configure(latticeType)', () => {
    it('should only work when state is IDLE', () => {
      experiment.state = 'PREPARING';
      const result = experiment.configure('cubic');
      expect(result).toBe(false);
    });

    it('should set lattice type to cubic', () => {
      const result = experiment.configure('cubic');
      expect(result).toBe(true);
      expect(experiment.latticeType).toBe('cubic');
    });

    it('should set lattice type to hexagonal', () => {
      const result = experiment.configure('hexagonal');
      expect(result).toBe(true);
      expect(experiment.latticeType).toBe('hexagonal');
    });

    it('should reject invalid lattice type', () => {
      const result = experiment.configure('invalid');
      expect(result).toBe(false);
    });

    it('should reset formation progress on configure', () => {
      experiment._formationProgress = 0.5;
      experiment.configure('cubic');
      expect(experiment.formationProgress).toBe(0);
    });
  });

  describe('start()', () => {
    it('should fail if not configured first', () => {
      const result = experiment.start();
      expect(result).toBe(false);
    });

    it('should transition from IDLE to PREPARING when configured', () => {
      experiment.configure('cubic');
      const result = experiment.start();
      expect(result).toBe(true);
      expect(experiment.state).toBe('PREPARING');
    });

    it('should play start sound', () => {
      experiment.configure('cubic');
      experiment.start();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('crystal', 'start');
    });

    it('should trigger state change callback', () => {
      experiment.configure('cubic');
      experiment.start();
      expect(stateChangeCallback).toHaveBeenCalledWith('PREPARING', 'IDLE');
    });
  });

  describe('prepare()', () => {
    it('should transition from PREPARING to RUNNING', () => {
      experiment.configure('cubic');
      experiment.start();
      const result = experiment.prepare();
      expect(result).toBe(true);
      expect(experiment.state).toBe('RUNNING');
    });

    it('should set internal phase to FORMING', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      expect(experiment.phase).toBe('FORMING');
    });

    it('should play forming sound', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('crystal', 'forming');
    });

    it('should fail if not in PREPARING state', () => {
      const result = experiment.prepare();
      expect(result).toBe(false);
    });
  });

  describe('startCrystallization()', () => {
    it('should transition from FORMING to CRYSTALLIZING phase', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      experiment.startCrystallization();
      expect(experiment.phase).toBe('CRYSTALLIZING');
    });

    it('should only work from FORMING phase', () => {
      experiment.startCrystallization();
      expect(experiment.phase).toBe('IDLE');
    });

    it('should play crystallization sound', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      experiment.startCrystallization();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('crystal', 'crystallizing');
    });

    it('should trigger haptic callback', () => {
      const hapticMock = vi.fn();
      experiment.setHapticCallback(hapticMock);
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      experiment.startCrystallization();
      expect(hapticMock).toHaveBeenCalled();
    });
  });

  describe('completeExperiment()', () => {
    it('should transition from CRYSTALLIZING to COMPLETE phase', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      experiment.startCrystallization();
      experiment.completeExperiment();
      expect(experiment.phase).toBe('COMPLETE');
    });

    it('should transition base state to COMPLETED', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      experiment._phase = 'CRYSTALLIZING'; // Simulate crystallizing
      experiment.completeExperiment();
      expect(experiment.state).toBe('COMPLETED');
    });

    it('should play completion sound', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      experiment.startCrystallization();
      experiment.completeExperiment();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('crystal', 'complete');
    });

    it('should trigger haptic pulse on completion', () => {
      const hapticMock = vi.fn();
      experiment.setHapticCallback(hapticMock);
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      experiment.startCrystallization();
      experiment.completeExperiment();
      expect(hapticMock).toHaveBeenCalledWith(expect.any(Number));
    });
  });

  describe('highlightCell(cellIndex)', () => {
    it('should set highlighted cell index', () => {
      experiment.configure('cubic');
      experiment.highlightCell(2);
      expect(experiment.highlightedCell).toBe(2);
    });

    it('should clear highlight when passed null', () => {
      experiment.configure('cubic');
      experiment.highlightCell(2);
      experiment.highlightCell(null);
      expect(experiment.highlightedCell).toBeNull();
    });

    it('should play highlight sound', () => {
      experiment.configure('cubic');
      experiment.highlightCell(0);
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('crystal', 'highlight');
    });
  });

  describe('clearHighlight()', () => {
    it('should clear highlighted cell', () => {
      experiment.configure('cubic');
      experiment.highlightCell(2);
      experiment.clearHighlight();
      expect(experiment.highlightedCell).toBeNull();
    });
  });

  describe('onUpdate()', () => {
    it('should increase formation progress during FORMING phase', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      experiment.state = 'RUNNING';
      
      experiment.update(0.5);
      expect(experiment.formationProgress).toBeGreaterThan(0);
    });

    it('should auto-transition to CRYSTALLIZING when formation completes', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      experiment.state = 'RUNNING';
      
      // Simulate updates to complete formation (FORMATION_DURATION = 3.0)
      // 7 updates of 0.5 = 3.5 seconds, enough to complete formation
      for (let i = 0; i < 7; i++) {
        experiment.update(0.5);
      }
      // Should now be in CRYSTALLIZING phase
      expect(experiment.phase).toBe('CRYSTALLIZING');
    });

    it('should complete crystallization after CRYSTALLIZING duration', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      experiment.state = 'RUNNING';
      
      // Complete formation
      for (let i = 0; i < 20; i++) {
        experiment.update(0.5);
      }
      
      // Complete crystallization
      for (let i = 0; i < 10; i++) {
        experiment.update(0.5);
      }
      
      expect(experiment.phase).toBe('COMPLETE');
    });

    it('should not update when not in RUNNING state', () => {
      experiment.configure('cubic');
      experiment.update(0.5);
      expect(experiment.formationProgress).toBe(0);
    });
  });

  describe('render()', () => {
    it('should render lattice when configured', () => {
      experiment.configure('cubic');
      experiment.render(mockScene);
      // Should not throw
    });

    it('should render nothing when not configured', () => {
      experiment.render(mockScene);
      // Should not throw
    });

    it('should handle null scene gracefully', () => {
      experiment.configure('cubic');
      experiment.render(null);
      // Should not throw
    });
  });

  describe('reset()', () => {
    it('should reset all internal state', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      experiment.highlightCell(2);
      experiment._formationProgress = 0.75;
      
      experiment.reset();
      
      expect(experiment.phase).toBe('IDLE');
      expect(experiment.latticeType).toBeNull();
      expect(experiment.highlightedCell).toBeNull();
      expect(experiment.formationProgress).toBe(0);
    });

    it('should reset base class state', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      
      experiment.reset();
      
      expect(experiment.state).toBe('IDLE');
    });
  });

  describe('setHapticCallback()', () => {
    it('should set haptic callback', () => {
      const callback = vi.fn();
      experiment.setHapticCallback(callback);
      expect(experiment.hapticCallback).toBe(callback);
    });
  });

  describe('Lattice Type Validation', () => {
    it('should accept cubic lattice type', () => {
      expect(CrystalExperiment.isValidLatticeType('cubic')).toBe(true);
    });

    it('should accept hexagonal lattice type', () => {
      expect(CrystalExperiment.isValidLatticeType('hexagonal')).toBe(true);
    });

    it('should reject unknown lattice type', () => {
      expect(CrystalExperiment.isValidLatticeType('tetrahedral')).toBe(false);
    });

    it('should reject null lattice type', () => {
      expect(CrystalExperiment.isValidLatticeType(null)).toBe(false);
    });
  });

  describe('Cubic Lattice Configuration', () => {
    it('should have correct atom positions for cubic lattice', () => {
      experiment.configure('cubic');
      const positions = experiment.getAtomPositions();
      // Cubic lattice should have 8 corner atoms + potentially center atoms
      expect(positions.length).toBeGreaterThan(0);
    });

    it('should have correct unit cell count for cubic', () => {
      experiment.configure('cubic');
      const cellCount = experiment.getUnitCellCount();
      expect(cellCount).toBeGreaterThan(0);
    });
  });

  describe('Hexagonal Lattice Configuration', () => {
    it('should have correct atom positions for hexagonal lattice', () => {
      experiment.configure('hexagonal');
      const positions = experiment.getAtomPositions();
      expect(positions.length).toBeGreaterThan(0);
    });

    it('should have different structure than cubic', () => {
      experiment.configure('cubic');
      const cubicPositions = experiment.getAtomPositions();
      
      experiment.reset();
      experiment.configure('hexagonal');
      const hexPositions = experiment.getAtomPositions();
      
      // Different lattice types should have different atom counts or positions
      expect(cubicPositions.length).not.toBe(hexPositions.length);
    });
  });

  describe('Full Workflow', () => {
    it('should support complete crystal experiment lifecycle', () => {
      // Configure
      expect(experiment.configure('cubic')).toBe(true);
      expect(experiment.latticeType).toBe('cubic');
      
      // Start
      expect(experiment.start()).toBe(true);
      expect(experiment.state).toBe('PREPARING');
      
      // Prepare
      expect(experiment.prepare()).toBe(true);
      expect(experiment.state).toBe('RUNNING');
      expect(experiment.phase).toBe('FORMING');
      
      // Simulate formation progress
      experiment._formationProgress = 1.0;
      experiment._phase = 'CRYSTALLIZING';
      
      // Highlight a cell
      experiment.highlightCell(0);
      expect(experiment.highlightedCell).toBe(0);
      
      // Complete
      experiment.completeExperiment();
      expect(experiment.phase).toBe('COMPLETE');
      expect(experiment.state).toBe('COMPLETED');
      
      // Reset
      experiment.reset();
      expect(experiment.state).toBe('IDLE');
      expect(experiment.phase).toBe('IDLE');
    });

    it('should support hexagonal crystal workflow', () => {
      experiment.configure('hexagonal');
      experiment.start();
      experiment.prepare();
      
      expect(experiment.latticeType).toBe('hexagonal');
      expect(experiment.phase).toBe('FORMING');
    });
  });

  describe('Error Handling', () => {
    it('should handle error state from any state', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.prepare();
      
      experiment.error('Test error');
      
      expect(experiment.state).toBe('ERROR');
      expect(experiment.errorMessage).toBe('Test error');
    });

    it('should play error sound on error', () => {
      experiment.configure('cubic');
      experiment.start();
      experiment.error('Test error');
      
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('crystal', 'error');
    });
  });
});
