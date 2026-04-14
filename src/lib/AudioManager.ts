import { Vector3 } from '@babylonjs/core/Maths/math.js';
import type { Scene } from '@babylonjs/core/scene.js';
import type { ElementData } from '../types/index.js';

type SoundId = 'water_sizzle' | 'flame' | 'electrical' | 'pop' | 'fizzing'
  | 'geiger' | 'click' | 'success' | 'warning' | 'danger';

type AmbientGroupId = 'lobby' | 'alkali' | 'alkalineEarth' | 'transition'
  | 'lanthanide' | 'actinide' | 'metal' | 'metalloid' | 'nonmetal'
  | 'halogen' | 'nobleGas';

interface SpatialSound {
  source: AudioBufferSourceNode;
  panner: PannerNode;
  id: SoundId;
  timeout: ReturnType<typeof setTimeout>;
}

export class AudioManager {
  private audioCtx: AudioContext | null = null;
  private sounds: Map<SoundId, AudioBuffer> = new Map();
  private musicVolume = 0.5;
  private ambienceVolume = 0.3;
  private currentMusic: AudioBufferSourceNode | null = null;
  private currentAmbience: { source: AudioBufferSourceNode; group: AmbientGroupId } | null = null;
  private spatialSounds: SpatialSound[] = [];
  private voiceGuide: SpeechSynthesisUtterance | null = null;
  private initialized = false;

  constructor(private scene: Scene) {}

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    this.audioCtx = new AudioContext();

    const pairs: [SoundId, (ctx: AudioContext, rate: number) => Promise<AudioBuffer>][] = [
      ['water_sizzle', this.createWaterSizzle.bind(this)],
      ['flame', this.createFlameSound.bind(this)],
      ['electrical', this.createElectricalSound.bind(this)],
      ['pop', this.createPopSound.bind(this)],
      ['fizzing', this.createFizzingSound.bind(this)],
      ['geiger', this.createGeigerClick.bind(this)],
      ['click', this.createClickSound.bind(this)],
      ['success', this.createSuccessSound.bind(this)],
      ['warning', this.createWarningSound.bind(this)],
      ['danger', this.createDangerSound.bind(this)],
    ];

