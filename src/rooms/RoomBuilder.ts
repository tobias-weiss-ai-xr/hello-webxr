import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { HemisphericLight, PointLight } from '@babylonjs/core/Lights/index.js';
import type { Scene } from '@babylonjs/core/scene.js';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';
import type { WallPatternType, FloorPatternType } from '../types/index.js';

export interface RoomDimensions {
  width: number;   // X axis
  height: number;  // Y axis
  depth: number;   // Z axis
}

export interface DoorwayConfig {
  /** Position on the wall: 'north', 'south', 'east', 'west' */
  wall: 'north' | 'south' | 'east' | 'west' | null;
  /** Offset from center along the wall (0 = center) */
  offset: number;
  /** Doorway width (default: 1.4) */
  width?: number;
  /** Doorway height (default: 2.6) */
  height?: number;
}

export interface RoomBuildOptions {
  dimensions: RoomDimensions;
  position?: Vector3;
  floorColor?: Color3;
  wallColor?: Color3;
  ceilingColor?: Color3;
  ambientColor?: Color3;
  ambientIntensity?: number;
  pointLightColor?: Color3;
  pointLightIntensity?: number;
  doorways?: DoorwayConfig[];
}

export interface ThemeBasedRoomOptions extends RoomBuildOptions {
  themeId: string;
  baseColor?: Color3;
  accentColor?: Color3;
  wallPattern?: WallPatternType;
  floorPattern?: FloorPatternType;
}

export interface RoomResult {
  floor: AbstractMesh;
  walls: AbstractMesh[];
  ceiling: AbstractMesh;
  doorways: AbstractMesh[];
  lights: { hemispheric: HemisphericLight; point: PointLight };
}

/**
 * Build a complete room with floor, walls, ceiling, doorways, and lighting.
 * Walls with doorways are split into segments around the doorway opening.
 */
export function buildRoom(scene: Scene, options: RoomBuildOptions): RoomResult {
  const {
    dimensions: { width, height, depth },
    position = Vector3.Zero(),
    floorColor = new Color3(0.15, 0.15, 0.2),
    wallColor = new Color3(0.2, 0.2, 0.25),
    ceilingColor = new Color3(0.12, 0.12, 0.15),
    ambientColor = new Color3(0.6, 0.6, 0.7),
    ambientIntensity = 0.6,
    pointLightColor = new Color3(1, 0.95, 0.85),
    pointLightIntensity = 0.8,
    doorways = [],
  } = options;

  const doorWidth = 1.4;
  const doorHeight = 2.6;
  const wallThickness = 0.15;

  // --- Materials ---
  const floorMat = new StandardMaterial('roomFloorMat', scene);
  floorMat.diffuseColor = floorColor;
  floorMat.specularColor = new Color3(0.1, 0.1, 0.1);

  const wallMat = new StandardMaterial('roomWallMat', scene);
  wallMat.diffuseColor = wallColor;
  wallMat.specularColor = new Color3(0.05, 0.05, 0.05);

  const ceilingMat = new StandardMaterial('roomCeilingMat', scene);
  ceilingMat.diffuseColor = ceilingColor;

  // --- Floor ---
  const floor = MeshBuilder.CreateGround('roomFloor', {
    width: width,
    height: depth,
  }, scene);
  floor.position = new Vector3(position.x, position.y, position.z);
  floor.material = floorMat;
  floor.receiveShadows = true;
  floor.checkCollisions = true;

  // --- Ceiling ---
  const ceiling = MeshBuilder.CreateGround('roomCeiling', {
    width: width,
    height: depth,
  }, scene);
  ceiling.position = new Vector3(position.x, position.y + height, position.z);
  ceiling.rotation.x = Math.PI;
  ceiling.material = ceilingMat;
  ceiling.checkCollisions = true;

  // --- Walls ---
  const walls: AbstractMesh[] = [];
  const doorwayMeshes: AbstractMesh[] = [];

  // Wall definitions: [axis, size1, size2, wallCenterOffset, rotation]
  const wallDefs: Array<{
    name: string;
    center: Vector3;
    size: [number, number];
    rotation: number;
    doorwayWall: 'north' | 'south' | 'east' | 'west';
  }> = [
    {
      name: 'wallNorth',
      center: new Vector3(position.x, position.y + height / 2, position.z - depth / 2),
      size: [width, height],
      rotation: 0,
      doorwayWall: 'north',
    },
    {
      name: 'wallSouth',
      center: new Vector3(position.x, position.y + height / 2, position.z + depth / 2),
      size: [width, height],
      rotation: Math.PI,
      doorwayWall: 'south',
    },
    {
      name: 'wallEast',
      center: new Vector3(position.x + width / 2, position.y + height / 2, position.z),
      size: [depth, height],
      rotation: Math.PI / 2,
      doorwayWall: 'east',
    },
    {
      name: 'wallWest',
      center: new Vector3(position.x - width / 2, position.y + height / 2, position.z),
      size: [depth, height],
      rotation: -Math.PI / 2,
      doorwayWall: 'west',
    },
  ];

  for (const wallDef of wallDefs) {
    const doorwayConfig = doorways.find(d => d.wall === wallDef.doorwayWall);
    if (doorwayConfig) {
      const dw = doorwayConfig.width ?? doorWidth;
      const dh = doorwayConfig.height ?? doorHeight;
      const wallLength = wallDef.size[0];

      // Left segment
      const leftWidth = (wallLength - dw) / 2 + wallThickness;
      const leftWall = MeshBuilder.CreateBox(`${wallDef.name}_left`, {
        width: leftWidth,
        height: wallDef.size[1],
        depth: wallThickness,
      }, scene);
      leftWall.rotation.y = wallDef.rotation;
      leftWall.material = wallMat;
      leftWall.checkCollisions = true;
      walls.push(leftWall);

      // Right segment
      const rightWall = MeshBuilder.CreateBox(`${wallDef.name}_right`, {
        width: leftWidth,
        height: wallDef.size[1],
        depth: wallThickness,
      }, scene);
      rightWall.rotation.y = wallDef.rotation;
      rightWall.material = wallMat;
      rightWall.checkCollisions = true;
      walls.push(rightWall);

      // Top segment (above doorway)
      const topHeight = wallDef.size[1] - dh;
      const topWall = MeshBuilder.CreateBox(`${wallDef.name}_top`, {
        width: dw,
        height: topHeight,
        depth: wallThickness,
      }, scene);
      topWall.rotation.y = wallDef.rotation;
      topWall.material = wallMat;
      topWall.checkCollisions = true;
      walls.push(topWall);

      // Position segments based on wall orientation
      positionDoorwaySegments(leftWall, rightWall, topWall, wallDef, doorwayConfig, wallLength, height);
    } else {
      // Solid wall
      const wall = MeshBuilder.CreateBox(wallDef.name, {
        width: wallDef.size[0],
        height: wallDef.size[1],
        depth: wallThickness,
      }, scene);
      wall.position = wallDef.center;
      wall.rotation.y = wallDef.rotation;
      wall.material = wallMat;
      wall.checkCollisions = true;
      walls.push(wall);
    }
  }

  // --- Lighting ---
  const hemispheric = new HemisphericLight(
    'roomHemiLight',
    new Vector3(0, 1, 0),
    scene
  );
  hemispheric.intensity = ambientIntensity;
  hemispheric.diffuse = ambientColor;
  hemispheric.groundColor = new Color3(0.1, 0.1, 0.15);

  const point = new PointLight(
    'roomPointLight',
    new Vector3(position.x, position.y + height - 0.5, position.z),
    scene
  );
  point.intensity = pointLightIntensity;
  point.diffuse = pointLightColor;
  point.range = Math.max(width, depth) * 1.5;

  return { floor, walls, ceiling, doorways: doorwayMeshes, lights: { hemispheric, point } };
}

