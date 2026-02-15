import * as THREE from 'three';
import { Text, Position, ParentObject3D } from '../components/index.js';

var pano = null, context, panel, panelText;
var ambientParticles = null;

const NUM_PANOS = 5;

const DATA = [
  'Tiger and Turtle - Magic Mountain\nArt installation in Agerpark, Germany.',
  'Hiking trail at Lake Byllesby Regional Park near Cannon Falls, USA.',
  'Dellwiger Bach natural reserve in Dortmund, Germany.',
  'Zapporthorn summit in Lepontine Alps, Switzerland.',
  'Ruin of romanesque Paulinzella abbey (1106) in Thuringia, Germany.',
];

var panoMaterials = [];

export function setup(ctx) {
  const assets = ctx.assets;
  const geometry = new THREE.SphereBufferGeometry(500, 60, 40);
  for (var i = 0; i < NUM_PANOS; i++) {
    const panoName = 'pano'+(i + 2);
    panoMaterials[i] = new THREE.MeshBasicMaterial( { map: assets[panoName], side: THREE.BackSide });
  }
  pano = new THREE.Mesh(geometry, panoMaterials[0]);

  // Create floating dust particles for atmosphere
  createAmbientParticles(ctx);

  panel = assets['hall_model'].scene.getObjectByName('infopanel');
  panel.material = new THREE.MeshBasicMaterial({color: 0x040404});
  panel.position.set(0, 0.1, 0);
  panel.parent.remove(panel);

  panelText = ctx.world.createEntity();
  panelText
    .addComponent(Text, {
      color: '#ffffff',
      fontSize: 0.02,
      anchor: 'left',
      textAlign: 'left',
      baseline: 'center',
      maxWidth: 0.34,
      lineHeight: 1.3,
      text: DATA[i],
    })
    .addComponent(ParentObject3D, {value: panel})
    .addComponent(Position, {x: -0.17, y: 0.003, z: 0.01});

  ctx.raycontrol.addState('panorama', {
    raycaster: false,
    onSelectEnd: onSelectEnd
  });
}

function createAmbientParticles(ctx) {
  const particleCount = 200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = 1 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const y = -0.5 + Math.random() * 2;

    positions[i3] = Math.cos(theta) * radius;
    positions[i3 + 1] = y;
    positions[i3 + 2] = Math.sin(theta) * radius;
    
    velocities.push({
      x: (Math.random() - 0.5) * 0.01,
      y: (Math.random() - 0.5) * 0.005,
      z: (Math.random() - 0.5) * 0.01
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });

  ambientParticles = new THREE.Points(geometry, material);
  ambientParticles.userData.velocities = velocities;
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);

  const room = ctx.room - 5;
  panelText.getMutableComponent(Text).text = DATA[room];
  pano.material = panoMaterials[room];

  ctx.scene.add(pano);
  
  if (ambientParticles) {
    ctx.scene.add(ambientParticles);
  }

  ctx.controllers[1].add(panel);

  ctx.raycontrol.activateState('panorama');

  context = ctx;
}

export function exit(ctx) {
  ctx.scene.remove(pano);
  
  if (ambientParticles) {
    ctx.scene.remove(ambientParticles);
  }
  
  ctx.controllers[1].remove(panel);

  ctx.raycontrol.deactivateState('panorama');
}

export function execute(ctx, delta, time) {
  // Very slow rotation for immersion
  if (pano) {
    pano.rotation.y += delta * 0.01;
  }
  
  // Animate particles
  if (ambientParticles) {
    const positions = ambientParticles.geometry.attributes.position.array;
    const velocities = ambientParticles.userData.velocities;
    
    for (let i = 0; i < velocities.length; i++) {
      const i3 = i * 3;
      positions[i3] += velocities[i].x;
      positions[i3 + 1] += velocities[i].y;
      positions[i3 + 2] += velocities[i].z;
      
      // Wrap around
      if (positions[i3] > 5) positions[i3] = -5;
      if (positions[i3] < -5) positions[i3] = 5;
      if (positions[i3 + 1] > 2) positions[i3 + 1] = -0.5;
      if (positions[i3 + 1] < -0.5) positions[i3 + 1] = 2;
      if (positions[i3 + 2] > 5) positions[i3 + 2] = -5;
      if (positions[i3 + 2] < -5) positions[i3 + 2] = 5;
    }
    
    ambientParticles.geometry.attributes.position.needsUpdate = true;
  }
}

export function onSelectEnd(evt) {
  context.goto = 0;
}
