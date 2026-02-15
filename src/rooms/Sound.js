import * as THREE from 'three';
var scene, listener, timeout, mixer, door, doorMaterial, floorGlow, pulseLights;

const soundNames = [
  'bells',
  'horn',
  'cowbell',
  'guiro',
  'mandolin',
  'squeaker',
  'train',
  'whistle',
  'motorhorn',
  'surdo',
  'trumpet',
];

var sounds = {};
soundNames.forEach( i => { sounds[i] = {animations: [], mesh: null, player: null, shadow: null} })

const MAX_REPETITIONS = 3;
var repetitions = MAX_REPETITIONS - 1;

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

function createFloorGlow(ctx) {
  const geometry = new THREE.RingGeometry(3, 8, 64);
  const material = new THREE.MeshBasicMaterial({
    color: 0x4444ff,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  return ring;
}

function createPulseLights(ctx) {
  const lights = [];
  const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44];

  for (let i = 0; i < 4; i++) {
    const light = new THREE.PointLight(colors[i], 0, 8);
    light.position.set(
      Math.cos(i * Math.PI / 2) * 5,
      3,
      Math.sin(i * Math.PI / 2) * 5
    );
    lights.push(light);
  }

  return lights;
}

export function setup(ctx) {
  const assets = ctx.assets;
  scene = assets['sound_model'].scene;
  door = assets['sound_door_model'].scene;

  door.getObjectByName('door_frame').material =
    new THREE.MeshBasicMaterial({map: assets['sound_door_lm_tex']});

  doorMaterial = createDoorMaterial(ctx);
  door.getObjectByName('door').material = doorMaterial;

  door.scale.set(0.5, 0.5, 0.5);
  door.position.set(0.4, 0.6, 1);
  door.rotation.set(0, 0.4, 0);

  listener = new THREE.AudioListener();

  mixer = new THREE.AnimationMixer(scene);

  for (let id in sounds) {
    const mesh = scene.getObjectByName(id);
    if (!mesh) { continue; } 

    const sound = new THREE.PositionalAudio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/ogg/' + id + '.ogg', buffer => {
      sound.setBuffer(buffer);
      //sound.setRefDistance(20);
    });

    sounds[id].player = sound;
    sounds[id].mesh = mesh;
    mesh.visible = false;
    mesh.add(sound);

    const clip = THREE.AnimationClip.findByName(assets['sound_model'].animations, id);
    if (clip) {
      const action = mixer.clipAction(clip, mesh);
      action.loop = THREE.LoopOnce;
      sounds[id].animations.push(action);
    }

    for (let j = 0; j < mesh.children.length; j++) {
      const obj = mesh.children[j];
      const clip = THREE.AnimationClip.findByName(assets['sound_model'].animations, `${id}_${obj.name}`);
      if (!clip) { continue; }
      const action = mixer.clipAction(clip, mesh);
      action.loop = THREE.LoopOnce;
      sounds[id].animations.push(action);
    }

    let shadow = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(3, 3),
      new THREE.MeshBasicMaterial({
        color: mesh.children[0].material.color,
        map: assets['sound_shadow_tex'],
        transparent: true,
        opacity: 0,
        depthTest: false,
        blending: THREE.AdditiveBlending
      })
    );
    shadow.position.set(mesh.position.x, 0.001, mesh.position.z);
    shadow.rotation.x = -Math.PI / 2;
    scene.add(shadow);
    sounds[id].shadow = shadow;
  }

  ctx.raycontrol.addState('sound', {
    colliderMesh: door.getObjectByName('door'),
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

  const floorTexture = assets['grid_tex'];
  const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(20, 20),
    new THREE.MeshBasicMaterial({map: floorTexture})
  );
  scene.add(floor);
  floor.rotation.x = -Math.PI / 2;

  ctx.raycontrol.addState('teleportSound', {
    colliderMesh: floor,
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

var currentSound = -1;

function playSound() {
  let sound;
  if (currentSound >= 0) {
    sound = sounds[soundNames[currentSound]];
    sound.player.stop();
    if (sound.animations.length) {
      sound.mesh.visible = false;
      sound.animations.forEach( i => {i.stop()});
    }
  }
  repetitions ++;
  if (repetitions == MAX_REPETITIONS) {
    repetitions = 0;
    // get next sound
    do {
      currentSound = (currentSound + 1) % soundNames.length;
      sound = sounds[soundNames[currentSound]];
    } while(!sound.mesh);
  }

  sound.player.play();
  if (sound.animations.length) {
    sound.mesh.visible = true;
    sound.animations.forEach( i => {i.play()});
  }
  sound.shadow.material.opacity = 1;
  timeout = setTimeout(playSound, 2000);
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x0a0a15);
  ctx.scene.add(scene);
  ctx.scene.add(door);
  ctx.camera.add(listener);

  // Add floor glow
  floorGlow = createFloorGlow(ctx);
  ctx.scene.add(floorGlow);

  // Add pulse lights
  pulseLights = createPulseLights(ctx);
  pulseLights.forEach(light => ctx.scene.add(light));

  timeout = setTimeout(playSound, 2000);
  ctx.raycontrol.activateState('teleportSound');
  ctx.raycontrol.activateState('sound');
}

export function exit(ctx) {
  ctx.scene.remove(scene);
  ctx.scene.remove(door);
  ctx.camera.remove(listener);

  // Clean up floor glow
  if (floorGlow) {
    ctx.scene.remove(floorGlow);
    floorGlow.geometry.dispose();
    floorGlow.material.dispose();
    floorGlow = null;
  }

  // Clean up pulse lights
  if (pulseLights) {
    pulseLights.forEach(light => ctx.scene.remove(light));
    pulseLights = null;
  }

  ctx.raycontrol.deactivateState('teleportSound');
  ctx.raycontrol.deactivateState('sound');
  clearTimeout(timeout);
}

export function execute(ctx, delta, time) {
  mixer.update(delta);
  const sound = sounds[soundNames[currentSound]];
  if (sound && sound.shadow.material.opacity > 0) {
    sound.shadow.material.opacity -= delta * 0.5;
  }
  doorMaterial.uniforms.time.value = time;

  if (door.scale.z > 0.5) {
    door.scale.z = Math.max(door.scale.z - delta * door.scale.z, 0.5);
  }

  // Animate floor glow - pulse with the beat
  if (floorGlow) {
    floorGlow.material.opacity = 0.1 + Math.sin(time * 2) * 0.05;
    floorGlow.rotation.z = time * 0.1;
  }

  // Animate pulse lights - flash with current sound
  if (pulseLights && currentSound >= 0) {
    const lightIndex = currentSound % pulseLights.length;
    pulseLights.forEach((light, i) => {
      if (i === lightIndex) {
        light.intensity = 0.8 + Math.sin(time * 8) * 0.4;
      } else {
        light.intensity = Math.max(0, light.intensity - delta * 2);
      }
    });
  }
}
