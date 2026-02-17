import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReactionExperiment from '../ReactionExperiment.js';

describe('ReactionExperiment', () => {
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
    
    experiment = new ReactionExperiment({
      audioManager: mockAudioManager
    });
    experiment.onStateChange(stateChangeCallback);
  });

  describe('States', () => {
    it('should define custom reaction states', () => {
      expect(ReactionExperiment.STATES.IDLE).toBe('IDLE');
      expect(ReactionExperiment.STATES.DROPPING).toBe('DROPPING');
      expect(ReactionExperiment.STATES.REACTING).toBe('REACTING');
      expect(ReactionExperiment.STATES.BUBBLING).toBe('BUBBLING');
      expect(ReactionExperiment.STATES.COMPLETE).toBe('COMPLETE');
      expect(ReactionExperiment.STATES.ERROR).toBe('ERROR');
    });

    it('should start in IDLE state', () => {
      expect(experiment.state).toBe('IDLE');
    });
  });

  describe('Reaction Configuration', () => {
    it('should have water reaction config for Lithium', () => {
      const config = ReactionExperiment.getReactionConfig('Li', 'water');
      expect(config).toBeDefined();
      expect(config.vigor).toBe('gentle');
      expect(config.flameColor).toBe(0xFF4444);
      expect(config.bubbleIntensity).toBe(0.3);
    });

    it('should have water reaction config for Sodium', () => {
      const config = ReactionExperiment.getReactionConfig('Na', 'water');
      expect(config).toBeDefined();
      expect(config.vigor).toBe('moderate');
      expect(config.flameColor).toBe(0xFFAA00);
      expect(config.bubbleIntensity).toBe(0.6);
    });

    it('should have water reaction config for Potassium', () => {
      const config = ReactionExperiment.getReactionConfig('K', 'water');
      expect(config).toBeDefined();
      expect(config.vigor).toBe('vigorous');
      expect(config.flameColor).toBe(0x8844FF);
      expect(config.bubbleIntensity).toBe(1.0);
    });

    it('should return null for unsupported elements', () => {
      const config = ReactionExperiment.getReactionConfig('Fe', 'water');
      expect(config).toBeNull();
    });

    it('should return null for unsupported reaction types', () => {
      const config = ReactionExperiment.getReactionConfig('Na', 'other');
      expect(config).toBeNull();
    });
  });

  describe('Flame Reaction', () => {
    it('should have flame config for Lithium', () => {
      const config = ReactionExperiment.getReactionConfig('Li', 'flame');
      expect(config).toBeDefined();
      expect(config.flameColor).toBe(0xFF4444); // Crimson red
    });

    it('should have flame config for Sodium', () => {
      const config = ReactionExperiment.getReactionConfig('Na', 'flame');
      expect(config).toBeDefined();
      expect(config.flameColor).toBe(0xFFAA00); // Bright yellow
    });

    it('should have flame config for Potassium', () => {
      const config = ReactionExperiment.getReactionConfig('K', 'flame');
      expect(config).toBeDefined();
      expect(config.flameColor).toBe(0x8844FF); // Violet
    });
  });

  describe('start()', () => {
    it('should transition from IDLE to DROPPING when start called with valid config', () => {
      experiment.configure('Na', 'water');
      const result = experiment.start();
      expect(result).toBe(true);
      expect(experiment.state).toBe('DROPPING');
    });

    it('should not start without configuration', () => {
      const result = experiment.start();
      expect(result).toBe(false);
      expect(experiment.state).toBe('IDLE');
    });

    it('should call onStateChange callback', () => {
      experiment.configure('Na', 'water');
      experiment.start();
      expect(stateChangeCallback).toHaveBeenCalledWith('DROPPING', 'IDLE');
    });

    it('should call onStart hook', () => {
      const onStartSpy = vi.fn();
      experiment.onStart = onStartSpy;
      experiment.configure('Na', 'water');
      experiment.start();
      expect(onStartSpy).toHaveBeenCalled();
    });

    it('should play experiment start sound', () => {
      experiment.configure('Na', 'water');
      experiment.start();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('reaction', 'start');
    });
  });

  describe('configure()', () => {
    it('should accept element symbol and reaction type', () => {
      const result = experiment.configure('Na', 'water');
      expect(result).toBe(true);
      expect(experiment.elementSymbol).toBe('Na');
      expect(experiment.reactionType).toBe('water');
    });

    it('should reject invalid element', () => {
      const result = experiment.configure('Fe', 'water');
      expect(result).toBe(false);
    });

    it('should reject invalid reaction type', () => {
      const result = experiment.configure('Na', 'invalid');
      expect(result).toBe(false);
    });

    it('should not allow configuration while running', () => {
      experiment.configure('Na', 'water');
      experiment.start();
      const result = experiment.configure('K', 'water');
      expect(result).toBe(false);
      expect(experiment.elementSymbol).toBe('Na');
    });
  });

  describe('drop()', () => {
    it('should transition from DROPPING to REACTING', () => {
      experiment.configure('Na', 'water');
      experiment.start();
      expect(experiment.state).toBe('DROPPING');
      
      experiment.drop();
      expect(experiment.state).toBe('REACTING');
    });

    it('should only work from DROPPING state', () => {
      experiment.configure('Na', 'water');
      const result = experiment.drop();
      expect(result).toBe(false);
      expect(experiment.state).toBe('IDLE');
    });
  });

  describe('react()', () => {
    it('should transition from REACTING to BUBBLING', () => {
      experiment.configure('Na', 'water');
      experiment.start();
      experiment.drop();
      expect(experiment.state).toBe('REACTING');
      
      experiment.react();
      expect(experiment.state).toBe('BUBBLING');
    });

    it('should only work from REACTING state', () => {
      experiment.configure('Na', 'water');
      const result = experiment.react();
      expect(result).toBe(false);
    });

    it('should play progress sound', () => {
      experiment.configure('Na', 'water');
      experiment.start();
      experiment.drop();
      mockAudioManager.playExperimentSound.mockClear();
      
      experiment.react();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('reaction', 'progress');
    });
  });

  describe('bubble()', () => {
    it('should transition from BUBBLING to COMPLETE', () => {
      experiment.configure('Na', 'water');
      experiment.start();
      experiment.drop();
      experiment.react();
      expect(experiment.state).toBe('BUBBLING');
      
      experiment.bubble();
      expect(experiment.state).toBe('COMPLETE');
    });

    it('should only work from BUBBLING state', () => {
      experiment.configure('Na', 'water');
      const result = experiment.bubble();
      expect(result).toBe(false);
    });
  });

  describe('complete()', () => {
    it('should play complete sound', () => {
      experiment.configure('Na', 'water');
      experiment.start();
      experiment.drop();
      experiment.react();
      mockAudioManager.playExperimentSound.mockClear();
      
      experiment.bubble();
      expect(mockAudioManager.playExperimentSound).toHaveBeenCalledWith('reaction', 'complete');
    });
  });

  describe('reset()', () => {
    it('should reset to IDLE and clear configuration', () => {
      experiment.configure('Na', 'water');
      experiment.start();
      experiment.drop();
      
      experiment.reset();
      expect(experiment.state).toBe('IDLE');
      expect(experiment.elementSymbol).toBeNull();
      expect(experiment.reactionType).toBeNull();
    });
  });

  describe('update()', () => {
    it('should call onUpdate when in REACTING or BUBBLING state', () => {
      const onUpdateSpy = vi.fn();
      experiment.onUpdate = onUpdateSpy;
      experiment.configure('Na', 'water');
      experiment.start();
      experiment.drop();
      
      experiment.update(0.016);
      expect(onUpdateSpy).toHaveBeenCalledWith(0.016);
    });

    it('should not call onUpdate when in IDLE state', () => {
      const onUpdateSpy = vi.fn();
      experiment.onUpdate = onUpdateSpy;
      
      experiment.update(0.016);
      expect(onUpdateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Vigor Properties', () => {
    it('should calculate haptic intensity based on vigor', () => {
      experiment.configure('Li', 'water');
      experiment.start();
      experiment.drop();
      expect(experiment.getHapticIntensity()).toBe(0.3);

      experiment.reset();
      experiment.configure('Na', 'water');
      experiment.start();
      experiment.drop();
      expect(experiment.getHapticIntensity()).toBe(0.6);

      experiment.reset();
      experiment.configure('K', 'water');
      experiment.start();
      experiment.drop();
      expect(experiment.getHapticIntensity()).toBe(1.0);
    });

    it('should return 0 haptic intensity when not configured', () => {
      expect(experiment.getHapticIntensity()).toBe(0);
    });
  });

  describe('render()', () => {
    it('should be callable with scene', () => {
      experiment.render(mockScene);
      // Should not throw
    });
  });

  describe('Full Water Reaction Workflow', () => {
    it('should support complete water reaction lifecycle', () => {
      // Configure
      expect(experiment.configure('Na', 'water')).toBe(true);
      
      // Start (IDLE -> DROPPING)
      expect(experiment.start()).toBe(true);
      expect(experiment.state).toBe('DROPPING');
      
      // Drop (DROPPING -> REACTING)
      expect(experiment.drop()).toBe(true);
      expect(experiment.state).toBe('REACTING');
      
      // React (REACTING -> BUBBLING)
      expect(experiment.react()).toBe(true);
      expect(experiment.state).toBe('BUBBLING');
      
      // Bubble (BUBBLING -> COMPLETE)
      expect(experiment.bubble()).toBe(true);
      expect(experiment.state).toBe('COMPLETE');
      
      // Reset
      experiment.reset();
      expect(experiment.state).toBe('IDLE');
    });

    it('should support potassium vigorous reaction', () => {
      experiment.configure('K', 'water');
      experiment.start();
      experiment.drop();
      experiment.react();
      experiment.bubble();
      
      expect(experiment.state).toBe('COMPLETE');
      expect(experiment.getHapticIntensity()).toBe(1.0);
    });

    it('should support lithium gentle reaction', () => {
      experiment.configure('Li', 'water');
      experiment.start();
      experiment.drop();
      experiment.react();
      experiment.bubble();
      
      expect(experiment.state).toBe('COMPLETE');
      expect(experiment.getHapticIntensity()).toBe(0.3);
    });
  });

  describe('Error Handling', () => {
    it('should transition to ERROR state on error', () => {
      experiment.configure('Na', 'water');
      experiment.start();
      experiment.error('Test error');
      expect(experiment.state).toBe('ERROR');
      expect(experiment.errorMessage).toBe('Test error');
    });

    it('should allow reset from ERROR state', () => {
      experiment.configure('Na', 'water');
      experiment.start();
      experiment.error('Test error');
      experiment.reset();
      expect(experiment.state).toBe('IDLE');
      expect(experiment.errorMessage).toBeNull();
    });
  });
});
