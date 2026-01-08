import * as THREE from 'three';

export class AudioManager {
   constructor(context) {
     this.ctx = context;
     this.listener = context.audioListener;
     this.sounds = {};
     this.music = {};
     this.currentMusic = null;
     this.musicVolume = 0.5;

     this.group = 'music';
     this.initialized = false;

     this.spatialSounds = [];
     this.voiceGuide = null;
     this.ambienceVolume = 0.3;

     this.ambientTracks = {
       lobby: null,
       alkali: null,
       alkalineEarth: null,
       transition: null,
       lanthanide: null,
       actinide: null,
       metal: null,
       metalloid: null,
       nonmetal: null,
       halogen: null,
       nobleGas: null
     };
   }

  async init() {
    if (this.initialized) return;

    this.initialized = true;

    const audioContext = this.listener.context;
    const sampleRate = audioContext.sampleRate;

    this.sounds = {
      water_sizzle: await this.createWaterSizzle(audioContext, sampleRate),
      flame: await this.createFlameSound(audioContext, sampleRate),
      electrical: await this.createElectricalSound(audioContext, sampleRate),
      pop: await this.createPopSound(audioContext, sampleRate),
      fizzing: await this.createFizzingSound(audioContext, sampleRate),
      geiger: await this.createGeigerClick(audioContext, sampleRate),
      click: await this.createClickSound(audioContext, sampleRate),
      success: await this.createSuccessSound(audioContext, sampleRate),
      warning: await this.createWarningSound(audioContext, sampleRate),
      danger: await this.createDangerSound(audioContext, sampleRate)
    };
  }

  async createWaterSizzle(context, rate) {
    const buffer = context.createBuffer(2, rate, 2, 'sizzle');
    const data = buffer.getChannelData(0);

    for (let i = 0; i < rate; i++) {
      const noise = (Math.random() - 0.5) * 0.2;
      data[i] = noise;
      data[i + rate] = noise;
    }

    return this.createAudioBuffer(context, buffer);
  }

  async createFlameSound(context, rate) {
    const buffer = context.createBuffer(2, rate, 3, 'flame');
    const data = buffer.getChannelData(0);

    for (let i = 0; i < rate; i++) {
      const time = i / rate;
      const base = Math.sin(time * 2 * Math.PI) * 0.5 + 0.5;
      const variation = Math.sin(time * 8 * Math.PI) * 0.3;

      data[i * 3] = base * 0.3 + variation;
      data[i * 3 + 1] = base * 0.1 + variation;
      data[i * 3 + 2] = base * 0.05;
    }

    return this.createAudioBuffer(context, buffer);
  }

  async createElectricalSound(context, rate) {
    const buffer = context.createBuffer(2, rate, 1, 'hum');
    const data = buffer.getChannelData(0);

    for (let i = 0; i < rate; i++) {
      const value = Math.sin(i / rate * 2 * Math.PI) * 0.2 + 0.8;
      data[i] = value;
    }

    return this.createAudioBuffer(context, buffer);
  }

  async createPopSound(context, rate) {
    const buffer = context.createBuffer(2, rate, 0.1, 'pop');
    const data = buffer.getChannelData(0);

    const attack = Math.floor(rate * 0.01);
    const decay = Math.floor(rate * 0.05);

    for (let i = 0; i < rate; i++) {
      if (i < attack) {
        data[i] = Math.sin(i / attack * Math.PI) * 0.5 + 0.5;
      } else if (i < attack + decay) {
        data[i] *= 1 - (i - attack) / decay;
      } else {
        data[i] = 0;
      }
    }

    return this.createAudioBuffer(context, buffer);
  }

  async createFizzingSound(context, rate) {
    const buffer = context.createBuffer(2, rate, 2, 'fizz');
    const data = buffer.getChannelData(0);

    for (let i = 0; i < rate; i++) {
      data[i * 2] = (Math.random() - 0.5) * 0.15;
      data[i * 2 + 1] = (Math.random() - 0.5) * 0.1;
    }

    return this.createAudioBuffer(context, buffer);
  }

