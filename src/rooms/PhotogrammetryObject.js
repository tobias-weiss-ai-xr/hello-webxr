import * as THREE from 'three';
var scene, doorMaterial, door, spotLight, dustParticles;

function createDustParticles(ctx) {
  const particleCount = 100;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = Math.random() * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xffffcc,
    transparent: true,
    opacity: 0.4
  });

  return new THREE.Points(geometry, material);
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
  scene = assets['pg_object_model'].scene;
  scene.rotation.y = -Math.PI / 2;

  scene.getObjectByName('object').material =
    new THREE.MeshBasicMaterial({map: assets['pg_object_tex']});
  scene.getObjectByName('floor').material =
    new THREE.MeshBasicMaterial({map: assets['pg_floor_tex'], lightMap: assets['pg_floor_lm_tex']});
  scene.getObjectByName('bg').material =
    new THREE.MeshBasicMaterial({map: assets['pg_bg_tex']});
  scene.getObjectByName('flare').material =
    new THREE.MeshBasicMaterial({map: assets['pg_flare_tex'], blending: THREE.AdditiveBlending});
  scene.getObjectByName('panel').material =
    new THREE.MeshBasicMaterial({map: assets['pg_panel_tex']});
  scene.getObjectByName('door_frame').material =
    new THREE.MeshBasicMaterial({map: assets['pg_door_lm_tex']});

  doorMaterial = createDoorMaterial(ctx);
  door = scene.getObjectByName('door');
  door.material = doorMaterial;

  scene.getObjectByName('teleport').visible = false;

  ctx.raycontrol.addState('doorPhotogrammetry', {
    colliderMesh: scene.getObjectByName('door'),
    onHover: (intersection, active) => {
      //teleport.onHover(intersection.point, active);
      const scale = intersection.object.scale;
      scale.z = Math.min(scale.z + 0.05 * (2 - door.scale.z), 1.5);
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
  ctx.raycontrol.addState('teleportPhotogrammetry', {
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
  ctx.renderer.setClearColor(0x111111);
  ctx.scene.add(scene);

  // Add spotlight for dramatic lighting
  spotLight = new THREE.SpotLight(0xffffee, 1.5, 15, Math.PI / 4, 0.5);
  spotLight.position.set(0, 8, 3);
  spotLight.target.position.set(0, 1, 0);
  ctx.scene.add(spotLight);
  ctx.scene.add(spotLight.target);

  // Add dust particles
  dustParticles = createDustParticles(ctx);
  ctx.scene.add(dustParticles);

  // Add subtle ambient light
  const ambientLight = new THREE.AmbientLight(0x333333, 0.2);
  ctx.scene.add(ambientLight);

  ctx.raycontrol.activateState('doorPhotogrammetry');
  ctx.raycontrol.activateState('teleportPhotogrammetry');
}

export function exit(ctx) {
  ctx.raycontrol.deactivateState('doorPhotogrammetry');
  ctx.raycontrol.deactivateState('teleportPhotogrammetry');

  // Clean up spotlight
  if (spotLight) {
    ctx.scene.remove(spotLight);
    ctx.scene.remove(spotLight.target);
    spotLight = null;
  }

  // Clean up dust particles
  if (dustParticles) {
    ctx.scene.remove(dustParticles);
    dustParticles.geometry.dispose();
    dustParticles.material.dispose();
    dustParticles = null;
  }

  ctx.scene.remove(scene);
}

export function execute(ctx, delta, time) {
  doorMaterial.uniforms.time.value = time;

  if (door.scale.z > 0.5) {
    door.scale.z = Math.max(door.scale.z - delta * door.scale.z, 0.5);
  }

  // Animate dust particles - gentle floating motion
  if (dustParticles) {
    dustParticles.rotation.y = time * 0.02;
    const positions = dustParticles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] += Math.sin(time + i) * 0.001;
    }
    dustParticles.geometry.attributes.position.needsUpdate = true;
  }

  // Subtle spotlight flicker
  if (spotLight) {
    spotLight.intensity = 1.5 + Math.sin(time * 3) * 0.1;
  }
}
