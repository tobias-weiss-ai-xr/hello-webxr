import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElectricalExperiment from '../ElectricalExperiment.js';

describe('ElectricalExperiment', () => {
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
    experiment = new ElectricalExperiment({ audioManager: mockAudioManager });
    experiment.onStateChange(stateChangeCallback);
  });

  describe('Constants and Initial State', () => {
    it('should define phase constants', () => {
      expect(ElectricalExperiment.PHASES.IDLE).toBe('IDLE');
      expect(ElectricalExperiment.PHASES.CONNECTING).toBe('CONNECTING');
      expect(ElectricalExperiment.PHASES.FLOWING).toBe('FLOWING');
      expect(ElectricalExperiment.PHASES.MEASURING).toBe('MEASURING');
      expect(ElectricalExperiment.PHASES.COMPLETE).toBe('COMPLETE');
    });

    it('should start with phase IDLE', () => {
      expect(experiment.phase).toBe('IDLE');
    });

    it('should start with no connected wires', () => {
      expect(experiment.connectedWires).toBe(0);
    });

    it('should start with circuit inactive', () => {
      expect(experiment.circuitActive).toBe(false);
    });

    it('should start with no conductivity result', () => {
      expect(experiment.conductivityResult).toBeNull();
    });
  });

  describe('connectWire()', () => {
    it('should increment connected wire count', () => {
      experiment.connectWire();
      expect(experiment.connectedWires).toBe(1);
    });

    it('should transition to CONNECTING phase on first wire', () => {
      experiment.connectWire();
      expect(experiment.phase).toBe('CONNECTING');
    });

    it('should remain in CONNECTING phase for subsequent wires', () => {
      experiment.connectWire();
      experiment.connectWire();
      expect(experiment.phase).toBe('CONNECTING');
    });

    it('should activate circuit when all wires connected (3 wires)', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      expect(experiment.circuitActive).toBe(true);
    });

    it('should transition to FLOWING phase when circuit complete', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      expect(experiment.phase).toBe('FLOWING');
    });

    it('should play electrical sound on wire connection', () => {
      experiment.connectWire();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('electrical', 'connect');
    });

    it('should not exceed 3 wires maximum', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      expect(experiment.connectedWires).toBe(3);
    });
  });

  describe('testConductivity()', () => {
    it('should only work when circuit is active', () => {
      experiment.testConductivity('copper');
      expect(experiment.conductivityResult).toBeNull();
    });

    it('should return true for conductive materials', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      
      const result = experiment.testConductivity('copper');
      expect(result).toBe(true);
      expect(experiment.conductivityResult).toBe(true);
    });

    it('should return false for non-conductive materials', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      
      const result = experiment.testConductivity('rubber');
      expect(result).toBe(false);
      expect(experiment.conductivityResult).toBe(false);
    });

    it('should transition to MEASURING phase', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      experiment.testConductivity('copper');
      expect(experiment.phase).toBe('MEASURING');
    });

    it('should play measurement sound', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      experiment.testConductivity('copper');
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('electrical', 'measure');
    });
  });

  describe('Conductive Materials', () => {
    beforeEach(() => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
    });

    it('should identify copper as conductive', () => {
      expect(experiment.testConductivity('copper')).toBe(true);
    });

    it('should identify aluminum as conductive', () => {
      expect(experiment.testConductivity('aluminum')).toBe(true);
    });

    it('should identify gold as conductive', () => {
      expect(experiment.testConductivity('gold')).toBe(true);
    });

    it('should identify silver as conductive', () => {
      expect(experiment.testConductivity('silver')).toBe(true);
    });

    it('should identify iron as conductive', () => {
      expect(experiment.testConductivity('iron')).toBe(true);
    });

    it('should identify rubber as non-conductive', () => {
      expect(experiment.testConductivity('rubber')).toBe(false);
    });

    it('should identify glass as non-conductive', () => {
      expect(experiment.testConductivity('glass')).toBe(false);
    });

    it('should identify plastic as non-conductive', () => {
      expect(experiment.testConductivity('plastic')).toBe(false);
    });

    it('should identify wood as non-conductive', () => {
      expect(experiment.testConductivity('wood')).toBe(false);
    });
  });

  describe('showMagneticField()', () => {
    it('should only work when circuit is active', () => {
      const result = experiment.showMagneticField();
      expect(result).toBe(false);
    });

    it('should return true when circuit is active', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      const result = experiment.showMagneticField();
      expect(result).toBe(true);
    });

    it('should set magneticFieldVisible to true', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      experiment.showMagneticField();
      expect(experiment.magneticFieldVisible).toBe(true);
    });

    it('should play field visualization sound', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      experiment.showMagneticField();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('electrical', 'field');
    });
  });

  describe('completeExperiment()', () => {
    it('should transition to COMPLETE phase', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      experiment.testConductivity('copper');
      experiment.completeExperiment();
      expect(experiment.phase).toBe('COMPLETE');
    });

    it('should play completion sound', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      experiment.testConductivity('copper');
      experiment.completeExperiment();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('electrical', 'complete');
    });
  });

  describe('reset()', () => {
    it('should reset all internal state', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      experiment.testConductivity('copper');
      experiment.showMagneticField();
      
      experiment.reset();
      
      expect(experiment.phase).toBe('IDLE');
      expect(experiment.connectedWires).toBe(0);
      expect(experiment.circuitActive).toBe(false);
      expect(experiment.conductivityResult).toBeNull();
      expect(experiment.magneticFieldVisible).toBe(false);
    });
  });

  describe('onUpdate()', () => {
    it('should update electron particles when circuit is active', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      
      // Base class update() only calls onUpdate() when state is RUNNING
      experiment.state = 'RUNNING';
      
      const updateSpy = vi.fn();
      experiment._updateElectrons = updateSpy;
      
      experiment.update(0.016);
      expect(updateSpy).toHaveBeenCalledWith(0.016);
    });

    it('should not update electrons when circuit is inactive', () => {
      const updateSpy = vi.fn();
      experiment._updateElectrons = updateSpy;
      
      experiment.update(0.016);
      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('render()', () => {
    it('should add visual elements to scene when circuit is active', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      experiment.render(mockScene);
      // Should not throw, visual elements added
    });

    it('should add magnetic field lines when visible', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      experiment.showMagneticField();
      experiment.render(mockScene);
      // Should not throw
    });
  });

  describe('Haptic Feedback', () => {
    it('should provide haptic pulse data when current flows', () => {
      experiment.connectWire();
      experiment.connectWire();
      experiment.connectWire();
      
      expect(experiment.hapticPulse).toBeDefined();
      expect(experiment.hapticPulse.intensity).toBeGreaterThan(0);
    });

    it('should have no haptic pulse when circuit is inactive', () => {
      expect(experiment.hapticPulse).toBeNull();
    });
  });

  describe('Full Workflow', () => {
    it('should support complete electrical experiment lifecycle', () => {
      // Start experiment
      expect(experiment.phase).toBe('IDLE');
      
      // Connect wires
      experiment.connectWire();
      expect(experiment.phase).toBe('CONNECTING');
      expect(experiment.connectedWires).toBe(1);
      
      experiment.connectWire();
      expect(experiment.connectedWires).toBe(2);
      
      experiment.connectWire();
      expect(experiment.phase).toBe('FLOWING');
      expect(experiment.circuitActive).toBe(true);
      
      // Test conductivity
      const conductResult = experiment.testConductivity('copper');
      expect(conductResult).toBe(true);
      expect(experiment.phase).toBe('MEASURING');
      
      // Show magnetic field
      experiment.showMagneticField();
      expect(experiment.magneticFieldVisible).toBe(true);
      
      // Complete
      experiment.completeExperiment();
      expect(experiment.phase).toBe('COMPLETE');
      
      // Reset
      experiment.reset();
      expect(experiment.phase).toBe('IDLE');
      expect(experiment.connectedWires).toBe(0);
    });
  });
});