  async createGeigerClick(context, rate) {
    const buffer = context.createBuffer(2, rate, 0.2, 'click');
    const data = buffer.getChannelData(0);

    const duration = 0.02;
    for (let i = 0; i < rate * duration; i++) {
      data[i] = (Math.random() - 0.5) * 0.8;
    }

    return this.createAudioBuffer(context, buffer);
  }

  async createClickSound(context, rate) {
    const buffer = context.createBuffer(2, rate, 0.05, 'click');
    const data = buffer.getChannelData(0);

    for (let i = 0; i < rate * 0.05; i++) {
      const value = Math.sin(i / (rate * 0.05) * Math.PI) * 0.5;
      data[i] = value;
    }

    return this.createAudioBuffer(context, buffer);
  }

  async createSuccessSound(context, rate) {
    const buffer = context.createBuffer(2, rate, 1, 'success');
    const data = buffer.getChannelData(0);

    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    for (let f = 0; f < frequencies.length; f++) {
      for (let i = 0; i < rate / frequencies.length; i++) {
        const sample = i + f * (rate / frequencies.length);
        data[sample] = Math.sin(sample / rate * 2 * Math.PI * frequencies[f] / 1000) * 0.3;
      }
    }

    return this.createAudioBuffer(context, buffer);
  }

  async createWarningSound(context, rate) {
    const buffer = context.createBuffer(2, rate, 0.5, 'warning');
    const data = buffer.getChannelData(0);

    for (let i = 0; i < rate; i++) {
      data[i * 2] = (Math.random() - 0.5) * 0.1;
      data[i * 2 + 1] = (Math.random() - 0.5) * 0.05;
    }

    return this.createAudioBuffer(context, buffer);
  }

  async createDangerSound(context, rate) {
    const buffer = context.createBuffer(2, rate, 1.5, 'danger');
    const data = buffer.getChannelData(0);

    for (let i = 0; i < rate; i++) {
      const sample = i * 100;
      data[i * 300] = (Math.sin(sample / rate * Math.PI) * 0.3 + 0.7);
      data[i * 300 + 100] = (Math.sin(sample / rate * Math.PI) * 0.2);
      data[i * 300 + 200] = (Math.sin(sample / rate * Math.PI) * 0.1 + 0.3);
    }

    return this.createAudioBuffer(context, buffer);
  }

  createAudioBuffer(context, buffer) {
    return context.decodeAudioData(buffer);
  }

  playSound(soundId, volume = 1) {
    const sound = this.sounds[soundId];
    if (!sound) return;

    const source = this.listener.context.createBufferSource();
    source.buffer = sound;
    source.loop = false;
    source.gain.value = volume * this.musicVolume;

    const pan = this.listener.context.createPanner();
    pan.gain.value = volume * this.musicVolume;
    pan.connect(source);
    pan.connect(this.listener);

    source.start(0);

    setTimeout(() => {
      source.stop();
      pan.disconnect();
    }, source.duration * 1000);
  }

  playLoopingSound(soundId, volume = 1) {
    if (this.currentMusic && this.currentMusic === soundId) return;

    this.stopMusic();

    const sound = this.sounds[soundId];
    const source = this.listener.context.createBufferSource();
    source.buffer = sound;
    source.loop = true;
    source.gain.value = volume * this.musicVolume;

    const panner = this.listener.context.createPanner();
    panner.gain.value = volume * this.musicVolume;
    panner.connect(source);
    panner.connect(this.listener);

    this.currentMusic = soundId;
    source.start(0);
  }

  stopMusic() {
    if (!this.currentMusic) return;

    this.group = 'effects';
    this.currentMusic = null;
  }

  stopAll() {
    this.stopMusic();
    this.group = 'effects';
  }

  setGroup(group) {
    this.group = group || 'music';
  }

   setVolume(volume) {
     this.musicVolume = Math.max(0, Math.min(1, volume));

     if (this.currentMusic) {
       const sound = this.sounds[this.currentMusic];
       sound.gain.value = volume;
     }
   }

