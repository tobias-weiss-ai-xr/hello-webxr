import type { AppContext } from '../types/index.js';
import { RoomManager } from '../rooms/RoomManager.js';
import { Animation } from '@babylonjs/core/Animations/animation.js';
import { EasingFunction } from '@babylonjs/core/Animations/easing.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import type { AbstractMesh, Animatable, UniversalCamera } from '@babylonjs/core';

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
    roomExchange: () => void,
    options: RoomTransitionOptions = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      this.cancel();

      this._isTransitioning = true;
      this._resolveTransition = resolve;
      const duration = options.duration ?? 500;
      const enableFade = options.fadeEnabled ?? true;
      const enableAnimation = options.animationEnabled ?? true;

      const targetPosition = new Vector3(0, 1.6, 8);
      const targetRotation = new Vector3(0, Math.PI, 0);

      if (enableAnimation && !ctx.vrMode) {
        this.animateDesktopCamera(ctx, targetPosition, targetRotation, duration);
      }

      const midpoint = duration / 2;
      setTimeout(() => {
        if (enableFade) {
          this.fadeInRoomMeshes(ctx, midpoint);
        }
      }, midpoint);

      setTimeout(() => {
        this._isTransitioning = false;
        this._resolveTransition = null;
        this._fadeAnimations.clear();
        resolve();
      }, duration);
    });
  }

  isTransitioning(): boolean {
    return this._isTransitioning;
  }

  private animateDesktopCamera(
    ctx: AppContext,
    targetPosition: Vector3,
    targetRotation: Vector3,
    duration: number
  ): void {
    const camera = ctx.camera as UniversalCamera;
    const easing = new EasingFunction();
    easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    const keyFramesPos: Vector3[] = [];
    const keyFramesRot: Vector3[] = [];
    const fps = 60;
    const totalFrames = Math.round((duration / 1000) * fps);

    for (let i = 0; i <= totalFrames; i++) {
      const t = i / totalFrames;
      keyFramesPos.push(Vector3.Lerp(camera.position, targetPosition, t));
      keyFramesRot.push(Vector3.Lerp(camera.rotation, targetRotation, t));
    }

    const posAnimation = new Animation(
      'camera-position',
      'position',
      fps,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    posAnimation.setKeys(keyFramesPos.map((val, i) => ({ frame: i, value: val })));
    posAnimation.setEasingFunction(easing);

    const rotAnimation = new Animation(
      'camera-rotation',
      'rotation',
      fps,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    rotAnimation.setKeys(keyFramesRot.map((val, i) => ({ frame: i, value: val })));
    rotAnimation.setEasingFunction(easing);

    camera.animations = [posAnimation, rotAnimation];

    const animatable = ctx.scene.beginAnimation(camera, 0, totalFrames, false);
    if (animatable) {
      this._animateTarget = animatable;
    }
  }

  private fadeOutRoomMeshes(
    ctx: AppContext,
    duration: number,
    callback: () => void
  ): void {
    if (!ctx.roomManager) {
      callback();
      return;
    }

    const meshes = ctx.roomManager.getRoomMeshes();

    let completed = 0;
    const total = meshes.length;

    meshes.forEach(mesh => {
      const material = mesh.material as StandardMaterial;
      if (!material) {
        completed++;
        if (completed === total && this._isTransitioning) callback();
        return;
      }

      const originalAlpha = material.alpha;
      mesh.metadata._originalAlpha = originalAlpha;

      const fadeAnimation = new Animation(
        'material-alpha',
        'alpha',
        60,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );

      fadeAnimation.setKeys([
        { frame: 0, value: originalAlpha },
        { frame: Math.round((duration / 1000) * 60), value: 0.25 }
      ]);

      const easing = new EasingFunction();
      easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
      fadeAnimation.setEasingFunction(easing);

      material.animations = [fadeAnimation];
      const animatable = ctx.scene.beginAnimation(material, 0, Math.round((duration / 1000) * 60), false);

      if (animatable) {
        animatable.onAnimationEnd = () => {
          completed++;
          if (completed === total && this._isTransitioning) callback();
        };
        this._fadeAnimations.set(mesh, animatable);
      } else {
        completed++;
        if (completed === total && this._isTransitioning) callback();
      }
    });

    if (total === 0) callback();
  }

  private fadeInRoomMeshes(
    ctx: AppContext,
    duration: number
  ): void {
    if (!ctx.roomManager) {
      return;
    }

    const meshes = ctx.roomManager.getRoomMeshes();

    meshes.forEach(mesh => {
      const material = mesh.material as StandardMaterial;
      if (!material) return;

      const targetAlpha = mesh.metadata._originalAlpha ?? 1.0;
      delete mesh.metadata._originalAlpha;

      const fadeAnimation = new Animation(
        'material-alpha',
        'alpha',
        60,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );

      fadeAnimation.setKeys([
        { frame: 0, value: 0.25 },
        { frame: Math.round((duration / 1000) * 60), value: targetAlpha }
      ]);

      const easing = new EasingFunction();
      easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
      fadeAnimation.setEasingFunction(easing);

      material.animations = [fadeAnimation];
      const animatable = ctx.scene.beginAnimation(material, 0, Math.round((duration / 1000) * 60), false);

      if (animatable) {
        this._fadeAnimations.set(mesh, animatable);
      }
    });
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