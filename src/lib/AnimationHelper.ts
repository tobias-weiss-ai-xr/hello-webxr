import { Scene, MeshBuilder, Vector3 } from '@babylonjs/core';
import type { Color3 } from '@babylonjs/core';
import { StandardMaterial as StdMat } from '@babylonjs/core/Materials/standardMaterial.js';

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
   * Simple particle emission animation
   */
  static emitParticles(
    scene: Scene,
    count: number,
    origin: Vector3,
    color: Color3,
    duration: number = 2000
  ): Mesh[] {
    const particles: Mesh[] = [];
    const particleMat = new StdMat('particleMat', scene);
    particleMat.diffuseColor = color;
    particleMat.emissiveColor = color.scale(0.3);
    particleMat.alpha = 0.6;
    particleMat.disableLighting = true;

    for (let i = 0; i < count; i++) {
      const particle = MeshBuilder.CreateSphere(`particle_${i}`, {
        diameter: 0.08,
        segments: 8
      }, scene);

      particle.position.set(
        origin.x + (Math.random() - 0.5) * 0.5,
        origin.y + (Math.random() - 0.5) * 0.5,
        origin.z + (Math.random() - 0.5) * 0.5
      );
      particle.material = particleMat;
      particles.push(particle);

      const driftY = 0.001 + Math.random() * 0.002;
      const startY = particle.position.y;

      scene.registerBeforeRender(() => {
        particle.position.y += driftY;
        particle.alpha -= 0.002;
        if (particle.alpha <= 0) {
          particle.position.y = startY;
          const sigma = particle.material as StdMat;
          sigma.alpha = 0.6;
        }
      });
    }

    return particles;
  }
}