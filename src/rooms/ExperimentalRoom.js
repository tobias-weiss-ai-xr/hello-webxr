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
    case 'extreme_conditions':
      createExtremeConditions(ctx);
      break;
    case 'industrial_apps':
      createIndustrialApps(ctx);
      break;
    case 'historical_lab':
      createHistoricalLab(ctx);
      break;
    case 'space_chem':
      createSpaceChem(ctx);
      break;
    case 'nano_world':
      createNanoWorld(ctx);
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

function createExtremeConditions(ctx) {
  const pressureChamberGeo = new THREE.CylinderGeometry(2, 2, 4, 32);
  const chamberMat = new THREE.MeshBasicMaterial({
    color: 0xFFA94D,
    transparent: true,
    opacity: 0.3
  });
  const chamber = new THREE.Mesh(pressureChamberGeo, chamberMat);
  chamber.position.set(0, 2, 0);
  chamber.name = 'pressureChamber';
  scene.add(chamber);

  const plasmaGeo = new THREE.SphereGeometry(1.5, 32, 32);
  const plasmaMat = new THREE.MeshBasicMaterial({
    color: 0xFF6B35,
    transparent: true,
    opacity: 0.6
  });
  const plasma = new THREE.Mesh(plasmaGeo, plasmaMat);
  plasma.position.set(0, 2, 0);
  plasma.name = 'plasma';
  scene.add(plasma);

  const superfluidHeGeo = new THREE.TorusGeometry(1.8, 0.15, 16, 100);
  const heMat = new THREE.MeshBasicMaterial({
    color: 0x74B9FF,
    transparent: true,
    opacity: 0.5
  });
  const superfluidHe = new THREE.Mesh(superfluidHeGeo, heMat);
  superfluidHe.position.set(3, 2, 0);
  superfluidHe.rotation.x = Math.PI / 2;
  superfluidHe.name = 'superfluidHe';
  scene.add(superfluidHe);

  scene.userData.plasma = plasma;
  scene.userData.superfluidHe = superfluidHe;
}

function createIndustrialApps(ctx) {
  const blastFurnaceGeo = new THREE.CylinderGeometry(1.5, 2, 5, 8);
  const furnaceMat = new THREE.MeshBasicMaterial({
    color: 0x74B9FF,
    transparent: true,
    opacity: 0.6
  });
  const furnace = new THREE.Mesh(blastFurnaceGeo, furnaceMat);
  furnace.position.set(0, 2.5, 0);
  scene.add(furnace);

  const pipelineGeo = new THREE.CylinderGeometry(0.3, 0.3, 8, 16);
  const pipeMat = new THREE.MeshBasicMaterial({color: 0x4a4a4a});
  for (let i = 0; i < 4; i++) {
    const pipe = new THREE.Mesh(pipelineGeo, pipeMat);
    pipe.position.set(-3 + i * 2, 1, 3);
    pipe.rotation.z = Math.PI / 2;
    scene.add(pipe);
  }

  const reactorGeo = new THREE.BoxGeometry(3, 4, 3);
  const reactorMat = new THREE.MeshBasicMaterial({
    color: 0x20C997,
    transparent: true,
    opacity: 0.5
  });
  const reactor = new THREE.Mesh(reactorGeo, reactorMat);
  reactor.position.set(0, 2, -4);
  scene.add(reactor);
}

