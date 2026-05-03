import type { AppContext } from '../types/index.js';
import { Animation } from '@babylonjs/core/Animations/animation.js';
import { EasingFunction } from '@babylonjs/core/Animations/easing.js';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';

export interface RoomTransitionOptions {
  duration?: number;           // Default: 500ms
  fadeEnabled?: boolean;       // Default: true
  animationEnabled?: boolean;  // Default: true
}

export class RoomTransitionManager {
  private _isTransitioning = false;
  private _activeAnimations = new Set<Animation>();
  private _fadeAnimations = new Map<AbstractMesh, Animation>();
}