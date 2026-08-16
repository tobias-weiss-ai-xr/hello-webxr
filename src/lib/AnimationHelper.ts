import { Scene, MeshBuilder, Vector3, Color4, type Mesh, ParticleSystem } from '@babylonjs/core';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import type { Color3 } from '@babylonjs/core';
import type { ParticleType } from '../types/index.js';

export class AnimationHelper {
  /**
   * Animate mesh scale (pulse effect)
   */
  static async animatePulse(mesh: Mesh, scene: Scene): Promise<void> {
    const animationGroup = scene.beginAnimation(mesh, 0, 60, false);
    return new Promise(resolve => {
      if (animationGroup) {
        animationGroup.onAnimationEndObservable.addOnce(() => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * GPU particle emission (one draw call, auto-animated).
   * Replaces the old per-sphere-mesh approach which leaked a
   * registerBeforeRender observer per particle. The returned ParticleSystem
   * is tracked by the RoomManager and disposed on room exit.
   */
  static emitParticles(
    scene: Scene,
    count: number,
    origin: Vector3,
    color: Color3,
    _duration: number = 2000,
    particleType: ParticleType = 'energy'
  ): ParticleSystem {
    const capacity = Math.max(40, count * 4);
    const ps = new ParticleSystem('themeParticles', capacity, scene);

    // Soft radial flare texture (no asset file required).
    const size = 64;
    const flare = new DynamicTexture('themeParticleFlare', size, scene, false);
    const ctx2d = flare.getContext() as unknown as CanvasRenderingContext2D;
    const g = ctx2d.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx2d.fillStyle = g;
    ctx2d.fillRect(0, 0, size, size);
    flare.hasAlpha = true;
    flare.update();
    ps.particleTexture = flare;

    ps.emitter = origin.clone();
    ps.minEmitBox = new Vector3(-0.6, -0.6, -0.6);
    ps.maxEmitBox = new Vector3(0.6, 0.6, 0.6);

    const c = color;
    ps.color1 = new Color4(c.r, c.g, c.b, 0.9);
    ps.color2 = new Color4(c.r, c.g, c.b, 0.7);
    ps.colorDead = new Color4(c.r, c.g, c.b, 0);

    ps.minSize = 0.06;
    ps.maxSize = 0.2;
    ps.minLifeTime = 1.4;
    ps.maxLifeTime = 2.8;
    ps.emitRate = Math.round(count * 5);

    // Per-type motion so each theme reads distinctly.
    switch (particleType) {
      case 'bubbles':
        ps.blendMode = ParticleSystem.BLENDMODE_STANDARD;
        ps.gravity = new Vector3(0, -0.25, 0); // float upward
        ps.direction1 = new Vector3(-0.2, 0.6, -0.2);
        ps.direction2 = new Vector3(0.2, 1.1, 0.2);
        ps.minEmitPower = 0.15; ps.maxEmitPower = 0.5;
        ps.minSize = 0.08; ps.maxSize = 0.22;
        break;
      case 'sparks':
        ps.blendMode = ParticleSystem.BLENDMODE_ADD;
        ps.gravity = new Vector3(0, -0.4, 0); // fall back down
        ps.direction1 = new Vector3(-0.5, 1.2, -0.5);
        ps.direction2 = new Vector3(0.5, 2.0, 0.5);
        ps.minEmitPower = 0.6; ps.maxEmitPower = 1.6;
        ps.minLifeTime = 0.6; ps.maxLifeTime = 1.4;
        ps.minSize = 0.04; ps.maxSize = 0.12;
        break;
      case 'stars':
        ps.blendMode = ParticleSystem.BLENDMODE_ADD;
        ps.gravity = new Vector3(0, 0.05, 0);
        ps.direction1 = new Vector3(-0.15, 0.1, -0.15);
        ps.direction2 = new Vector3(0.15, 0.5, 0.15);
        ps.minEmitPower = 0.05; ps.maxEmitPower = 0.3;
        ps.minLifeTime = 2.5; ps.maxLifeTime = 4.5;
        ps.minSize = 0.05; ps.maxSize = 0.14;
        break;
      case 'radiation':
        ps.blendMode = ParticleSystem.BLENDMODE_ADD;
        ps.gravity = new Vector3(0, 0, 0);
        ps.direction1 = new Vector3(-0.3, 0.3, -0.3);
        ps.direction2 = new Vector3(0.3, 0.3, 0.3);
        ps.minEmitPower = 0.1; ps.maxEmitPower = 0.4;
        ps.minLifeTime = 1.5; ps.maxLifeTime = 3.0;
        break;
      case 'energy':
      default:
        ps.blendMode = ParticleSystem.BLENDMODE_ADD;
        ps.gravity = new Vector3(0, 0.12, 0);
        ps.direction1 = new Vector3(-0.35, 0.4, -0.35);
        ps.direction2 = new Vector3(0.35, 1.0, 0.35);
        ps.minEmitPower = 0.2; ps.maxEmitPower = 0.7;
        break;
    }

    ps.updateSpeed = 0.01;
    ps.start();
    return ps;
  }
}