function positionDoorwaySegments(
  leftWall: import('@babylonjs/core/Meshes/abstractMesh.js').AbstractMesh,
  rightWall: import('@babylonjs/core/Meshes/abstractMesh.js').AbstractMesh,
  topWall: import('@babylonjs/core/Meshes/abstractMesh.js').AbstractMesh,
  wallDef: { center: Vector3; doorwayWall: string; size: number[] },
  doorwayConfig: DoorwayConfig,
  wallLength: number,
  height: number
): void {
  const dw = doorwayConfig.width ?? 1.4;
  const dh = doorwayConfig.height ?? 2.6;
  const halfWallLength = wallLength / 2;
  const offset = doorwayConfig.offset ?? 0;

  switch (wallDef.doorwayWall) {
    case 'north': {
      leftWall.position = new Vector3(
        wallDef.center.x - offset - dw / 2 - (wallLength - dw) / 4,
        wallDef.center.y,
        wallDef.center.z
      );
      rightWall.position = new Vector3(
        wallDef.center.x - offset + dw / 2 + (wallLength - dw) / 4,
        wallDef.center.y,
        wallDef.center.z
      );
      topWall.position = new Vector3(
        wallDef.center.x - offset,
        wallDef.center.y + (height - dh) / 2,
        wallDef.center.z
      );
      break;
    }
    case 'south': {
      leftWall.position = new Vector3(
        wallDef.center.x + offset + dw / 2 + (wallLength - dw) / 4,
        wallDef.center.y,
        wallDef.center.z
      );
      rightWall.position = new Vector3(
        wallDef.center.x + offset - dw / 2 - (wallLength - dw) / 4,
        wallDef.center.y,
        wallDef.center.z
      );
      topWall.position = new Vector3(
        wallDef.center.x + offset,
        wallDef.center.y + (height - dh) / 2,
        wallDef.center.z
      );
      break;
    }
    case 'east': {
      leftWall.position = new Vector3(
        wallDef.center.x,
        wallDef.center.y,
        wallDef.center.z + offset + dw / 2 + (wallLength - dw) / 4
      );
      rightWall.position = new Vector3(
        wallDef.center.x,
        wallDef.center.y,
        wallDef.center.z + offset - dw / 2 - (wallLength - dw) / 4
      );
      topWall.position = new Vector3(
        wallDef.center.x,
        wallDef.center.y + (height - dh) / 2,
        wallDef.center.z + offset
      );
      break;
    }
    case 'west': {
      leftWall.position = new Vector3(
        wallDef.center.x,
        wallDef.center.y,
        wallDef.center.z - offset - dw / 2 - (wallLength - dw) / 4
      );
      rightWall.position = new Vector3(
        wallDef.center.x,
        wallDef.center.y,
        wallDef.center.z - offset + dw / 2 + (wallLength - dw) / 4
      );
      topWall.position = new Vector3(
        wallDef.center.x,
        wallDef.center.y + (height - dh) / 2,
        wallDef.center.z - offset
      );
      break;
    }
  }
}