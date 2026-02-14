import * as THREE from 'three';
import * as Lobby from '../rooms/Lobby.js';
import * as ElementRoom from '../rooms/ElementRoom.js';
import * as ExperimentalRoom from '../rooms/ExperimentalRoom.js';
import { ROOMS, MUSIC_THEMES, TARGET_POSITIONS, ELEMENTS, ROOM_LOBBY, ROOM_ELEMENTS_START, ROOM_EXP_START } from './config.js';

export class RoomManager {
  constructor(context) {
    this.context = context;
    this.rooms = {};
    
    // Register PSE rooms
    this.rooms[ROOM_LOBBY] = Lobby;
    
    // Register all 118 element rooms
    ELEMENTS.forEach((element, index) => {
      this.rooms[ROOM_ELEMENTS_START + index] = ElementRoom;
    });
    
    // Register 10 experimental rooms (indices 119-128)
    for (let i = 0; i < 10; i++) {
      this.rooms[ROOM_EXP_START + i] = ExperimentalRoom;
    }
    
    this.roomNames = ROOMS;
    this.musicThemes = MUSIC_THEMES;
    this.targetPositions = TARGET_POSITIONS;
    this.currentRoomIndex = 0;
  }

  setup() {
    // PSE room setup
    Lobby.setup(this.context);
    ElementRoom.setup(this.context);
    ExperimentalRoom.setup(this.context);
  }

  enterRoom(roomIndex) {
    if (roomIndex < 0 || roomIndex >= this.roomNames.length) {
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
