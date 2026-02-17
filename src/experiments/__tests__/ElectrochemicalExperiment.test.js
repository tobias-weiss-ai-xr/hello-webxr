import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ElectrochemicalExperiment from '../ElectrochemicalExperiment.js';

// Mock THREE.js for visualization tests
const mockMesh = vi.fn().mockImplementation(function(geo, mat) {
  return {
    geometry: geo,
    material: mat,
    position: { set: vi.fn() },
    scale: { y: 1 },
    name: 'mockMesh'
  };
});

const mockGeometry = vi.fn().mockImplementation(function() {
  return { dispose: vi.fn() };
});

const mockMaterial = vi.fn().mockImplementation(function(props) {
  return { 
    dispose: vi.fn(),
    color: { setHex: vi.fn() },
    ...props
  };
});

const mockTHREE = {
  BoxGeometry: mockGeometry,
  CylinderGeometry: mockGeometry,
  TorusGeometry: mockGeometry,
  MeshBasicMaterial: mockMaterial,
  Mesh: mockMesh
};

describe('ElectrochemicalExperiment', () => {
  beforeEach(() => {
    // Set up global THREE mock
    window.THREE = mockTHREE;
  });

  afterEach(() => {
    // Clean up
    delete window.THREE;
    vi.clearAllMocks();
  });
  let experiment;
  let stateChangeCallback;

  beforeEach(() => {
    stateChangeCallback = vi.fn();
    experiment = new ElectrochemicalExperiment();
    experiment.onStateChange(stateChangeCallback);
  });

  describe('Constants and Initialization', () => {
    it('should define mode constants for electrochemical phases', () => {
      expect(ElectrochemicalExperiment.MODES).toBeDefined();
      expect(ElectrochemicalExperiment.MODES.IDLE).toBe('IDLE');
      expect(ElectrochemicalExperiment.MODES.CHARGING).toBe('CHARGING');
      expect(ElectrochemicalExperiment.MODES.DISCHARGING).toBe('DISCHARGING');
      expect(ElectrochemicalExperiment.MODES.COMPLETE).toBe('COMPLETE');
    });

    it('should define experiment types', () => {
      expect(ElectrochemicalExperiment.TYPES).toBeDefined();
      expect(ElectrochemicalExperiment.TYPES.BATTERY).toBe('battery');
      expect(ElectrochemicalExperiment.TYPES.ELECTROLYSIS).toBe('electrolysis');
      expect(ElectrochemicalExperiment.TYPES.GALVANIC).toBe('galvanic');
    });

    it('should start with IDLE mode', () => {
      expect(experiment.mode).toBe('IDLE');
    });

    it('should start with battery type as default', () => {
      expect(experiment.experimentType).toBe('battery');
    });

    it('should initialize with full battery charge', () => {
      expect(experiment.batteryCharge).toBe(1.0);
    });

    it('should accept experiment type in constructor', () => {
      const electrolysisExp = new ElectrochemicalExperiment('electrolysis');
      expect(electrolysisExp.experimentType).toBe('electrolysis');
    });
  });

  describe('State Machine - Base Class Integration', () => {
    it('should extend ExperimentBase', () => {
      expect(experiment.state).toBe('IDLE');
      expect(experiment.start).toBeDefined();
      expect(experiment.complete).toBeDefined();
      expect(experiment.reset).toBeDefined();
    });

    it('should transition to PREPARING on start()', () => {
      experiment.start();
      expect(experiment.state).toBe('PREPARING');
    });

    it('should transition to RUNNING on prepare()', () => {
      experiment.start();
      experiment.prepare();
      expect(experiment.state).toBe('RUNNING');
    });
  });

  describe('Battery Discharge', () => {
    it('should decrease battery charge during update', () => {
      experiment.start();
      experiment.prepare();
      expect(experiment.state).toBe('RUNNING');
      
      const initialCharge = experiment.batteryCharge;
      experiment.update(1.0); // 1 second update
      
      expect(experiment.batteryCharge).toBeLessThan(initialCharge);
    });

    it('should set mode to DISCHARGING when running', () => {
      experiment.start();
      experiment.prepare();
      expect(experiment.mode).toBe('DISCHARGING');
    });

    it('should complete when battery charge reaches zero', () => {
      experiment.start();
      experiment.prepare();
      experiment.batteryCharge = 0.01;
      experiment.update(1.0);
      
      expect(experiment.state).toBe('COMPLETED');
      expect(experiment.mode).toBe('COMPLETE');
    });

    it('should not decrease charge when not running', () => {
      const initialCharge = experiment.batteryCharge;
      experiment.update(1.0);
      expect(experiment.batteryCharge).toBe(initialCharge);
    });

    it('should use configurable discharge rate', () => {
      const fastDischarge = new ElectrochemicalExperiment('battery');
      fastDischarge.dischargeRate = 0.5; // 50% per second
      fastDischarge.start();
      fastDischarge.prepare();
      
      fastDischarge.update(1.0);
      expect(fastDischarge.batteryCharge).toBeCloseTo(0.5, 2);
    });
  });

  describe('Electrolysis', () => {
    let electrolysis;

    beforeEach(() => {
      electrolysis = new ElectrochemicalExperiment('electrolysis');
    });

    it('should create hydrogen and oxygen bubbles during update', () => {
      electrolysis.start();
      electrolysis.prepare();
      
      electrolysis.update(1.0);
      
      expect(electrolysis.hydrogenBubbles).toBeDefined();
      expect(electrolysis.oxygenBubbles).toBeDefined();
    });

    it('should track bubble counts', () => {
      electrolysis.start();
      electrolysis.prepare();
      
      electrolysis.update(1.0);
      
      expect(electrolysis.hydrogenBubbleCount).toBeGreaterThan(0);
      expect(electrolysis.oxygenBubbleCount).toBeGreaterThan(0);
    });

    it('should produce twice as many hydrogen bubbles as oxygen (H2O ratio)', () => {
      electrolysis.start();
      electrolysis.prepare();
      
      electrolysis.update(2.0);
      
      // H2O = 2H + 1O, so ratio should be approximately 2:1
      const ratio = electrolysis.hydrogenBubbleCount / electrolysis.oxygenBubbleCount;
      expect(ratio).toBeCloseTo(2, 0);
    });

    it('should complete after sufficient time', () => {
      electrolysis.start();
      electrolysis.prepare();
      electrolysis.elapsedTime = electrolysis.completionTime - 0.1;
      
      electrolysis.update(0.2);
      
      expect(electrolysis.state).toBe('COMPLETED');
    });
  });

  describe('Galvanic Cell', () => {
    let galvanic;

    beforeEach(() => {
      galvanic = new ElectrochemicalExperiment('galvanic');
    });

    it('should track electron flow direction', () => {
      galvanic.start();
      galvanic.prepare();
      
      expect(galvanic.electronFlowDirection).toBeDefined();
    });

    it('should have zinc as anode and copper as cathode', () => {
      expect(galvanic.anode).toBe('Zn');
      expect(galvanic.cathode).toBe('Cu');
    });

    it('should track current flow during operation', () => {
      galvanic.start();
      galvanic.prepare();
      
      galvanic.update(1.0);
      
      expect(galvanic.currentFlow).toBeGreaterThan(0);
    });

    it('should deplete zinc electrode over time', () => {
      galvanic.start();
      galvanic.prepare();
      
      const initialZinc = galvanic.zincLevel;
      galvanic.update(5.0);
      
      expect(galvanic.zincLevel).toBeLessThan(initialZinc);
    });

    it('should complete when zinc is depleted', () => {
      galvanic.start();
      galvanic.prepare();
      galvanic.zincLevel = 0.01;
      
      galvanic.update(1.0);
      
      expect(galvanic.state).toBe('COMPLETED');
    });
  });

  describe('Audio and Haptics Integration', () => {
    it('should have audio manager reference', () => {
      expect(experiment.audioManager).toBeNull();
    });

    it('should accept audio manager via setAudioManager', () => {
      const mockAudioManager = {
        playExperimentSound: vi.fn()
      };
      
      experiment.setAudioManager(mockAudioManager);
      expect(experiment.audioManager).toBe(mockAudioManager);
    });

    it('should play sound on start', () => {
      const mockAudioManager = {
        playExperimentSound: vi.fn()
      };
      experiment.setAudioManager(mockAudioManager);
      
      experiment.start();
      
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith(
        'electrochemical',
        'start'
      );
    });

    it('should have haptic callback support', () => {
      const mockHaptic = vi.fn();
      experiment.setHapticCallback(mockHaptic);
      
      experiment.start();
      experiment.prepare();
      experiment.triggerHaptic('discharge');
      
      expect(mockHaptic).toHaveBeenCalledWith('discharge');
    });
  });

  describe('Render and Visualization', () => {
    it('should have render method', () => {
      expect(experiment.render).toBeDefined();
    });

    it('should create battery mesh when render called for battery type', () => {
      const mockScene = { add: vi.fn() };
      experiment.render(mockScene);
      
      expect(mockScene.add).toHaveBeenCalled();
    });

    it('should store mesh references for cleanup', () => {
      const mockScene = { add: vi.fn() };
      experiment.render(mockScene);
      
      expect(experiment.meshes).toBeDefined();
      expect(experiment.meshes.length).toBeGreaterThan(0);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset battery charge to full', () => {
      experiment.start();
      experiment.prepare();
      experiment.batteryCharge = 0.5;
      
      experiment.reset();
      
      expect(experiment.batteryCharge).toBe(1.0);
    });

    it('should reset mode to IDLE', () => {
      experiment.start();
      experiment.prepare();
      expect(experiment.mode).toBe('DISCHARGING');
      
      experiment.reset();
      
      expect(experiment.mode).toBe('IDLE');
    });

    it('should reset elapsed time', () => {
      experiment.start();
      experiment.prepare();
      experiment.update(5.0);
      
      experiment.reset();
      
      expect(experiment.elapsedTime).toBe(0);
    });

    it('should reset bubble counts for electrolysis', () => {
      const electrolysis = new ElectrochemicalExperiment('electrolysis');
      electrolysis.start();
      electrolysis.prepare();
      electrolysis.update(2.0);
      
      electrolysis.reset();
      
      expect(electrolysis.hydrogenBubbleCount).toBe(0);
      expect(electrolysis.oxygenBubbleCount).toBe(0);
    });

    it('should reset zinc level for galvanic cell', () => {
      const galvanic = new ElectrochemicalExperiment('galvanic');
      galvanic.start();
      galvanic.prepare();
      galvanic.update(5.0);
      
      galvanic.reset();
      
      expect(galvanic.zincLevel).toBe(1.0);
    });
  });

  describe('Full Experiment Workflow', () => {
    it('should complete full battery discharge cycle', () => {
      // Start
      expect(experiment.start()).toBe(true);
      expect(experiment.state).toBe('PREPARING');
      expect(experiment.mode).toBe('CHARGING');
      
      // Prepare
      expect(experiment.prepare()).toBe(true);
      expect(experiment.state).toBe('RUNNING');
      expect(experiment.mode).toBe('DISCHARGING');
      
      // Simulate full discharge
      while (experiment.batteryCharge > 0 && experiment.state === 'RUNNING') {
        experiment.update(0.1);
      }
      
      // Verify completion
      expect(experiment.state).toBe('COMPLETED');
      expect(experiment.mode).toBe('COMPLETE');
    });

    it('should support pause and resume', () => {
      experiment.start();
      experiment.prepare();
      
      experiment.update(1.0);
      const chargeAfterFirst = experiment.batteryCharge;
      
      // Pause
      expect(experiment.pause()).toBe(true);
      expect(experiment.state).toBe('IDLE');
      
      // Update should not affect charge while paused
      experiment.update(1.0);
      expect(experiment.batteryCharge).toBe(chargeAfterFirst);
      
      // Resume - need to start fresh from IDLE
      experiment.start();
      experiment.prepare();
      expect(experiment.state).toBe('RUNNING');
    });
  });
});
