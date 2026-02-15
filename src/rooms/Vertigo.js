import * as THREE from 'three';
var scene, doorMaterial, door, fogParticles, ambientLights;

function createFogParticles(ctx) {
  const particleCount = 150;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    velocities.push({
      x: (Math.random() - 0.5) * 0.01,
      y: Math.random() * 0.005,
      z: (Math.random() - 0.5) * 0.01
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.userData.velocities = velocities;

  const material = new THREE.PointsMaterial({
    size: 0.08,
    color: 0xaabbcc,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true
  });

  return new THREE.Points(geometry, material);
}

function createAmbientLights(ctx) {
  const lights = [];
  const colors = [0x677FA7, 0x8899bb, 0x5566aa];

  for (let i = 0; i < 3; i++) {
    const light = new THREE.PointLight(colors[i], 0.3, 20);
    light.position.set(
      Math.cos(i * Math.PI * 2 / 3) * 8,
      5 + i * 2,
      Math.sin(i * Math.PI * 2 / 3) * 8
    );
    lights.push(light);
  }

  return lights;
}

function createDoorMaterial(ctx) {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: {value: 0},
      selected: {value: 0},
      tex: {value: ctx.assets['doorfx_tex']}
    },
    vertexShader: ctx.shaders.basic_vert,
    fragmentShader: ctx.shaders.door_frag
  });
}

export function setup(ctx) {
  const assets = ctx.assets;
  var texture = assets['checkboard_tex'];

  var lightmap = assets['vertigo_lm_tex'];
  const material = new THREE.MeshBasicMaterial({color: 0xffffff, map: texture, lightMap: lightmap} );

  scene = assets['vertigo_model'].scene;
  scene.getObjectByName('city').material = material;
  scene.getObjectByName('teleport').visible = false;

  scene.getObjectByName('door_frame').material =
    new THREE.MeshBasicMaterial({map: assets['vertigo_door_lm_tex']});
  doorMaterial = createDoorMaterial(ctx);
  door = scene.getObjectByName('door');
  door.material = doorMaterial;

  ctx.raycontrol.addState('doorVertigo', {
    colliderMesh: scene.getObjectByName('door'),
    onHover: (intersection, active) => {
      //teleport.onHover(intersection.point, active);
      const scale = intersection.object.scale;
      scale.z = Math.min(scale.z + 0.02 * (2 - door.scale.z), 0.8);
    },
    onHoverLeave: () => {
      //teleport.onHoverLeave();
    },
    onSelectStart: (intersection, e) => {
      ctx.goto = 0;
      //teleport.onSelectStart(e);
    },
    onSelectEnd: (intersection) => {
      //teleport.onSelectEnd(intersection.point);
    }
  });

  let teleport = scene.getObjectByName('teleport');
  teleport.visible = true;
  teleport.material.visible = false;
  ctx.raycontrol.addState('teleportVertigo', {
    colliderMesh: teleport,
    onHover: (intersection, active) => {
      ctx.teleport.onHover(intersection.point, active);
    },
    onHoverLeave: () => {
      ctx.teleport.onHoverLeave();
    },
    onSelectStart: (intersection, e) => {
      ctx.teleport.onSelectStart(e);
    },
    onSelectEnd: (intersection) => {
      ctx.teleport.onSelectEnd(intersection.point);
    }
  });
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x677FA7);
  ctx.scene.add(scene);
  ctx.scene.parent.fog = new THREE.FogExp2(0x677FA7, 0.004);
  //ctx.cameraRig.position.set(0,0,0);

  // Add fog particles
  fogParticles = createFogParticles(ctx);
  ctx.scene.add(fogParticles);

  // Add ambient lights
  ambientLights = createAmbientLights(ctx);
  ambientLights.forEach(light => ctx.scene.add(light));

  ctx.raycontrol.activateState('teleportVertigo');
  ctx.raycontrol.activateState('doorVertigo');
}

export function exit(ctx) {
  ctx.scene.remove(scene);
  ctx.scene.parent.fog = null;

  // Remove fog particles
  if (fogParticles) {
    ctx.scene.remove(fogParticles);
    fogParticles.geometry.dispose();
    fogParticles.material.dispose();
    fogParticles = null;
  }

  // Remove ambient lights
  if (ambientLights) {
    ambientLights.forEach(light => ctx.scene.remove(light));
    ambientLights = null;
  }

  ctx.raycontrol.deactivateState('teleportVertigo');
  ctx.raycontrol.deactivateState('doorVertigo');
}

export function execute(ctx, delta, time) {
  doorMaterial.uniforms.time.value = time;

  if (door.scale.z > 0.2) {
    door.scale.z = Math.max(door.scale.z - delta * door.scale.z, 0.2);
  }

  // Animate fog particles
  if (fogParticles) {
    const positions = fogParticles.geometry.attributes.position.array;
    const velocities = fogParticles.geometry.userData.velocities;

    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3] += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;

      // Wrap particles
      if (positions[i * 3 + 1] > 20) positions[i * 3 + 1] = 0;
      if (positions[i * 3] > 15) positions[i * 3] = -15;
      if (positions[i * 3] < -15) positions[i * 3] = 15;
      if (positions[i * 3 + 2] > 15) positions[i * 3 + 2] = -15;
      if (positions[i * 3 + 2] < -15) positions[i * 3 + 2] = 15;
    }
    fogParticles.geometry.attributes.position.needsUpdate = true;
  }

  // Animate ambient lights
  if (ambientLights) {
    ambientLights.forEach((light, i) => {
      light.intensity = 0.3 + Math.sin(time * 0.5 + i * 2) * 0.1;
    });
  }
}

