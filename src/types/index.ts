import type { Scene, Camera, AbstractMesh, TransformNode } from '@babylonjs/core';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';

export interface RoomModule {
  setup(ctx: AppContext, param?: string): void;
  enter(ctx: AppContext, param?: string): void;
  exit(ctx: AppContext): void;
  execute(ctx: AppContext, delta: number, time: number): void;
}

export interface AppContext {
  scene: Scene;
  engine: import('@babylonjs/core').Engine;
  camera: Camera;
  xr: import('@babylonjs/core/XR/webXRDefaultExperience').WebXRDefaultExperience | null;
  room: number;
  vrMode: boolean;
  handedness: 'left' | 'right';
  goto: number | null;
  GotoRoom: (roomIndex: number, elementSymbol?: string, expRoomId?: string) => void;
  assets: Record<string, any>;
  trackMesh: (mesh: AbstractMesh) => void;
  trackNode: (node: TransformNode) => void;
  setFloorMesh?: (mesh: AbstractMesh) => void;
  roomManager?: import('../rooms/RoomManager.js').RoomManager;
}

export interface InteractionState {
  name: string;
  meshes: AbstractMesh[];
  onHoverStart?: (mesh: AbstractMesh) => void;
  onHoverEnd?: (mesh: AbstractMesh) => void;
  onSelectStart?: (mesh: AbstractMesh) => void;
  onSelectEnd?: (mesh: AbstractMesh) => void;
}

export interface ElementData {
  symbol: string;
  name: string;
  nameDE?: string;
  atomicNumber: number;
  mass: number;
  group: string;
  period: number;
  color: string | number;
  description: string;
  descriptionDE?: string;
  theme?: string;
  experiments?: string[];
  icon?: string;
  block?: string;
  groupNumber?: number;
  // Extended fields for detail panel
  discoveryYear?: number;
  discoveredBy?: string;
  electronConfig?: string;
  category?: string;
  uses?: string[];
  hazards?: string[];
  meltingPoint?: number;
  boilingPoint?: number;
  electronegativity?: number;
}

// Theme pattern types
export type WallPatternType = 'smooth' | 'textured' | 'geometric' | 'organic' | 'crystalline' | 'cosmic';
export type FloorPatternType = 'solid' | 'grid' | 'circuit' | 'crystal' | 'cosmic';
export type ParticleType = 'none' | 'dust' | 'bubbles' | 'sparks' | 'stars' | 'energy' | 'radiation';
export type LightingStyleType = 'standard' | 'warm' | 'cool' | 'neon' | 'solar';
export type InfoPanelStyleType = 'minimal' | 'detailed' | 'interactive';

// Particle configuration
export interface ParticleConfig {
  enabled: boolean;
  type: ParticleType;
  density: number;  // 0.0 to 1.0
  color: Color3;
}

// Experiment types (for future phases)
export type ExperimentType = 'none' | 'reaction' | 'display' | 'simulation' | 'interaction';

// Complete theme definition
export interface Theme {
  id: string;
  name: string;
  
  // Visual identity
  baseColor: Color3;
  accentColor: Color3;
  wallPattern: WallPatternType;
  floorPattern: FloorPatternType;
  
  // Atmosphere
  ambientParticles: ParticleConfig;
  lightingStyle: LightingStyleType;
  
  // Audio
  ambientSound: string;
  interactionSounds: string[];
  
  // Educational content
  infoPanelStyle: InfoPanelStyleType;
  
  // Available experiments
  experimentTypes: ExperimentType[];
  
  // Special elements that get curated enhancements
  curatedElements: string[];
}

export interface EmbedOptions {
  container: HTMLElement | string;
  locale?: 'de' | 'en' | 'fr' | 'zh' | 'sv';
  startRoom?: string;
  audio?: boolean;
  width?: number;
  height?: number;
  backgroundColor?: string;
  onReady?: () => void;
  onRoomChange?: (roomName: string) => void;
  onVREnter?: () => void;
  onVRExit?: () => void;
}

export interface ExperimentalRoomData {
  id: string;
  name: string;
  nameDE?: string;
  description: string;
  descriptionDE?: string;
  icon?: string;
  color?: number;
  elements?: string[];
  difficulty?: string;
  experiments?: string[];
}