function createHistoricalLab(ctx) {
  const antiqueTableGeo = new THREE.BoxGeometry(4, 1, 2);
  const tableMat = new THREE.MeshBasicMaterial({color: 0x8B4513});
  const table = new THREE.Mesh(antiqueTableGeo, tableMat);
  table.position.set(0, 0.5, 0);
  scene.add(table);

  const crucibleGeo = new THREE.ConeGeometry(0.3, 0.5, 32);
  const crucibleMat = new THREE.MeshBasicMaterial({
    color: 0xD63384,
    transparent: true,
    opacity: 0.8
  });
  const crucible = new THREE.Mesh(crucibleGeo, crucibleMat);
  crucible.position.set(1, 1, 0);
  scene.add(crucible);

  const parchmentGeo = new THREE.PlaneGeometry(1.5, 1);
  const parchmentMat = new THREE.MeshBasicMaterial({
    color: 0xF5DEB3,
    side: THREE.DoubleSide
  });
  const parchment = new THREE.Mesh(parchmentGeo, parchmentMat);
  parchment.position.set(-1, 1.1, 0);
  parchment.rotation.y = -Math.PI / 4;
  scene.add(parchment);

  const alchemySymbolGeo = new THREE.RingGeometry(0.8, 1, 32);
  const symbolMat = new THREE.MeshBasicMaterial({
    color: 0xFFD700,
    side: THREE.DoubleSide
  });
  const symbol = new THREE.Mesh(alchemySymbolGeo, symbolMat);
  symbol.position.set(0, 3, 0);
  symbol.name = 'alchemySymbol';
  scene.add(symbol);
  scene.userData.alchemySymbol = symbol;
}

function createSpaceChem(ctx) {
  const starsGeo = new THREE.BufferGeometry();
  const starsCount = 1000;
  const positions = new Float32Array(starsCount * 3);
  for (let i = 0; i < starsCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 50;
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starsMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1
  });
  const stars = new THREE.Points(starsGeo, starsMat);
  stars.name = 'starField';
  scene.add(stars);
  scene.userData.stars = stars;

  const nebulaGeo = new THREE.SphereGeometry(8, 32, 32);
  const nebulaMat = new THREE.MeshBasicMaterial({
    color: 0x6C5CE7,
    transparent: true,
    opacity: 0.15
  });
  const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
  nebula.position.set(0, 2, -10);
  scene.add(nebula);

  const fragmentGeo = new THREE.IcosahedronGeometry(1, 1);
  const fragmentMat = new THREE.MeshBasicMaterial({
    color: 0xE17055,
    wireframe: true
  });
  for (let i = 0; i < 5; i++) {
    const fragment = new THREE.Mesh(fragmentGeo, fragmentMat);
    fragment.position.set(
      (Math.random() - 0.5) * 6,
      2 + Math.random() * 2,
      (Math.random() - 0.5) * 6
    );
    fragment.userData.orbitSpeed = 0.2 + Math.random() * 0.3;
    fragment.userData.orbitAngle = Math.random() * Math.PI * 2;
    fragment.name = 'fragment';
    scene.add(fragment);
  }
}

