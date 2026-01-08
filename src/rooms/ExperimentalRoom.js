import * as THREE from 'three';
import { Text, Position, ParentObject3D, Object3D, Children } from '../components/index.js';
import { EXPERIMENTAL_ROOMS } from '../data/elements.js';
import { loadMoleculeModel, createCrystalLattice, optimizeModelForVR } from '../lib/modelLoader.js';

var scene;
var roomData;
var experimentStations = [];
var teleportFloor;

const ROOM_COLORS = {
  reaction_lab: 0xFF6B6B,
  nuclear_chamber: 0x4A69BD,
  electrochem_lab: 0x74B9FF,
  organic_chem: 0x20C997,
  extreme_conditions: 0xFFA94D,
  industrial_apps: 0x74B9FF,
  historical_lab: 0xD63384,
  space_chem: 0x0A0A1A,
  nano_world: 0x17A2B8,
  challenge_arena: 0xFFC107
};

export function setup(ctx, roomId) {
  roomData = EXPERIMENTAL_ROOMS[roomId];
  if (!roomData) return;

  scene = new THREE.Scene();

  const themeColor = ROOM_COLORS[roomData.id] || 0x2a2a3a;
  const bgColor = new THREE.Color(themeColor).multiplyScalar(0.1);
  scene.background = bgColor;

  createRoomSpecificSetup(ctx, roomData.id);
  createFloor(ctx, themeColor);
  createExperimentStations(ctx, roomData);
  setupLighting(ctx, themeColor);
  createTeleportZone(ctx);
  createNavigationPanel(ctx);

  scene.userData.teleport = teleportFloor;
}

function createRoomSpecificSetup(ctx, roomId) {
  switch(roomId) {
    case 'reaction_lab':
      createAlchemistWorkshop(ctx);
      break;
    case 'nuclear_chamber':
      createNuclearControlRoom(ctx);
      break;
    case 'electrochem_lab':
      createElectrochemLab(ctx);
      break;
    case 'organic_chem':
      createCarbonUniverse(ctx);
      break;
    case 'challenge_arena':
      createChallengeArena(ctx);
      break;
    default:
      createGenericLab(ctx);
      break;
  }
}

function createAlchemistWorkshop(ctx) {
  const tableGeo = new THREE.BoxGeometry(4, 1, 2);
  const tableMat = new THREE.MeshBasicMaterial({color: 0x4a4a4a});
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.position.set(0, 0.5, 0);
  scene.add(table);

  createMoleculeDisplay(ctx, 'H2O', {x: 1.2, y: 1.5, z: 0});

  const bunsenGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.8, 16);
  const bunsenMat = new THREE.MeshBasicMaterial({color: 0x2a2a3a});
  const bunsen = new THREE.Mesh(bunsenGeo, bunsenMat);
  bunsen.position.set(-1.2, 1.3, -0.5);
  scene.add(bunsen);

  const flameGeo = new THREE.ConeGeometry(0.08, 0.3, 16);
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x4a90e2,
    transparent: true,
    opacity: 0.7
  });
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.position.set(-1.2, 1.8, -0.5);
  flame.name = 'flame';
  scene.add(flame);

  scene.userData.flame = flame;
}

function createNuclearControlRoom(ctx) {
  const panelGeo = new THREE.BoxGeometry(6, 2, 0.2);
  const panelMat = new THREE.MeshBasicMaterial({
    color: 0x1a1a2a,
    transparent: true,
    opacity: 0.9
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, 2.5, -4);
  panel.lookAt(0, 2.5, 0);
  scene.add(panel);

  const coreGeo = new THREE.CylinderGeometry(1.5, 1.5, 4, 32);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x4A69BD,
    transparent: true,
    opacity: 0.5
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0, 2, 0);
  core.name = 'reactorCore';
  scene.add(core);

  scene.userData.core = core;
}

function createElectrochemLab(ctx) {
  const batteryGeo = new THREE.BoxGeometry(2, 1.5, 0.8);
  const batteryMat = new THREE.MeshBasicMaterial({color: 0x74B9FF});
  const battery = new THREE.Mesh(batteryGeo, batteryMat);
  battery.position.set(0, 0.75, -2);
  scene.add(battery);

  const terminalGeo = new THREE.BoxGeometry(3, 2, 0.1);
  const terminalMat = new THREE.MeshBasicMaterial({color: 0x2a2a3a});
  const terminal = new THREE.Mesh(terminalGeo, terminalMat);
  terminal.position.set(0, 1, -4);
  scene.add(terminal);
}

