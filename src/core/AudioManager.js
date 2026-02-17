import * as THREE from 'three';
import assets from '../assets.js';

export class AudioManager {
  constructor(ctxOrListener) {
    // Accept either a context object or a direct AudioListener
    if (ctxOrListener && ctxOrListener.camera) {
      this.ctx = ctxOrListener;
      this.listener = ctxOrListener.camera.children.find(c => c instanceof THREE.AudioListener);
      if (!this.listener) {
        this.listener = new THREE.AudioListener();
        ctxOrListener.camera.add(this.listener);
      }
    } else {
      this.listener = ctxOrListener;
    }
    this.ambientMusic = new THREE.Audio(this.listener);
    this.currentTheme = null;
    this.initialized = false;
  }

  async init() {
    // Async initialization hook for future use
    this.initialized = true;
    return this;
  }

  stopMusic() {
    if (this.ambientMusic.source) {
      this.ambientMusic.stop();
    }
  }

  playMusic(theme) {
    if (!theme) {
      this.stopMusic();
      return;
    }

    this.stopMusic();
    this.ambientMusic.setBuffer(assets[theme]);
    this.ambientMusic.setLoop(true);
    this.ambientMusic.setVolume(1.0);
    this.ambientMusic.offset = Math.random() * 60;
    this.ambientMusic.play();
    this.currentTheme = theme;
  }

  playSound(assetKey) {
    if (!assets[assetKey]) {
      console.warn(`Sound asset not found: ${assetKey}`);
      return null;
    }

    const sound = new THREE.Audio(this.listener);
    sound.setBuffer(assets[assetKey]);
    sound.play();
    return sound;
  }

  /**
   * Play experiment-related sounds based on type and event
   * @param {string} experimentType - 'reaction', 'electrical', 'electrochemical', 'nuclear', 'organic', 'crystal'
   * @param {string} eventType - 'start', 'progress', 'complete', 'error'
   */
  playExperimentSound(experimentType, eventType) {
    // Map experiment types to sound patterns
    // TODO: Add dedicated experiment sounds; currently using placeholders
    const soundMap = {
      reaction: {
        start: 'teleport_a_snd',
        progress: 'teleport_a_snd',
        complete: 'teleport_b_snd',
        error: 'teleport_b_snd'
      },
      electrical: {
        start: 'teleport_a_snd',
        progress: 'teleport_a_snd',
        complete: 'teleport_b_snd',
        error: 'teleport_b_snd'
      },
      electrochemical: {
        start: 'teleport_a_snd',
        progress: 'teleport_a_snd',
        complete: 'teleport_b_snd',
        error: 'teleport_b_snd'
      },
      nuclear: {
        start: 'teleport_a_snd',
        progress: 'teleport_a_snd',
        complete: 'teleport_b_snd',
        error: 'teleport_b_snd'
      },
      organic: {
        start: 'teleport_a_snd',
        progress: 'teleport_a_snd',
        complete: 'teleport_b_snd',
        error: 'teleport_b_snd'
      },
      crystal: {
        start: 'teleport_a_snd',
        progress: 'teleport_a_snd',
        complete: 'teleport_b_snd',
        error: 'teleport_b_snd'
      }
    };

    // Use traditional null checking for Babel compatibility
    const typeSounds = soundMap[experimentType];
    const soundName = typeSounds ? typeSounds[eventType] : null;
    if (soundName) {
      this.playSound(soundName);
    } else {
      // Gracefully handle unknown experiment types or event types
      console.debug(`No sound mapped for experiment '${experimentType}' event '${eventType}'`);
    }
  }
}
