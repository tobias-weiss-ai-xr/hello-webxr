import * as THREE from 'three';
var scene, doorMaterial, door, spider;

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
  scene = new THREE.Scene();

  // Add a platform/floor for the spider
  const floorGeo = new THREE.CylinderGeometry(2, 2, 0.1, 32);
  const floorMat = new THREE.MeshBasicMaterial({color: 0x333333});
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.05;
  scene.add(floor);

  // Load and setup spider model
  spider = assets['spider_model'].scene;
  spider.position.y = 0;
  spider.scale.set(0.5, 0.5, 0.5);

  // Apply materials to spider if available
  if (assets['spider_tex']) {
    spider.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          map: assets['spider_tex'],
          side: THREE.DoubleSide
        });
      }
    });
  }

  scene.add(spider);

  // Add door
  doorMaterial = createDoorMaterial(ctx);
  const doorGeo = new THREE.BoxGeometry(1.2, 2.2, 0.1);
  door = new THREE.Mesh(doorGeo, doorMaterial);
  door.position.set(0, 1.1, -3);
  scene.add(door);

  // Add door frame
  const frameGeo = new THREE.BoxGeometry(1.4, 2.4, 0.08);
  const frameMat = new THREE.MeshBasicMaterial({color: 0x444444});
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 1.1, -3.06);
  scene.add(frame);

  // Add teleport plane
  const teleportGeo = new THREE.PlaneBufferGeometry(10, 10);
  const teleportMat = new THREE.MeshBasicMaterial({visible: false});
  const teleport = new THREE.Mesh(teleportGeo, teleportMat);
  teleport.rotation.x = -Math.PI / 2;
  teleport.position.y = 0.001;
  scene.add(teleport);

  // Add door interaction state
  ctx.raycontrol.addState('doorSpider', {
    colliderMesh: door,
    onHover: (intersection, active) => {
      const scale = door.scale;
      scale.z = Math.min(scale.z + 0.05 * (2 - door.scale.z), 1.5);
    },
    onHoverLeave: () => {},
    onSelectStart: (intersection, e) => {
      ctx.goto = 0;
    },
    onSelectEnd: (intersection) => {}
  });

  // Add teleport interaction state
  ctx.raycontrol.addState('teleportSpider', {
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
  ctx.renderer.setClearColor(0x1a1a1a);
  ctx.scene.add(scene);
  ctx.raycontrol.activateState('doorSpider');
  ctx.raycontrol.activateState('teleportSpider');
}

export function exit(ctx) {
  ctx.raycontrol.deactivateState('doorSpider');
  ctx.raycontrol.deactivateState('teleportSpider');
  ctx.scene.remove(scene);
}

export function execute(ctx, delta, time) {
  doorMaterial.uniforms.time.value = time;

  // Animate spider - slow rotation
  if (spider) {
    spider.rotation.y += delta * 0.3;

    // Subtle bobbing animation
    spider.position.y = Math.sin(time * 2) * 0.05;
  }

  if (door.scale.z > 0.5) {
    door.scale.z = Math.max(door.scale.z - delta * door.scale.z, 0.5);
  }
}
