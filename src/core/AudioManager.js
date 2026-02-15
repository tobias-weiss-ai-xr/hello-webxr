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
}
