import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExperimentBase from '../ExperimentBase.js';

describe('ExperimentBase', () => {
  let experiment;
  let stateChangeCallback;

  beforeEach(() => {
    stateChangeCallback = vi.fn();
    experiment = new ExperimentBase();
    experiment.onStateChange(stateChangeCallback);
  });

  describe('States', () => {
    it('should define state constants', () => {
      expect(ExperimentBase.STATES.IDLE).toBe('IDLE');
      expect(ExperimentBase.STATES.PREPARING).toBe('PREPARING');
      expect(ExperimentBase.STATES.RUNNING).toBe('RUNNING');
      expect(ExperimentBase.STATES.COMPLETED).toBe('COMPLETED');
      expect(ExperimentBase.STATES.ERROR).toBe('ERROR');
    });

    it('should start in IDLE state', () => {
      expect(experiment.state).toBe('IDLE');
    });
  });

  describe('start()', () => {
    it('should transition from IDLE to PREPARING', () => {
      experiment.start();
      expect(experiment.state).toBe('PREPARING');
    });

    it('should call onStateChange callback with new state', () => {
      experiment.start();
      expect(stateChangeCallback).toHaveBeenCalledWith('PREPARING', 'IDLE');
    });

    it('should call onStart hook', () => {
      const onStartSpy = vi.fn();
      experiment.onStart = onStartSpy;
      experiment.start();
      expect(onStartSpy).toHaveBeenCalled();
    });

    it('should not start from non-IDLE states', () => {
      experiment.state = 'RUNNING';
      const result = experiment.start();
      expect(result).toBe(false);
      expect(experiment.state).toBe('RUNNING');
    });

    it('should return true when start succeeds', () => {
      const result = experiment.start();
      expect(result).toBe(true);
    });
  });

  describe('prepare()', () => {
    it('should transition from PREPARING to RUNNING', () => {
      experiment.state = 'PREPARING';
      experiment.prepare();
      expect(experiment.state).toBe('RUNNING');
    });

    it('should only work from PREPARING state', () => {
      experiment.state = 'IDLE';
      const result = experiment.prepare();
      expect(result).toBe(false);
      expect(experiment.state).toBe('IDLE');
    });
  });

  describe('pause()', () => {
    it('should transition from RUNNING to IDLE', () => {
      experiment.state = 'RUNNING';
      experiment.pause();
      expect(experiment.state).toBe('IDLE');
    });

    it('should not pause from non-RUNNING states', () => {
      experiment.state = 'PREPARING';
      const result = experiment.pause();
      expect(result).toBe(false);
      expect(experiment.state).toBe('PREPARING');
    });

    it('should return true when pause succeeds', () => {
      experiment.state = 'RUNNING';
      const result = experiment.pause();
      expect(result).toBe(true);
    });
  });

  describe('reset()', () => {
    it('should transition to IDLE from any state', () => {
      experiment.state = 'COMPLETED';
      experiment.reset();
      expect(experiment.state).toBe('IDLE');
    });

    it('should transition from ERROR to IDLE', () => {
      experiment.state = 'ERROR';
      experiment.reset();
      expect(experiment.state).toBe('IDLE');
    });

    it('should call onStateChange callback', () => {
      experiment.state = 'RUNNING';
      stateChangeCallback.mockClear();
      experiment.reset();
      expect(stateChangeCallback).toHaveBeenCalledWith('IDLE', 'RUNNING');
    });
  });

  describe('complete()', () => {
    it('should transition from RUNNING to COMPLETED', () => {
      experiment.state = 'RUNNING';
      experiment.complete();
      expect(experiment.state).toBe('COMPLETED');
    });

    it('should call onComplete hook', () => {
      const onCompleteSpy = vi.fn();
      experiment.onComplete = onCompleteSpy;
      experiment.state = 'RUNNING';
      experiment.complete();
      expect(onCompleteSpy).toHaveBeenCalled();
    });

    it('should not complete from non-RUNNING states', () => {
      experiment.state = 'IDLE';
      const result = experiment.complete();
      expect(result).toBe(false);
      expect(experiment.state).toBe('IDLE');
    });
  });

  describe('error()', () => {
    it('should transition to ERROR from any state', () => {
      experiment.state = 'RUNNING';
      experiment.error('Test error');
      expect(experiment.state).toBe('ERROR');
    });

    it('should store error message', () => {
      experiment.state = 'RUNNING';
      experiment.error('Something went wrong');
      expect(experiment.errorMessage).toBe('Something went wrong');
    });
  });

  describe('update()', () => {
    it('should call onUpdate when RUNNING', () => {
      const onUpdateSpy = vi.fn();
      experiment.onUpdate = onUpdateSpy;
      experiment.state = 'RUNNING';
      experiment.update(0.016);
      expect(onUpdateSpy).toHaveBeenCalledWith(0.016);
    });

    it('should not call onUpdate when not RUNNING', () => {
      const onUpdateSpy = vi.fn();
      experiment.onUpdate = onUpdateSpy;
      experiment.state = 'IDLE';
      experiment.update(0.016);
      expect(onUpdateSpy).not.toHaveBeenCalled();
    });
  });

  describe('render()', () => {
    it('should be callable', () => {
      const scene = { add: vi.fn() };
      experiment.render(scene);
      // Base implementation does nothing, should not throw
    });
  });

  describe('onStateChange()', () => {
    it('should register callback', () => {
      const callback = vi.fn();
      experiment.onStateChange(callback);
      experiment.start();
      expect(callback).toHaveBeenCalled();
    });

    it('should replace previous callback', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      experiment.onStateChange(callback1);
      experiment.onStateChange(callback2);
      experiment.start();
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('Full workflow', () => {
    it('should support typical experiment lifecycle', () => {
      // Start experiment
      expect(experiment.start()).toBe(true);
      expect(experiment.state).toBe('PREPARING');

      // Prepare complete
      expect(experiment.prepare()).toBe(true);
      expect(experiment.state).toBe('RUNNING');

      // Update during run
      const onUpdateSpy = vi.fn();
      experiment.onUpdate = onUpdateSpy;
      experiment.update(0.016);
      expect(onUpdateSpy).toHaveBeenCalled();

      // Complete experiment
      expect(experiment.complete()).toBe(true);
      expect(experiment.state).toBe('COMPLETED');

      // Reset for next run
      experiment.reset();
      expect(experiment.state).toBe('IDLE');
    });
  });
});