   async createAmbienceTracks() {
     const context = this.listener.context;
     const sampleRate = context.sampleRate;

     this.ambientTracks.lobby = await this.createLobbyAmbience(context, sampleRate);
     this.ambientTracks.alkali = await this.createMetallicAmbience(context, sampleRate, 0xFF6B6B);
     this.ambientTracks.alkalineEarth = await this.createMetallicAmbience(context, sampleRate, 0xFFA94D);
     this.ambientTracks.transition = await this.createMetallicAmbience(context, sampleRate, 0x74B9FF);
     this.ambientTracks.lanthanide = await this.createRadioactiveAmbience(context, sampleRate);
     this.ambientTracks.actinide = await this.createRadioactiveAmbience(context, sampleRate);
     this.ambientTracks.metal = await this.createMetallicAmbience(context, sampleRate, 0x20C997);
     this.ambientTracks.metalloid = await this.createCrystallineAmbience(context, sampleRate);
     this.ambientTracks.nonmetal = await this.createGaseousAmbience(context, sampleRate);
     this.ambientTracks.halogen = await this.createChemicalAmbience(context, sampleRate);
     this.ambientTracks.nobleGas = await this.createEtherealAmbience(context, sampleRate);
   }

   async createLobbyAmbience(context, rate) {
     const buffer = context.createBuffer(2, rate, 30, 'lobby');
     const data = buffer.getChannelData(0);

     for (let i = 0; i < rate; i++) {
       const time = i / rate;
       const drone = Math.sin(time * 0.5 * Math.PI * 2) * 0.1;
       const shimmer = Math.sin(time * 3 * Math.PI) * 0.05;
       data[i] = drone + shimmer;
     }

     return this.createAudioBuffer(context, buffer);
   }

   async createMetallicAmbience(context, rate, colorHex) {
     const buffer = context.createBuffer(2, rate, 30, 'metallic');
     const data = buffer.getChannelData(0);

     for (let i = 0; i < rate; i++) {
       const time = i / rate;
       const resonance = Math.sin(time * 0.3 * Math.PI * 2) * 0.08;
       const hum = Math.sin(time * 0.1 * Math.PI * 2) * 0.05;
       data[i] = resonance + hum;
     }

     return this.createAudioBuffer(context, buffer);
   }

   async createRadioactiveAmbience(context, rate) {
     const buffer = context.createBuffer(2, rate, 30, 'radioactive');
     const data = buffer.getChannelData(0);

     for (let i = 0; i < rate; i++) {
       const time = i / rate;
       const crackle = Math.random() > 0.95 ? (Math.random() - 0.5) * 0.1 : 0;
       const hum = Math.sin(time * 0.2 * Math.PI * 2) * 0.03;
       data[i] = crackle + hum;
     }

     return this.createAudioBuffer(context, buffer);
   }

   async createCrystallineAmbience(context, rate) {
     const buffer = context.createBuffer(2, rate, 30, 'crystalline');
     const data = buffer.getChannelData(0);

     for (let i = 0; i < rate; i++) {
       const time = i / rate;
       const chime = Math.sin(time * 0.8 * Math.PI) * 0.06;
       const echo = Math.sin(time * 1.6 * Math.PI) * 0.03;
       data[i] = chime + echo;
     }

     return this.createAudioBuffer(context, buffer);
   }

   async createGaseousAmbience(context, rate) {
     const buffer = context.createBuffer(2, rate, 30, 'gaseous');
     const data = buffer.getChannelData(0);

     for (let i = 0; i < rate; i++) {
       const time = i / rate;
       const flow = Math.sin(time * 0.2 * Math.PI) * 0.05;
       const whisper = Math.sin(time * 0.7 * Math.PI) * 0.02;
       data[i] = flow + whisper;
     }

     return this.createAudioBuffer(context, buffer);
   }

   async createChemicalAmbience(context, rate) {
     const buffer = context.createBuffer(2, rate, 30, 'chemical');
     const data = buffer.getChannelData(0);

     for (let i = 0; i < rate; i++) {
       const time = i / rate;
       const bubble = Math.sin(time * 0.5 * Math.PI) * 0.04;
       const hiss = Math.sin(time * 1.2 * Math.PI) * 0.02;
       data[i] = bubble + hiss;
     }

     return this.createAudioBuffer(context, buffer);
   }

   async createEtherealAmbience(context, rate) {
     const buffer = context.createBuffer(2, rate, 30, 'ethereal');
     const data = buffer.getChannelData(0);

     for (let i = 0; i < rate; i++) {
       const time = i / rate;
       const shimmer = Math.sin(time * 0.3 * Math.PI) * 0.08;
       const glow = Math.sin(time * 0.1 * Math.PI) * 0.05;
       data[i] = shimmer + glow;
     }

     return this.createAudioBuffer(context, buffer);
   }