function createCarbonUniverse(ctx) {
  loadMoleculeModel('DNA', EXPERIMENTAL_ROOMS, (model, error) => {
    if (!error) {
      const optimized = optimizeModelForVR(model);
      optimized.scale.set(1.5, 1.5, 1.5);
      optimized.position.set(0, 2.5, 0);
      optimized.name = 'dna_molecule';
      scene.add(optimized);
      scene.userData.dnaModel = optimized;
    }
  });

  const helixGroup = new THREE.Group();
  const points = [];
  for (let i = 0; i < 100; i++) {
    const t = i / 100;
    const angle = t * Math.PI * 2 * 3;
    const y = (t - 0.5) * 2;
    const x = Math.cos(angle) * 0.3;
    const z = Math.sin(angle) * 0.3;
    points.push(new THREE.Vector3(x, y + 2, z));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.1, 8, false);
  const tubeMat = new THREE.MeshBasicMaterial({color: 0x20C997});
  const helix = new THREE.Mesh(tubeGeo, tubeMat);
  helix.position.set(0, 2, 0);
  helix.name = 'helix_placeholder';
  scene.add(helix);
}

function createMoleculeDisplay(ctx, formula, position = {x: 0, y: 2, z: 0}) {
  loadMoleculeModel(formula, EXPERIMENTAL_ROOMS, (model, error) => {
    if (!error) {
      const optimized = optimizeModelForVR(model);
      optimized.position.set(position.x, position.y, position.z);
      optimized.userData.moleculeFormula = formula;
      scene.add(optimized);
      scene.userData.moleculeDisplay = optimized;
    } else {
      const fallback = createMoleculeModel(formula, EXPERIMENTAL_ROOMS);
      fallback.position.set(position.x, position.y, position.z);
      scene.add(fallback);
    }
  });
}

function createCompoundDisplay(ctx, compoundName, position = {x: 0, y: 2, z: 0}) {
  const compoundMap = {
    'reaction_lab': {formula: 'H2O', name: 'water'},
    'electrochem_lab': {formula: 'NaCl', name: 'salt'},
    'nuclear_chamber': {formula: 'UO2', name: 'uranium_oxide'},
    'organic_chem': {formula: 'C6H12O6', name: 'glucose'},
    'extreme_conditions': {formula: 'CO2', name: 'carbon_dioxide'},
    'industrial_apps': {formula: 'Fe', name: 'steel'},
    'historical_lab': {formula: 'Au', name: 'gold'},
    'space_chem': {formula: 'He', name: 'helium'},
    'nano_world': {formula: 'Si', name: 'silicon'},
    'challenge_arena': {formula: 'C', name: 'diamond'}
  };

  const compound = compoundMap[roomData.id];
  if (compound) {
    const lattice = createCrystalLattice({symbol: compound.name, color: 0x888888});
    lattice.position.set(position.x, position.y, position.z);
    scene.add(lattice);
    scene.userData.compoundDisplay = lattice;
  }
}

function createChallengeArena(ctx) {
  const arenaFloor = new THREE.CylinderGeometry(8, 8, 0.2, 32);
  const arenaMat = new THREE.MeshBasicMaterial({color: 0xFFC107});
  const arena = new THREE.Mesh(arenaFloor, arenaMat);
  arena.position.y = -0.05;
  scene.add(arena);

  const podiumGeo = new THREE.BoxGeometry(2, 0.5, 2);
  const podiumMat = new THREE.MeshBasicMaterial({color: 0xD4AF37});
  const podium = new THREE.Mesh(podiumGeo, podiumMat);
  podium.position.set(0, 0.25, 0);
  scene.add(podium);

  const trophyGeo = new THREE.ConeGeometry(0.3, 1, 8);
  const trophyMat = new THREE.MeshBasicMaterial({color: 0xFFD700});
  const trophy = new THREE.Mesh(trophyGeo, trophyMat);
  trophy.position.set(0, 1.5, 0);
  scene.add(trophy);
}

function createGenericLab(ctx) {
  const benchGeo = new THREE.BoxGeometry(5, 1, 2.5);
  const benchMat = new THREE.MeshBasicMaterial({color: 0x3a3a4a});
  const bench = new THREE.Mesh(benchGeo, benchMat);
  bench.position.set(0, 0.5, 0);
  scene.add(bench);

  const equipmentGeo = new THREE.BoxGeometry(0.5, 1, 0.5);
  const equipmentMat = new THREE.MeshBasicMaterial({color: 0x4a4a4a});
  for (let i = 0; i < 4; i++) {
    const equipment = new THREE.Mesh(equipmentGeo, equipmentMat);
    equipment.position.set(-1.5 + i, 1, -0.5);
    scene.add(equipment);
  }
}

