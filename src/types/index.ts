import type { Scene, Camera, AbstractMesh, TransformNode } from '@babylonjs/core';

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