   playRoomAmbience(group) {
     const track = this.ambientTracks[group];
     if (!track) return;

     if (this.currentAmbience) {
       this.stopAmbience();
     }

     const source = this.listener.context.createBufferSource();
     source.buffer = track;
     source.loop = true;
     source.gain.value = this.ambienceVolume;

     source.connect(this.listener);
     source.start(0);

     this.currentAmbience = {source, track, group};
   }

   stopAmbience() {
     if (!this.currentAmbience) return;

     this.currentAmbience.source.stop();
     this.currentAmbience.source.disconnect();
     this.currentAmbience = null;
   }

   playSpatialSound(soundId, position, volume = 1, maxDistance = 10) {
     const sound = this.sounds[soundId];
     if (!sound) return;

     const source = this.listener.context.createBufferSource();
     source.buffer = sound;

     const panner = this.listener.context.createPanner();
     panner.panningModel = 'HRTF';
     panner.distanceModel = 'inverse';
     panner.refDistance = 1;
     panner.maxDistance = maxDistance;
     panner.rolloffFactor = 1;

     const listenerPosition = new THREE.Vector3();
     this.listener.getWorldPosition(listenerPosition);
     panner.setPosition(position.x, position.y, position.z);
     panner.setOrientation(listenerPosition.x, 0, listenerPosition.z);

     panner.connect(source);
     source.connect(panner);
     panner.connect(this.listener);

     source.gain.value = volume;
     source.start(0);

     const spatialSound = {source, panner, id: soundId};
     this.spatialSounds.push(spatialSound);

     setTimeout(() => {
       source.stop();
       source.disconnect();
       panner.disconnect();
       const index = this.spatialSounds.indexOf(spatialSound);
       if (index !== -1) {
         this.spatialSounds.splice(index, 1);
       }
     }, sound.duration * 1000);
   }

   updateSpatialSounds(listenerPosition) {
     this.spatialSounds.forEach(sound => {
       sound.panner.setOrientation(
         listenerPosition.x - sound.panner.positionX,
         0,
         listenerPosition.z - sound.panner.positionZ
       );
     });
   }

   async playVoiceGuide(text, language = 'de', gender = 'neutral') {
     if (this.voiceGuide) {
       this.voiceGuide.stop();
       this.voiceGuide.disconnect();
     }

     const utterance = new SpeechSynthesisUtterance(text);
     utterance.lang = language === 'de' ? 'de-DE' : 'en-US';
     utterance.rate = 0.9;
     utterance.pitch = gender === 'male' ? 0.9 : gender === 'female' ? 1.1 : 1.0;
     utterance.volume = this.musicVolume;

     window.speechSynthesis.speak(utterance);
     this.voiceGuide = utterance;
   }

   stopVoiceGuide() {
     if (this.voiceGuide) {
       window.speechSynthesis.cancel();
       this.voiceGuide = null;
     }
   }

   async createElementDescription(element, language = 'de') {
     const descriptions = {
       de: {
         name: element.name,
         symbol: element.symbol,
         number: element.atomicNumber,
         mass: element.mass,
         group: element.group,
         period: element.period,
         description: element.description
       },
       en: {
         name: element.name,
         symbol: element.symbol,
         number: element.atomicNumber,
         mass: element.mass,
         group: element.group,
         period: element.period,
         description: element.description
       }
     };

     const desc = descriptions[language] || descriptions.de;
     const text = `${desc.name}. Symbol: ${desc.symbol}. Atomic number: ${desc.number}. Mass: ${desc.mass} atomic mass units. ${desc.description}`;

     await this.playVoiceGuide(text, language);
   }

   dispose() {
     this.stopMusic();
     this.stopAmbience();
     this.stopVoiceGuide();

     Object.keys(this.sounds).forEach(key => {
       const sound = this.sounds[key];
       if (sound && typeof sound.close === 'function') {
         sound.close();
       }
     });

     this.sounds = {};
     this.music = {};
     this.spatialSounds = [];
   }
}