function createNanoWorld(ctx) {
  const latticeGroup = new THREE.Group();

  const atomGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const atomMat = new THREE.MeshBasicMaterial({color: 0x17A2B8});

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        const atom = new THREE.Mesh(atomGeo, atomMat);
        atom.position.set(i - 1, j + 1, k - 1);
        latticeGroup.add(atom);
      }
    }
  }

  const bondGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
  const bondMat = new THREE.MeshBasicMaterial({color: 0x0A0A1A});

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        if (i < 2) {
          const bondH = new THREE.Mesh(bondGeo, bondMat);
          bondH.rotation.z = Math.PI / 2;
          bondH.position.set(i - 0.5, j + 1, k - 1);
          latticeGroup.add(bondH);
        }
        if (j < 2) {
          const bondV = new THREE.Mesh(bondGeo, bondMat);
          bondV.position.set(i - 1, j + 1.5, k - 1);
          latticeGroup.add(bondV);
        }
        if (k < 2) {
          const bondD = new THREE.Mesh(bondGeo, bondMat);
          bondD.rotation.x = Math.PI / 2;
          bondD.position.set(i - 1, j + 1, k - 0.5);
          latticeGroup.add(bondD);
        }
      }
    }
  }

  latticeGroup.position.set(0, 2, 0);
  latticeGroup.scale.set(1.5, 1.5, 1.5);
  latticeGroup.name = 'nanoLattice';
  scene.add(latticeGroup);
  scene.userData.nanoLattice = latticeGroup;

  const orbitalGeo = new THREE.TorusGeometry(2.5, 0.05, 16, 100);
  const orbitalMat = new THREE.MeshBasicMaterial({
    color: 0x74B9FF,
    transparent: true,
    opacity: 0.4
  });
  const orbitalX = new THREE.Mesh(orbitalGeo, orbitalMat);
  orbitalX.position.set(0, 2, 0);
  scene.add(orbitalX);

  const orbitalY = orbitalX.clone();
  orbitalY.rotation.x = Math.PI / 2;
  scene.add(orbitalY);

  const orbitalZ = orbitalX.clone();
  orbitalZ.rotation.y = Math.PI / 2;
  scene.add(orbitalZ);
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
  const floorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(themeColor).multiplyScalar(0.08),
    metalness: 0.2,
    roughness: 0.8
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.1;
  scene.add(floor);

  // Add decorative floor ring
  const ringGeo = new THREE.RingGeometry(11.5, 12, 64);
  const ringMat = new THREE.MeshBasicMaterial({ 
    color: themeColor, 
    transparent: true, 
    opacity: 0.25,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  scene.add(ring);
  scene.userData.floorRing = ring;
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
  // Ambient light for base illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambientLight);

  // Hemisphere light for natural feel
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1a1a1a, 0.1);
  scene.add(hemiLight);

  // Main accent lights
  const pointLight1 = new THREE.PointLight(themeColor, 0.8, 25);
  pointLight1.position.set(5, 8, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(themeColor, 0.8, 25);
  pointLight2.position.set(-5, 8, -5);
  scene.add(pointLight2);

  // Top down light
  const topLight = new THREE.PointLight(0xffffff, 0.4, 15);
  topLight.position.set(0, 10, 0);
  scene.add(topLight);

  // Rim lights for dramatic effect
  const rimLight1 = new THREE.PointLight(0xffffff, 0.2, 15);
  rimLight1.position.set(0, 3, 10);
  scene.add(rimLight1);

  const rimLight2 = new THREE.PointLight(0xffffff, 0.2, 15);
  rimLight2.position.set(0, 3, -10);
  scene.add(rimLight2);
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

  if (scene.userData.plasma) {
    scene.userData.plasma.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
    scene.userData.plasma.material.opacity = 0.5 + Math.sin(time * 8) * 0.1;
  }

  if (scene.userData.superfluidHe) {
    scene.userData.superfluidHe.rotation.z += delta * 2;
    scene.userData.superfluidHe.rotation.x = Math.PI / 2 + Math.sin(time * 0.5) * 0.2;
  }

  if (scene.userData.alchemySymbol) {
    scene.userData.alchemySymbol.rotation.z += delta * 0.3;
    scene.userData.alchemySymbol.material.opacity = 0.7 + Math.sin(time * 2) * 0.3;
  }

  if (scene.userData.stars) {
    scene.userData.stars.rotation.y += delta * 0.1;
  }

  // Animate floor ring
  if (scene.userData.floorRing) {
    scene.userData.floorRing.material.opacity = 0.2 + Math.sin(time * 1.5) * 0.1;
  }

  scene.children.forEach(child => {
    if (child.userData.orbitSpeed !== undefined) {
      child.userData.orbitAngle += delta * child.userData.orbitSpeed;
      child.position.x = Math.cos(child.userData.orbitAngle) * 3;
      child.position.z = Math.sin(child.userData.orbitAngle) * 3;
    }
  });

  if (scene.userData.nanoLattice) {
    scene.userData.nanoLattice.rotation.y += delta * 0.5;
    scene.userData.nanoLattice.rotation.x = Math.sin(time * 0.5) * 0.1;
  }
}