    for (const [id, factory] of pairs) {
      try {
        const buffer = await factory(this.audioCtx, this.audioCtx.sampleRate);
        this.sounds.set(id, buffer);
      } catch (e) {
        console.warn(`[AudioManager] Failed to generate sound: ${id}`, e);
      }
    }
  }

  // --- Procedural sound generators ---

  private async createWaterSizzle(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 2;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() - 0.5) * 0.2;
    }
    return buffer;
  }

  private async createFlameSound(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 3;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const time = i / rate;
      const base = Math.sin(time * 2 * Math.PI) * 0.5 + 0.5;
      const variation = Math.sin(time * 8 * Math.PI) * 0.3;
      data[i] = base * 0.3 + variation;
    }
    return buffer;
  }

  private async createElectricalSound(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 1;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(i / rate * 2 * Math.PI) * 0.2 + 0.8;
    }
    return buffer;
  }

  private async createPopSound(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 0.1;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    const attack = Math.floor(rate * 0.01);
    const decay = Math.floor(rate * 0.05);
    for (let i = 0; i < data.length; i++) {
      if (i < attack) {
        data[i] = Math.sin(i / attack * Math.PI) * 0.5 + 0.5;
      } else if (i < attack + decay) {
        data[i] *= 1 - (i - attack) / decay;
      }
    }
    return buffer;
  }

  private async createFizzingSound(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 2;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() - 0.5) * 0.15;
    }
    return buffer;
  }

  private async createGeigerClick(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 0.2;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    const clickLen = Math.floor(rate * 0.02);
    for (let i = 0; i < clickLen; i++) {
      data[i] = (Math.random() - 0.5) * 0.8;
    }
    return buffer;
  }

  private async createClickSound(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 0.05;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(i / data.length * Math.PI) * 0.5;
    }
    return buffer;
  }

  private async createSuccessSound(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 1;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    const segmentLen = Math.floor(data.length / frequencies.length);
    for (let f = 0; f < frequencies.length; f++) {
      for (let i = 0; i < segmentLen; i++) {
        const sample = i + f * segmentLen;
        if (sample < data.length) {
          data[sample] = Math.sin(sample / rate * 2 * Math.PI * frequencies[f] / 1000) * 0.3;
        }
      }
    }
    return buffer;
  }

  private async createWarningSound(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 0.5;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() - 0.5) * 0.1;
    }
    return buffer;
  }

  private async createDangerSound(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 1.5;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const sample = i * 100;
      if (sample < data.length) data[sample] = Math.sin(sample / rate * Math.PI) * 0.3 + 0.7;
    }
    return buffer;
  }

  // --- Playback ---

  playSound(soundId: SoundId, volume = 1): void {
    const sound = this.sounds.get(soundId);
    if (!sound || !this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const source = this.audioCtx.createBufferSource();
    source.buffer = sound;
    const gain = this.audioCtx.createGain();
    gain.gain.value = volume * this.musicVolume;
    source.connect(gain);
    gain.connect(this.audioCtx.destination);
    source.start(0);
  }

  playLoopingSound(soundId: SoundId, volume = 1): void {
    // Only one looping sound at a time
    this.stopMusic();

    const sound = this.sounds.get(soundId);
    if (!sound || !this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const source = this.audioCtx.createBufferSource();
    source.buffer = sound;
    source.loop = true;
    const gain = this.audioCtx.createGain();
    gain.gain.value = volume * this.musicVolume;
    source.connect(gain);
    gain.connect(this.audioCtx.destination);
    source.start(0);
    this.currentMusic = source;
  }

  stopMusic(): void {
    if (this.currentMusic) {
      try { this.currentMusic.stop(); } catch { /* already stopped */ }
      this.currentMusic.disconnect();
      this.currentMusic = null;
    }
  }

  stopAll(): void {
    this.stopMusic();
    this.stopAmbience();
    this.stopVoiceGuide();
    this.spatialSounds.forEach(s => {
      try { s.source.stop(); } catch { /* already stopped */ }
      clearTimeout(s.timeout);
    });
    this.spatialSounds = [];
  }

  setVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  // --- Spatial audio ---

  playSpatialSound(soundId: SoundId, position: Vector3, volume = 1, maxDistance = 10): void {
    const sound = this.sounds.get(soundId);
    if (!sound || !this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const source = this.audioCtx.createBufferSource();
    source.buffer = sound;

    const panner = this.audioCtx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = maxDistance;
    panner.rolloffFactor = 1;
    panner.positionX.value = position.x;
    panner.positionY.value = position.y;
    panner.positionZ.value = position.z;

    const gain = this.audioCtx.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(panner);
    panner.connect(this.audioCtx.destination);
    source.start(0);

    const spatialSound: SpatialSound = { source, panner, id: soundId, timeout: null! };
    this.spatialSounds.push(spatialSound);

    spatialSound.timeout = setTimeout(() => {
      try { source.stop(); } catch { /* already stopped */ }
      source.disconnect();
      panner.disconnect();
      gain.disconnect();
      const idx = this.spatialSounds.findIndex(s => s === spatialSound);
      if (idx !== -1) this.spatialSounds.splice(idx, 1);
    }, sound.duration * 1000);
  }

  updateSpatialSounds(listenerPosition: Vector3): void {
    this.spatialSounds.forEach(s => {
      s.panner.positionX.value = listenerPosition.x;
      s.panner.positionZ.value = listenerPosition.z;
    });
  }

  // --- Ambience ---

  private ambientTracks: Partial<Record<AmbientGroupId, AudioBuffer | null>> = {};

  async createAmbienceTracks(): Promise<void> {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const rate = ctx.sampleRate;

    const generators: [AmbientGroupId, () => Promise<AudioBuffer>][] = [
      ['lobby', () => this.generateAmbience(ctx, rate, 0.5, 3, 30)],
      ['alkali', () => this.generateAmbience(ctx, rate, 0.3, 0.1, 30)],
      ['alkalineEarth', () => this.generateAmbience(ctx, rate, 0.3, 0.1, 30)],
      ['transition', () => this.generateAmbience(ctx, rate, 0.3, 0.1, 30)],
      ['lanthanide', () => this.generateRadioactiveAmbience(ctx, rate)],
      ['actinide', () => this.generateRadioactiveAmbience(ctx, rate)],
      ['metal', () => this.generateAmbience(ctx, rate, 0.3, 0.1, 30)],
      ['metalloid', () => this.generateCrystallineAmbience(ctx, rate)],
      ['nonmetal', () => this.generateGaseousAmbience(ctx, rate)],
      ['halogen', () => this.generateChemicalAmbience(ctx, rate)],
      ['nobleGas', () => this.generateEtherealAmbience(ctx, rate)],
    ];

    for (const [id, factory] of generators) {
      try {
        this.ambientTracks[id] = await factory();
      } catch (e) {
        console.warn(`[AudioManager] Failed to generate ambience: ${id}`, e);
        this.ambientTracks[id] = null;
      }
    }
  }

  private async generateAmbience(ctx: AudioContext, rate: number, droneFreq: number, shimmerFreq: number, duration: number): Promise<AudioBuffer> {
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const time = i / rate;
      const drone = Math.sin(time * droneFreq * Math.PI * 2) * 0.1;
      const shimmer = Math.sin(time * shimmerFreq * Math.PI) * 0.05;
      data[i] = drone + shimmer;
    }
    return buffer;
  }

  private async generateRadioactiveAmbience(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 30;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const time = i / rate;
      const crackle = Math.random() > 0.95 ? (Math.random() - 0.5) * 0.1 : 0;
      const hum = Math.sin(time * 0.2 * Math.PI * 2) * 0.03;
      data[i] = crackle + hum;
    }
    return buffer;
  }

  private async generateCrystallineAmbience(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 30;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const time = i / rate;
      const chime = Math.sin(time * 0.8 * Math.PI) * 0.06;
      const echo = Math.sin(time * 1.6 * Math.PI) * 0.03;
      data[i] = chime + echo;
    }
    return buffer;
  }

  private async generateGaseousAmbience(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 30;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const time = i / rate;
      const flow = Math.sin(time * 0.2 * Math.PI) * 0.05;
      const whisper = Math.sin(time * 0.7 * Math.PI) * 0.02;
      data[i] = flow + whisper;
    }
    return buffer;
  }

  private async generateChemicalAmbience(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 30;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const time = i / rate;
      const bubble = Math.sin(time * 0.5 * Math.PI) * 0.04;
      const hiss = Math.sin(time * 1.2 * Math.PI) * 0.02;
      data[i] = bubble + hiss;
    }
    return buffer;
  }

  private async generateEtherealAmbience(ctx: AudioContext, rate: number): Promise<AudioBuffer> {
    const duration = 30;
    const buffer = ctx.createBuffer(1, rate * duration, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const time = i / rate;
      const shimmer = Math.sin(time * 0.3 * Math.PI) * 0.08;
      const glow = Math.sin(time * 0.1 * Math.PI) * 0.05;
      data[i] = shimmer + glow;
    }
    return buffer;
  }

  playRoomAmbience(group: AmbientGroupId): void {
    const track = this.ambientTracks[group];
    if (!track || !this.audioCtx) return;

    this.stopAmbience();

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const source = this.audioCtx.createBufferSource();
    source.buffer = track;
    source.loop = true;
    const gain = this.audioCtx.createGain();
    gain.gain.value = this.ambienceVolume;
    source.connect(gain);
    gain.connect(this.audioCtx.destination);
    source.start(0);
    this.currentAmbience = { source, group };
  }

  stopAmbience(): void {
    if (!this.currentAmbience) return;
    try { this.currentAmbience.source.stop(); } catch { /* already stopped */ }
    this.currentAmbience.source.disconnect();
    this.currentAmbience = null;
  }

  // --- Voice guide ---

  playVoiceGuide(text: string, language: 'de' | 'en' = 'de', gender: 'male' | 'female' | 'neutral' = 'neutral'): void {
    this.stopVoiceGuide();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'de' ? 'de-DE' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = gender === 'male' ? 0.9 : gender === 'female' ? 1.1 : 1.0;
    utterance.volume = this.musicVolume;

    window.speechSynthesis.speak(utterance);
    this.voiceGuide = utterance;
  }

  stopVoiceGuide(): void {
    if (this.voiceGuide) {
      window.speechSynthesis.cancel();
      this.voiceGuide = null;
    }
  }

  createElementDescription(element: ElementData, language: 'de' | 'en' = 'de'): void {
    const text = `${element.name}. Symbol: ${element.symbol}. Atomic number: ${element.atomicNumber}. Mass: ${element.mass} atomic mass units. ${element.description}`;
    this.playVoiceGuide(text, language);
  }

  dispose(): void {
    this.stopAll();
    this.sounds.clear();
    this.ambientTracks = {};
  }
}
