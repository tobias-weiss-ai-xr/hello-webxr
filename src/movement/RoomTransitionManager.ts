import type { AppContext } from '../types/index.js';
import { Animation } from '@babylonjs/core/Animations/animation.js';
import { EasingFunction } from '@babylonjs/core/Animations/easing.js';
import type { AbstractMesh, Animatable } from '@babylonjs/core';

export interface RoomTransitionOptions {
  duration?: number;           // Default: 500ms
  fadeEnabled?: boolean;       // Default: true
  animationEnabled?: boolean;  // Default: true
}

export class RoomTransitionManager {
  private _isTransitioning = false;
  private _activeAnimations = new Set<Animatable>();
  private _animateTarget: Animatable | null = null;
  private _fadeAnimations = new Map<AbstractMesh, Animatable>();
  private _resolveTransition: (() => void) | null = null;

  transitionTo(
    ctx: AppContext,
    targetRoomIndex: number,
    options: RoomTransitionOptions = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      this.cancel();

      this._isTransitioning = true;
      this._resolveTransition = resolve;
      const duration = options.duration ?? 500;
      const enableFade = options.fadeEnabled ?? true;
      const enableAnimation = options.animationEnabled ?? true;

      // TODO: Implement camera animation and fade logic
      // For now, resolve immediately to test structure
      setTimeout(() => {
        this._isTransitioning = false;
        this._resolveTransition = null;
        resolve();
      }, duration);
    });
  }

  isTransitioning(): boolean {
    return this._isTransitioning;
  }

  cancel(): void {
    this._activeAnimations.forEach(animatable => {
      if (animatable) {
        animatable.stop();
      }
    });
    this._activeAnimations.clear();

    if (this._animateTarget) {
      this._animateTarget.stop();
      this._animateTarget = null;
    }

    this._fadeAnimations.forEach((animatable, mesh) => {
      if (animatable) {
        animatable.stop();
      }
      // TODO: Restore original alpha
    });
    this._fadeAnimations.clear();

    this._isTransitioning = false;

    if (this._resolveTransition) {
      this._resolveTransition();
      this._resolveTransition = null;
    }
  }
}