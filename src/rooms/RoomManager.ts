import type { AppContext, RoomModule } from '../types/index.js';
import type { ParticleSystem } from '@babylonjs/core/Particles/particleSystem.js';

export const ROOM_LOBBY = 0;
export const ROOM_ELEMENTS_START = 1;
export const ROOM_PERIODIC_PAVILION = 128;
export const ROOM_LAB_WING_START = 119;
export const ROOM_EXPERIMENTS_START = 129;

export class RoomManager {
  private rooms: (RoomModule | null)[] = [];
  private setupCalledRooms = new Set<number>();
  private _roomMeshes: import('@babylonjs/core').AbstractMesh[] = [];
  private _roomTransformNodes: import('@babylonjs/core').TransformNode[] = [];
  private _roomParticleSystems: ParticleSystem[] = [];
  private _currentRoomIndex = 0;

  constructor(
    private scene: import('@babylonjs/core').Scene
  ) {
  }

  get currentRoomIndex(): number {
    return this._currentRoomIndex;
  }

  get roomCount(): number {
    return this.rooms.length;
  }

  registerRoom(index: number, room: RoomModule): void {
    this.rooms[index] = room;
  }

  getRoom(index: number): RoomModule | null {
    return this.rooms[index] ?? null;
  }

  getRoomMeshes(): import('@babylonjs/core').AbstractMesh[] {
    return [...this._roomMeshes];
  }

  /** Track a mesh created by a room for later disposal */
  trackMesh(mesh: import('@babylonjs/core').AbstractMesh): void {
    mesh.metadata = mesh.metadata || {};
    mesh.metadata._trackedByRoomManager = true;
    this._roomMeshes.push(mesh);
  }

  /** Track a TransformNode created by a room for later disposal */
  trackNode(node: import('@babylonjs/core').TransformNode): void {
    this._roomTransformNodes.push(node);
  }

  /** Track a ParticleSystem created by a room for later disposal */
  trackParticleSystem(ps: ParticleSystem): void {
    this._roomParticleSystems.push(ps);
  }


  setupRoom(index: number, ctx: AppContext, param?: string): void {
    const room = this.rooms[index];
    if (!room) {
      console.error(`No room registered at index ${index}`);
      return;
    }
    if (!this.setupCalledRooms.has(index)) {
      room.setup(ctx, param);
      this.setupCalledRooms.add(index);
    }
  }

  /** Dispose all room-created meshes, nodes and particle systems */
  private disposeRoomContent(): void {
    this._roomMeshes.forEach(m => m.dispose());
    this._roomTransformNodes.forEach(n => n.dispose());
    this._roomParticleSystems.forEach(ps => ps.isDisposed || ps.dispose());
    this._roomMeshes = [];
    this._roomTransformNodes = [];
    this._roomParticleSystems = [];
  }

  enterRoom(index: number, ctx: AppContext, param?: string): void {
    const room = this.rooms[index];
    if (!room) return;

    this._currentRoomIndex = index;
    room.enter(ctx, param);
  }

  exitRoom(index: number, ctx: AppContext): void {
    const room = this.rooms[index];
    if (!room) return;
    room.exit(ctx);
    this.disposeRoomContent();
  }
}
