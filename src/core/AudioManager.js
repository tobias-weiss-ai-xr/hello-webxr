import * as THREE from 'three';
import assets from '../assets.js';

export class AudioManager {
  constructor(listener) {
    this.listener = listener;
    this.ambientMusic = new THREE.Audio(listener);
    this.currentTheme = null;
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
