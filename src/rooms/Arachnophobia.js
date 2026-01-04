import * as THREE from 'three';

var scene, doorMaterial, door;

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

  scene = new THREE.Object3D();

  const floorTexture = assets['grid_tex'];
  const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
    new THREE.MeshBasicMaterial({map: floorTexture})
  );
  scene.add(floor);
  floor.rotation.x = -Math.PI / 2;

  const spiderMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
  const spiderBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 8),
    spiderMaterial
  );
  spiderBody.position.set(0, 0.3, -2);
  scene.add(spiderBody);

  const spiderHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 8),
    spiderMaterial
  );
  spiderHead.position.set(0, 0.5, -2.2);
  scene.add(spiderHead);

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const legMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
    const leg1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.8),
      legMaterial
    );
    const leg2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.6),
      legMaterial
    );

    const legX = Math.cos(angle) * 0.4;
    const legZ = Math.sin(angle) * 0.4;

    leg1.position.set(legX, 0.3, -2 + legZ);
    leg1.rotation.x = angle > Math.PI / 2 && angle < Math.PI * 1.5 ? 0.3 : -0.3;
    leg1.rotation.z = angle + Math.PI / 2;
    scene.add(leg1);

    leg2.position.set(legX + Math.cos(angle) * 0.6, 0.15, -2 + legZ + Math.sin(angle) * 0.6);
    leg2.rotation.x = angle > Math.PI / 2 && angle < Math.PI * 1.5 ? 0.5 : -0.5;
    leg2.rotation.z = angle + Math.PI / 2;
    scene.add(leg2);
  }

  doorMaterial = createDoorMaterial(ctx);
  door = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 2), doorMaterial);
  door.position.set(0, 1, 3);
  scene.add(door);

  ctx.raycontrol.addState('doorArachnophobia', {
    colliderMesh: door,
    onHover: (intersection, active) => {
      const scale = intersection.object.scale;
      scale.z = Math.min(scale.z + 0.02 * (2 - door.scale.z), 0.8);
    },
    onHoverLeave: () => {},
    onSelectStart: (intersection, e) => {
      ctx.goto = 0;
    },
    onSelectEnd: (intersection) => {}
  });

  ctx.raycontrol.addState('teleportArachnophobia', {
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

export function enter(ctx) {
  ctx.renderer.setClearColor(0x1a0a1a);
  ctx.scene.add(scene);
  ctx.scene.parent.fog = new THREE.FogExp2(0x1a0a1a, 0.1);

  ctx.raycontrol.activateState('teleportArachnophobia');
  ctx.raycontrol.activateState('doorArachnophobia');
}

export function exit(ctx) {
  ctx.scene.remove(scene);
  ctx.scene.parent.fog = null;

  ctx.raycontrol.deactivateState('teleportArachnophobia');
  ctx.raycontrol.deactivateState('doorArachnophobia');
}

export function execute(ctx, delta, time) {
  doorMaterial.uniforms.time.value = time;

  if (door.scale.z > 0.2) {
    door.scale.z = Math.max(door.scale.z - delta * door.scale.z, 0.2);
  }
}
