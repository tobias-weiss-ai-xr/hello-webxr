import * as THREE from 'three';
import * as roomHall from '../rooms/Hall.js';
import * as roomPanorama from '../rooms/Panorama.js';
import * as roomPanoramaStereo from '../rooms/PanoramaStereo.js';
import * as roomPhotogrammetryObject from '../rooms/PhotogrammetryObject.js';
import * as roomVertigo from '../rooms/Vertigo.js';
import * as roomSound from '../rooms/Sound.js';
import * as roomArachnophobia from '../rooms/Arachnophobia.js';
import { ROOMS, MUSIC_THEMES, TARGET_POSITIONS } from './config.js';

export class RoomManager {
  constructor(context) {
    this.context = context;
    this.rooms = [
      roomHall,
      roomSound,
      roomPhotogrammetryObject,
      roomVertigo,
      roomArachnophobia,
      roomPanoramaStereo,
      roomPanorama,
      roomPanorama,
      roomPanorama,
      roomPanorama,
      roomPanorama,
    ];
    this.roomNames = ROOMS;
    this.musicThemes = MUSIC_THEMES;
    this.targetPositions = TARGET_POSITIONS;
    this.currentRoomIndex = 0;
  }

  setup() {
    roomHall.setup(this.context);
    roomPanorama.setup(this.context);
    roomPanoramaStereo.setup(this.context);
    roomPhotogrammetryObject.setup(this.context);
    roomVertigo.setup(this.context);
    roomSound.setup(this.context);
    roomArachnophobia.setup(this.context);
  }

  enterRoom(roomIndex) {
    if (roomIndex < 0 || roomIndex >= this.rooms.length) {
      console.warn(`Invalid room index: ${roomIndex}`);
      return;
    }

    this.rooms[this.currentRoomIndex].exit(this.context);
    if (this.context.raycontrol) {
      this.context.raycontrol.deactivateAll();
    }

    this.handleRoomTransition(this.currentRoomIndex, roomIndex);

    this.currentRoomIndex = roomIndex;
    this.playMusic(roomIndex);
    this.rooms[this.currentRoomIndex].enter(this.context);
  }

  handleRoomTransition(fromIndex, toIndex) {
    const prevRoom = this.roomNames[fromIndex];
    const nextRoom = this.roomNames[toIndex];

    if (this.targetPositions[prevRoom] && this.targetPositions[prevRoom][nextRoom]) {
      const targetPosition = this.targetPositions[prevRoom][nextRoom];
      const camera = this.context.renderer.xr.getCamera(this.context.camera);

      const deltaPosition = new THREE.Vector3();
      deltaPosition.x = camera.position.x - targetPosition.x;
      deltaPosition.z = camera.position.z - targetPosition.z;

      this.context.cameraRig.position.sub(deltaPosition);
    }
  }

  playMusic(roomIndex) {
    const theme = this.musicThemes[roomIndex];
    if (this.context.audioManager) {
      this.context.audioManager.playMusic(theme);
    }
  }

  getCurrentRoom() {
    return this.rooms[this.currentRoomIndex];
  }

  getCurrentRoomIndex() {
    return this.currentRoomIndex;
  }

  getRoomNames() {
    return this.roomNames;
  }

  execute(delta, elapsedTime) {
    this.rooms[this.currentRoomIndex].execute(this.context, delta, elapsedTime);
  }

  getRoomIndexByName(name) {
    return this.roomNames.indexOf(name);
  }
}
