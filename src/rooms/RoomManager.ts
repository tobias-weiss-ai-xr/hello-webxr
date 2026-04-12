import type { AppContext, RoomModule } from '../types/index.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';

export const ROOM_LOBBY = 0;
export const ROOM_ELEMENTS_START = 1;

export class RoomManager {
  private rooms: (RoomModule | null)[] = [];
  private setupCalledRooms = new Set<number>();
  private _roomRoot: TransformNode;
  private _currentRoomIndex = 0;

  constructor(
    private scene: import('@babylonjs/core').Scene
  ) {
    this._roomRoot = new TransformNode('roomRoot', this.scene);
  }

  get currentRoomIndex(): number {
    return this._currentRoomIndex;
  }

  get roomCount(): number {
    return this.rooms.length;
  }

  get roomRootNode(): TransformNode {
    return this._roomRoot;
  }

  registerRoom(index: number, room: RoomModule): void {
    this.rooms[index] = room;
  }

  getRoom(index: number): RoomModule | null {
    return this.rooms[index] ?? null;
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

  enterRoom(index: number, ctx: AppContext, param?: string): void {
    const room = this.rooms[index];
    if (!room) return;

    // Dispose all children of roomRoot (previous room's meshes)
    this._roomRoot.getChildMeshes().forEach(m => m.dispose());
    this._roomRoot.getChildTransformNodes().forEach(n => {
      if (n !== this._roomRoot) n.dispose();
    });

    this._currentRoomIndex = index;
    room.enter(ctx, param);
  }

  exitRoom(index: number, ctx: AppContext): void {
    const room = this.rooms[index];
    if (!room) return;
    room.exit(ctx);
  }
}
