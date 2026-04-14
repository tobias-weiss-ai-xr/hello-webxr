import type { AppContext, RoomModule } from '../types/index.js';

export const ROOM_LOBBY = 0;
export const ROOM_ELEMENTS_START = 1;

export class RoomManager {
  private rooms: (RoomModule | null)[] = [];
  private setupCalledRooms = new Set<number>();
  private _roomMeshes: import('@babylonjs/core').AbstractMesh[] = [];
  private _roomTransformNodes: import('@babylonjs/core').TransformNode[] = [];
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

  /** Track a mesh created by a room for later disposal */
  trackMesh(mesh: import('@babylonjs/core').AbstractMesh): void {
    this._roomMeshes.push(mesh);
  }

  /** Track a TransformNode created by a room for later disposal */
  trackNode(node: import('@babylonjs/core').TransformNode): void {
    this._roomTransformNodes.push(node);
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

  /** Dispose all room-created meshes and nodes */
  private disposeRoomContent(): void {
    this._roomMeshes.forEach(m => m.dispose());
    this._roomTransformNodes.forEach(n => n.dispose());
    this._roomMeshes = [];
    this._roomTransformNodes = [];
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
