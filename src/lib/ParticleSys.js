import * as THREE from 'three';

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 100;
  }

  createParticle(position, options = {}) {
    const type = options.type || 'spark';
    const color = options.color || new THREE.Color(0xffaa00);
    const size = options.size || 0.05;
    const lifetime = options.lifetime || 2;
    const velocity = options.velocity || new THREE.Vector3(0, 0.1, 0);

    let geometry, material;

    switch(type) {
      case 'spark':
        geometry = new THREE.SphereGeometry(size, 8, 8);
        material = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 1
        });
        break;

      case 'smoke':
        geometry = new THREE.SphereGeometry(size * 2, 8, 8);
        material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0x888888).multiplyScalar(0.3),
          transparent: true,
          opacity: 0.3
        });
        break;

      case 'fizzle':
        geometry = new THREE.BoxGeometry(size * 3, size * 0.5, size * 3);
        material = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.6
        });
        break;

      case 'flame':
        geometry = new THREE.ConeGeometry(size * 2, size * 0.5, 8, 4);
        material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0xff6600),
          transparent: true,
          opacity: 0.8
        });
        break;

      case 'bubble':
        geometry = new THREE.SphereGeometry(size, 16, 16);
        material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0x4a90e2).multiplyScalar(0.3),
          transparent: true,
          opacity: 0.4
        });
        break;

      case 'steam':
        geometry = new THREE.SphereGeometry(size * 3, 8, 8);
        material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0xcccccc).multiplyScalar(0.2),
          transparent: true,
          opacity: 0.5
        });
        break;

      default:
        geometry = new THREE.SphereGeometry(size, 8, 8);
        material = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.8
        });
        break;
    }

    const particle = new THREE.Mesh(geometry, material);
    particle.position.copy(position);
    particle.userData = {
      velocity: velocity,
      lifetime: lifetime,
      age: 0,
      type: type,
      size: size
    };

    return particle;
  }

  emit(position, options = {}) {
    if (this.particles.length >= this.maxParticles) return null;

    const particle = this.createParticle(position, options);
    this.particles.push(particle);

    return particle;
  }

  update(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      particle.userData.age += delta;

      if (particle.userData.lifetime <= 0) {
        particle.userData.lifetime = 0.01;
        particle.visible = false;
      }

      if (particle.userData.age >= particle.userData.lifetime) {
        this.removeParticle(i);
        continue;
      }

      if (!particle.visible) continue;

      particle.position.addScaledVector(particle.userData.velocity, delta);

      const progress = particle.userData.age / particle.userData.lifetime;
      const invProgress = 1 - progress;

      if (particle.material.opacity !== undefined) {
        particle.material.opacity *= 0.98;
      }

      switch(particle.userData.type) {
        case 'spark':
          particle.scale.setScalar(1 + progress * 0.5);
          break;

        case 'smoke':
          particle.position.y += delta * 0.5;
          particle.scale.setScalar(1 + progress);
          break;

        case 'fizzle':
          particle.rotation.x += delta * 5;
          particle.scale.setScalar(1 + progress * 2);
          break;

        case 'flame':
          particle.material.opacity = 0.8 * invProgress;
          particle.scale.setScalar(1 + progress * 0.5);
          break;

        case 'bubble':
          particle.position.y += delta * 2;
          break;

        case 'steam':
          particle.position.y += delta * 1.5;
          particle.scale.setScalar(1 + progress * 3);
          break;
      }
    }
  }

  removeParticle(index) {
    const particle = this.particles[index];
    if (particle) {
      particle.geometry.dispose();
      particle.material.dispose();
    }

    this.particles.splice(index, 1);
  }

  addParticles(position, count, options = {}) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );

      const pos = position.clone().add(offset);
      const particle = this.emit(pos, options);
      particles.push(particle);
    }

    return particles;
  }

  clear() {
    for (const particle of this.particles) {
      if (particle) {
        particle.geometry.dispose();
        particle.material.dispose();
      }
    }

    this.particles = [];
  }

  getActiveCount() {
    return this.particles.filter(p => p.visible).length;
  }
}
