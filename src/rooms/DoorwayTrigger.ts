import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import type { Scene } from '@babylonjs/core/scene.js';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';
import type { Camera } from '@babylonjs/core/Cameras/camera.js';
import type { DoorwayConfig, RoomDimensions } from './RoomBuilder.js';

export interface DoorwayTriggerOptions {
  /** The doorway configuration defining wall position, offset, width, height */
  doorwayConfig: DoorwayConfig;
  /** Room dimensions to calculate the trigger position */
  roomDimensions: RoomDimensions;
  /** Room position (default: origin) */
  roomPosition?: Vector3;
  /** Callback when player enters the trigger zone */
  onTrigger: () => void;
  /** Cooldown in seconds to prevent rapid re-triggering (default: 2) */
  cooldown?: number;
}

const TRIGGER_DEPTH = 0.5;
const DEFAULT_COOLDOWN = 2000; // ms
const DEFAULT_DOOR_WIDTH = 1.4;
const DEFAULT_DOOR_HEIGHT = 2.6;

/**
 * Create an invisible trigger zone at a doorway opening.
 * When the camera enters the zone, the onTrigger callback fires (with cooldown).
 * The trigger mesh has no collisions so the player can walk through.
 */
export function createDoorwayTrigger(
  scene: Scene,
  options: DoorwayTriggerOptions,
): { mesh: AbstractMesh; dispose: () => void } {
  const {
    doorwayConfig,
    roomDimensions,
    roomPosition = Vector3.Zero(),
    onTrigger,
    cooldown = DEFAULT_COOLDOWN,
  } = options;

  const dw = doorwayConfig.width ?? DEFAULT_DOOR_WIDTH;
  const dh = doorwayConfig.height ?? DEFAULT_DOOR_HEIGHT;
  const { width: roomW, height: roomH, depth: roomD } = roomDimensions;

  // Calculate trigger center position based on wall
  const center = computeTriggerCenter(doorwayConfig, roomW, roomH, roomD, dh, roomPosition);

  // Create invisible box
  const triggerMesh = MeshBuilder.CreateBox(
    `doorwayTrigger_${doorwayConfig.wall}`,
    { width: dw, height: dh, depth: TRIGGER_DEPTH },
    scene,
  );
  triggerMesh.position = center;
  triggerMesh.isVisible = false;
  triggerMesh.isPickable = false;
  triggerMesh.checkCollisions = false;

  // Cooldown state
  let lastTriggerTime = 0;
  let disposed = false;

  // Observer for proximity detection
  const observer = scene.onBeforeRenderObservable.add(() => {
    if (disposed) return;

    const now = performance.now();
    if (now - lastTriggerTime < cooldown) return;

    const cam = scene.activeCamera as Camera;
    if (!cam) return;

    const camPos = cam.position;
    if (isInsideBox(camPos, center, dw, dh, TRIGGER_DEPTH)) {
      lastTriggerTime = now;
      onTrigger();
    }
  });

  return {
    mesh: triggerMesh,
    dispose: () => {
      disposed = true;
      scene.onBeforeRenderObservable.remove(observer);
      triggerMesh.dispose();
    },
  };
}

function computeTriggerCenter(
  config: DoorwayConfig,
  roomW: number,
  roomH: number,
  roomD: number,
  doorH: number,
  roomPos: Vector3,
): Vector3 {
  const offset = config.offset ?? 0;
  const halfDoorH = doorH / 2;
  // Y position: center of doorway opening (on the ground, so doorH/2)
  const y = roomPos.y + halfDoorH;

  switch (config.wall) {
    case 'north':
      return new Vector3(
        roomPos.x - offset,
        y,
        roomPos.z - roomD / 2,
      );
    case 'south':
      return new Vector3(
        roomPos.x + offset,
        y,
        roomPos.z + roomD / 2,
      );
    case 'east':
      return new Vector3(
        roomPos.x + roomW / 2,
        y,
        roomPos.z + offset,
      );
    case 'west':
      return new Vector3(
        roomPos.x - roomW / 2,
        y,
        roomPos.z - offset,
      );
    case null:
      return new Vector3(roomPos.x, y, roomPos.z);
  }
}

function isInsideBox(
  point: Vector3,
  center: Vector3,
  boxW: number,
  boxH: number,
  boxD: number,
): boolean {
  const halfW = boxW / 2;
  const halfH = boxH / 2;
  const halfD = boxD / 2;

  return (
    point.x >= center.x - halfW &&
    point.x <= center.x + halfW &&
    point.y >= center.y - halfH &&
    point.y <= center.y + halfH &&
    point.z >= center.z - halfD &&
    point.z <= center.z + halfD
  );
}