function createFloor(ctx, themeColor) {
  const floorGeo = new THREE.CylinderGeometry(12, 12, 0.2, 64);
  const floorMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(themeColor).multiplyScalar(0.08)
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.1;
  scene.add(floor);
}

function createExperimentStations(ctx, roomData) {
  const stationRadius = 5;
  const experiments = roomData.experiments || [];

  experiments.forEach((expId, index) => {
    const angle = (index / experiments.length) * Math.PI * 2;
    const x = Math.cos(angle) * stationRadius;
    const z = Math.sin(angle) * stationRadius;

    const stationGeo = new THREE.BoxGeometry(1.5, 2, 1);
    const stationMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(roomData.color).multiplyScalar(0.6),
      transparent: true,
      opacity: 0.7
    });
    const station = new THREE.Mesh(stationGeo, stationMat);
    station.position.set(x, 1, z);
    station.userData.experimentId = expId;

    const labelEntity = ctx.world.createEntity();
    labelEntity
      .addComponent(Text, {
        text: expId,
        color: '#ffffff',
        fontSize: 0.08,
        anchor: 'center',
        baseline: 'top',
        textAlign: 'center'
      })
      .addComponent(ParentObject3D, {value: station})
      .addComponent(Position, {x: 0, y: 1.1, z: 0.51});

    scene.add(station);
    experimentStations.push(station);
  });
}

function setupLighting(ctx, themeColor) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(themeColor, 0.6, 20);
  pointLight1.position.set(5, 8, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(themeColor, 0.6, 20);
  pointLight2.position.set(-5, 8, -5);
  scene.add(pointLight2);
}

function createTeleportZone(ctx) {
  const teleportGeo = new THREE.PlaneBufferGeometry(25, 25);
  const teleportMat = new THREE.MeshBasicMaterial({visible: false});
  teleportFloor = new THREE.Mesh(teleportGeo, teleportMat);
  teleportFloor.rotation.x = -Math.PI / 2;
  teleportFloor.position.y = 0.001;
  scene.add(teleportFloor);
}

function createNavigationPanel(ctx) {
  const panelGeo = new THREE.BoxGeometry(0.5, 0.3, 0.05);
  const panelMat = new THREE.MeshBasicMaterial({color: 0x2a2a3a});
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, 1.5, -6);
  scene.add(panel);

  const backBtnEntity = ctx.world.createEntity();
  backBtnEntity
    .addComponent(Text, {
      text: '◀ Lobby',
      color: '#ffffff',
      fontSize: 0.08,
      anchor: 'center',
      baseline: 'middle',
      textAlign: 'center'
    })
    .addComponent(ParentObject3D, {value: panel})
    .addComponent(Position, {x: 0, y: 0, z: 0.03});

  panel.userData.backButton = backBtnEntity;
}

export function enter(ctx) {
  ctx.scene.add(scene);
  ctx.renderer.setClearColor(scene.background);
  ctx.raycontrol.activateState('expRoomStations');
  ctx.raycontrol.activateState('expRoomTeleport');
  ctx.raycontrol.activateState('expRoomNav');

  ctx.raycontrol.addState('expRoomStations', {
    colliderMesh: experimentStations,
    controller: 'primary',
    onHover: (intersection, active) => {
      const station = intersection.object;
      station.scale.setScalar(active ? 1.2 : 1);
    },
    onHoverLeave: () => {},
    onSelectStart: (intersection, e) => {
      console.log('Experiment:', intersection.object.userData.experimentId);
    },
    onSelectEnd: (intersection) => {}
  });

  ctx.raycontrol.addState('expRoomTeleport', {
    colliderMesh: teleportFloor,
    controller: 'primary',
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

  ctx.raycontrol.addState('expRoomNav', {
    colliderMesh: [scene.children.find(c => c.userData.backButton)],
    controller: 'primary',
    onHover: (intersection, active) => {},
    onHoverLeave: () => {},
    onSelectStart: (intersection, e) => {
      ctx.goto = 0;
    },
    onSelectEnd: (intersection) => {}
  });
}

export function exit(ctx) {
  ctx.raycontrol.deactivateState('expRoomStations');
  ctx.raycontrol.deactivateState('expRoomTeleport');
  ctx.raycontrol.deactivateState('expRoomNav');
  ctx.scene.remove(scene);
}

export function execute(ctx, delta, time) {
  if (scene.userData.flame) {
    scene.userData.flame.scale.y = 1 + Math.sin(time * 10) * 0.2;
    scene.userData.flame.material.opacity = 0.5 + Math.sin(time * 10) * 0.2;
  }

  if (scene.userData.core) {
    scene.userData.core.rotation.y += delta * 0.5;
    scene.userData.core.material.opacity = 0.4 + Math.sin(time * 2) * 0.1;
  }
}
