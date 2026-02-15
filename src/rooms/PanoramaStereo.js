import * as THREE from 'three';
var panoL, panoR, context, depthParticles;

function createDepthParticles(ctx) {
  const particleCount = 200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 20 + Math.random() * 80;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.5,
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true
  });

  return new THREE.Points(geometry, material);
}

export function setup(ctx) {
  const assets = ctx.assets;
  const geometry = new THREE.SphereBufferGeometry(500, 60, 40);
  const materialL = new THREE.MeshBasicMaterial( { map: assets['stereopanoR'], side: THREE.BackSide } );
  const materialR = new THREE.MeshBasicMaterial( { map: assets['stereopanoL'], side: THREE.BackSide } );
  panoL = new THREE.Mesh(geometry, materialL);
  panoL.layers.set(1);
  panoR = new THREE.Mesh(geometry, materialR);
  panoR.layers.set(2);

  ctx.raycontrol.addState('panoramaStereo', {
    raycaster: false,
    onSelectEnd: onSelectEnd
  });
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);
  ctx.scene.add(panoL);
  ctx.scene.add(panoR);
  ctx.camera.layers.enable(1);
  context = ctx;

  // Add depth particles for stereo depth perception
  depthParticles = createDepthParticles(ctx);
  ctx.scene.add(depthParticles);

  ctx.raycontrol.activateState('panoramaStereo');
}

export function exit(ctx) {
  ctx.scene.remove(panoL);
  ctx.scene.remove(panoR);
  ctx.camera.layers.disable(1);

  // Clean up depth particles
  if (depthParticles) {
    ctx.scene.remove(depthParticles);
    depthParticles.geometry.dispose();
    depthParticles.material.dispose();
    depthParticles = null;
  }

  ctx.raycontrol.deactivateState('panoramaStereo');
}

export function execute(ctx, delta, time) {
  // Slowly rotate particles for subtle depth motion
  if (depthParticles) {
    depthParticles.rotation.y = time * 0.02;
    depthParticles.rotation.x = Math.sin(time * 0.1) * 0.1;
  }
}

export function onSelectEnd(evt) {
  context.goto = 0;
}

