import * as THREE from 'three';
import { Text, Position, ParentObject3D, Object3D, Children } from '../components/index.js';
import { ELEMENTS, GROUP_COLORS } from '../data/elements.js';
import { AudioManager } from '../lib/AudioManager.js';
import { createElementDisplay } from '../lib/modelLoader.js';

console.log('[ElementRoom] Module loaded, ELEMENTS:', typeof ELEMENTS, 'has ELEMENTS:', 'ELEMENTS' in {ELEMENTS, GROUP_COLORS});

var scene;
var elementData;
var atomModel;
var infoPanelMesh;
var experimentStations = [];
var audioManager;
var setupCalled = false;

export async function setup(ctx, elementSymbol) {
  console.log('[ElementRoom] setup called for:', elementSymbol);
  console.log('[ElementRoom] ELEMENTS available:', typeof ELEMENTS, 'length:', ELEMENTS ? ELEMENTS.length : 'N/A');
  elementData = ELEMENTS.find(e => e.symbol === elementSymbol);
  console.log('[ElementRoom] elementData found:', !!elementData, elementData);
  if (!elementData) {
    console.error('[ElementRoom] Element not found:', elementSymbol);
    return;
  }

  scene = new THREE.Scene();
  console.log('[ElementRoom] Scene created:', scene);

  const themeColor = elementData.color;
  const bgColor = new THREE.Color(themeColor).multiplyScalar(0.15);
  scene.background = bgColor;

  createFloor(ctx, themeColor);
  createAtomModel(ctx, elementData);
  createInfoPanel(ctx, elementData);
  createExperimentStations(ctx, elementData);
  setupLighting(ctx, themeColor);
  createTeleportZone(ctx);

  audioManager = new AudioManager(ctx);
  await audioManager.init();

  scene.userData.teleportZone = teleportFloorMesh;
  scene.userData.atomModel = atomModel;
  scene.userData.elementData = elementData;

  setupCalled = true;
  console.log('[ElementRoom] Setup complete for:', elementSymbol);
}

function createFloor(ctx, themeColor) {
  const floorGeo = new THREE.CylinderGeometry(10, 10, 0.2, 64);
  const floorMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(themeColor).multiplyScalar(0.1)
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.1;
  scene.add(floor);
}

function createAtomModel(ctx, element) {
  atomModel = createElementDisplay(element, element.theme || 'standard');
  atomModel.position.y = 2;
  atomModel.scale.set(1.5, 1.5, 1.5);

  const nucleusGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const nucleusMat = new THREE.MeshStandardMaterial({
    color: element.color,
    metalness: 0.5,
    roughness: 0.5,
    emissive: element.color,
    emissiveIntensity: 0.2
  });
  const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
  nucleusMesh.position.set(0, 0, 0);
  nucleusMesh.userData.nucleus = true;
  atomModel.add(nucleusMesh);

  const electronCount = element.atomicNumber;
  const shells = [2, 8, 18, 32, 50, 72];
  let electronsPlaced = 0;
  let shellRadius = 1.0;

  while (electronsPlaced < electronCount) {
    const maxInShell = shells[Math.min(Math.floor(shellRadius / 1.0), shells.length - 1)];
    const electronsInShell = Math.min(maxInShell, electronCount - electronsPlaced);

    const shellGeo = new THREE.TorusGeometry(shellRadius, 0.02, 16, 64);
    const shellMat = new THREE.MeshBasicMaterial({
      color: element.color,
      transparent: true,
      opacity: 0.2
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.rotation.x = Math.PI / 2;
    shell.userData.shell = true;
    atomModel.add(shell);

    for (let i = 0; i < electronsInShell; i++) {
      const angle = (i / electronsInShell) * Math.PI * 2;
      const electronGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const electronMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5
      });
      const electron = new THREE.Mesh(electronGeo, electronMat);

      electron.position.x = Math.cos(angle) * shellRadius;
      electron.position.z = Math.sin(angle) * shellRadius;
      electron.userData = {
        angle: angle,
        shellRadius: shellRadius,
        speed: 1.5 + Math.random() * 0.5,
        electron: true
      };

      atomModel.add(electron);
    }

    electronsPlaced += electronsInShell;
    shellRadius += 0.5;
  }

  scene.add(atomModel);
}

function createInfoPanel(ctx, element) {
  console.log('[ElementRoom] createInfoPanel called, ctx.world:', !!ctx.world);
  if (!ctx.world) {
    console.error('[ElementRoom] ctx.world is not available!');
    return;
  }

  const panelGeo = new THREE.BoxGeometry(3, 4, 0.1);
  const panelMat = new THREE.MeshBasicMaterial({
    color: 0x2a2a3a,
    transparent: true,
    opacity: 0.9
  });
  infoPanelMesh = new THREE.Mesh(panelGeo, panelMat);
  infoPanelMesh.position.set(-4, 2, 0);
  infoPanelMesh.lookAt(0, 2, 0);
  scene.add(infoPanelMesh);

  const titleGeo = new THREE.PlaneGeometry(2.6, 0.5);
  const titleMat = new THREE.MeshBasicMaterial({color: element.color});
  const titlePlate = new THREE.Mesh(titleGeo, titleMat);
  titlePlate.position.set(0, 1.5, 0.06);
  titlePlate.name = 'titlePlate';
  infoPanelMesh.add(titlePlate);

  const descGeo = new THREE.PlaneGeometry(2.6, 2.8);
  const descMat = new THREE.MeshBasicMaterial({color: 0x1a1a2a});
  const descPlate = new THREE.Mesh(descGeo, descMat);
  descPlate.position.set(0, -0.3, 0.06);
  descPlate.name = 'descPlate';
  infoPanelMesh.add(descPlate);

  console.log('[ElementRoom] Creating title text entity');
  const titleTextEntity = ctx.world.createEntity();
  titleTextEntity
    .addComponent(Text, {
      text: `${element.symbol} - ${element.name}\nGruppe: ${element.group}\nPeriode: ${element.period}\nBlock: ${element.block}\nGruppe: ${element.groupNumber}`,
      color: '#ffffff',
      fontSize: 0.1,
      anchor: 'center',
      baseline: 'middle',
      textAlign: 'center'
    })
    .addComponent(ParentObject3D, {value: titlePlate})
    .addComponent(Position, {x: 0, y: 0, z: 0.01});
  
  console.log('[ElementRoom] Creating desc text entity');
  const descTextEntity = ctx.world.createEntity();
  descTextEntity
    .addComponent(Text, {
      text: `Ordnungszahl: ${element.atomicNumber}\nAtommasse: ${element.mass}\nGruppe: ${element.group}\nPeriode: ${element.period}\nBlock: ${element.block}\nGruppe: ${element.groupNumber}\nTheme: ${element.theme}\n\n${element.description}`,
      color: '#cccccc',
      fontSize: 0.05,
      anchor: 'center',
      baseline: 'top',
      textAlign: 'center',
      maxWidth: 2.4,
      lineHeight: 1.4
    })
    .addComponent(ParentObject3D, {value: descPlate})
    .addComponent(Position, {x: 0, y: 1.2, z: 0.01});

  infoPanelMesh.userData.textEntities = [titleTextEntity, descTextEntity];
  console.log('[ElementRoom] Text entities created:', infoPanelMesh.userData.textEntities.length);
}

function createExperimentStations(ctx, element) {
  const stationRadius = 6;
  const experiments = element.experiments || [];

  experiments.forEach((expId, index) => {
    const angle = (index / Math.max(experiments.length, 1)) * Math.PI * 2;
    const x = Math.cos(angle) * stationRadius;
    const z = Math.sin(angle) * stationRadius;

    const stationGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
    const stationMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(element.color).multiplyScalar(0.8),
      transparent: true,
      opacity: 0.6
    });
    const station = new THREE.Mesh(stationGeo, stationMat);
    station.position.set(x, 0.25, z);
    station.userData.experimentId = expId;
    station.userData.element = element;

    const iconGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const iconMat = new THREE.MeshBasicMaterial({color: 0xffffff});
    const icon = new THREE.Mesh(iconGeo, iconMat);
    icon.position.set(0, 0.6, 0);
    station.add(icon);

    scene.add(station);
    experimentStations.push(station);
  });
}

function setupLighting(ctx, themeColor) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(themeColor, 0.8, 15);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(themeColor, 0.8, 15);
  pointLight2.position.set(-5, 5, -5);
  scene.add(pointLight2);
}

var teleportFloorMesh;

function createTeleportZone(ctx) {
  const teleportGeo = new THREE.PlaneBufferGeometry(20, 20);
  const teleportMat = new THREE.MeshBasicMaterial({visible: false});
  teleportFloorMesh = new THREE.Mesh(teleportGeo, teleportMat);
  teleportFloorMesh.rotation.x = -Math.PI / 2;
  teleportFloorMesh.position.y = 0.001;
  scene.add(teleportFloorMesh);
}

export function enter(ctx) {
  console.log('[ElementRoom] enter called, setupCalled:', setupCalled, 'scene:', !!scene);
  if (!scene) {
    console.error('[ElementRoom] Scene is undefined, skipping enter');
    return;
  }
  if (!setupCalled) {
    console.error('[ElementRoom] Setup was not called before enter!');
    return;
  }
  ctx.scene.add(scene);
  ctx.renderer.setClearColor(scene.background);
  ctx.raycontrol.activateState('elementExperiments');
  ctx.raycontrol.activateState('elementTeleport');
  ctx.raycontrol.activateState('elementInfoPanel');

  ctx.raycontrol.addState('elementExperiments', {
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

  ctx.raycontrol.addState('elementInfoPanel', {
    colliderMesh: [infoPanelMesh],
    controller: 'primary',
    onHover: (intersection, active) => {},
    onHoverLeave: () => {},
    onSelectStart: (intersection, e) => {
      const panel = intersection.object;
      const descComp = panel.userData.textEntities[1].getComponent(Text);
      descComp.fontSize = 0.07;
    },
    onSelectEnd: (intersection) => {
      const panel = intersection.object;
      const descComp = panel.userData.textEntities[1].getComponent(Text);
      descComp.fontSize = 0.05;
    }
  });

  ctx.raycontrol.addState('elementTeleport', {
    colliderMesh: teleportFloorMesh,
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
}

export function exit(ctx) {
  ctx.raycontrol.deactivateState('elementExperiments');
  ctx.raycontrol.deactivateState('elementTeleport');
  ctx.raycontrol.deactivateState('elementInfoPanel');
  ctx.scene.remove(scene);
}

var experimentInteractions = [];

function createExperimentInteractions(ctx, element) {
  const experiments = element.experiments || [];

  experiments.forEach(expId => {
    const interaction = {
      id: expId,
      type: getExperimentType(expId),
      setup: () => setupExperiment(ctx, expId, element),
      execute: (delta, time) => executeExperiment(ctx, expId, delta, time)
    };

    experimentInteractions.push(interaction);
  });

  scene.userData.experimentInteractions = experimentInteractions;
}

function getExperimentType(expId) {
  if (['water', 'flame'].includes(expId)) return 'reaction';
  if (['electric', 'magnetic'].includes(expId)) return 'electrical';
  if (['battery', 'galvanic'].includes(expId)) return 'electrochemical';
  if (['fusion', 'fission', 'decay'].includes(expId)) return 'nuclear';
  if (['protein', 'dna', 'polymer'].includes(expId)) return 'organic';
  if (['crystal', 'lattice'].includes(expId)) return 'crystal';
  return 'general';
}

function setupExperiment(ctx, expId, element) {
  const type = getExperimentType(expId);
  const station = experimentStations.find(s => s.userData.experimentId === expId);

  if (!station) return;

  switch(type) {
    case 'reaction':
      setupReactionExperiment(station, element, expId);
      break;
    case 'electrical':
      setupElectricalExperiment(station, element, expId);
      break;
    case 'electrochemical':
      setupElectrochemicalExperiment(station, element, expId);
      break;
    case 'nuclear':
      setupNuclearExperiment(station, element, expId);
      break;
    case 'organic':
      setupOrganicExperiment(station, element, expId);
      break;
    case 'crystal':
      setupCrystalExperiment(station, element, expId);
      break;
    default:
      setupGeneralExperiment(station, element, expId);
      break;
  }
}

function setupReactionExperiment(station, element, expId) {
  const isAlkali = ['alkali', 'alkalineEarth'].includes(element.group);

  if (expId === 'water' && isAlkali) {
    station.userData.waterLevel = 0;
    station.userData.reactionState = 'idle';

    const waterGeo = new THREE.CylinderGeometry(1, 1, 3, 32);
    const waterMat = new THREE.MeshBasicMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.5
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, 1.5, 0.8);
    water.name = 'water';
    station.add(water);

    station.userData.reactionMeshes = [water];
  }

  if (expId === 'flame' && isAlkali) {
    station.userData.flameIntensity = 0;
    station.userData.flameMeshes = [];

    for (let i = 0; i < 3; i++) {
      const flameGeo = new THREE.ConeGeometry(0.1, 0.5, 16);
      const flameMat = new THREE.MeshBasicMaterial({
        color: element.group === 'alkali' ? 0xFF6B6B : element.color,
        transparent: true,
        opacity: 0.7
      });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(-0.3 + i * 0.3, 0.5, 0);
      flame.name = `flame_${i}`;
      station.add(flame);
      station.userData.flameMeshes.push(flame);
    }
  }
}

function setupElectricalExperiment(station, element, expId) {
  if (expId === 'conductivity') {
    station.userData.conductivity = 0;
    station.userData.circuitActive = false;

    const wireGeo = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const wireMat = new THREE.MeshBasicMaterial({color: element.color});
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.set(0, 1.2, 0);
    wire.rotation.x = Math.PI / 2;
    station.add(wire);

    station.userData.electricalMeshes = [wire];
  }
}

function setupElectrochemicalExperiment(station, element, expId) {
  if (expId === 'battery') {
    station.userData.batteryLevel = 1.0;
    station.userData.dischargeRate = 0.001;

    const batteryGeo = new THREE.BoxGeometry(0.6, 1, 0.4);
    const batteryMat = new THREE.MeshBasicMaterial({
      color: element.color,
      transparent: true,
      opacity: 0.8
    });
    const battery = new THREE.Mesh(batteryGeo, batteryMat);
    battery.position.set(0, 1.5, 0);
    battery.name = 'battery';
    station.add(battery);

    const chargeBarGeo = new THREE.BoxGeometry(0.5, 0.1, 0.05);
    const chargeBarMat = new THREE.MeshBasicMaterial({color: 0x00ff00});
    const chargeBar = new THREE.Mesh(chargeBarGeo, chargeBarMat);
    chargeBar.position.set(0, 2.1, 0);
    station.add(chargeBar);

    station.userData.batteryMeshes = [battery, chargeBar];
  }
}

function setupNuclearExperiment(station, element, expId) {
  if (expId === 'fission' && element.group === 'actinide') {
    station.userData.fissionActive = false;
    station.userData.particles = [];

    const coreGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x4A69BD,
      transparent: true,
      opacity: 0.8
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 1.8, 0);
    core.name = 'nucleus';
    station.add(core);

    station.userData.nuclearMeshes = [core];
  }
}

function setupOrganicExperiment(station, element, expId) {
  if (expId === 'dna') {
    station.userData.dnaRotating = true;
    station.userData.rotationSpeed = 0.5;

    const helixGroup = new THREE.Group();

    const points = [];
    for (let i = 0; i < 100; i++) {
      const t = i / 100;
      const angle = t * Math.PI * 2 * 3;
      const y = (t - 0.5) * 2;
      const x = Math.cos(angle) * 0.3;
      const z = Math.sin(angle) * 0.3;
      points.push(new THREE.Vector3(x, y + 1.2, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.1, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({color: element.color});
    const helix = new THREE.Mesh(tubeGeo, tubeMat);
    helixGroup.add(helix);
    helixGroup.position.set(0, 1.5, 0);
    helixGroup.name = 'dna';
    station.add(helixGroup);

    station.userData.organicMeshes = [helixGroup];
  }
}

function setupCrystalExperiment(station, element, expId) {
  if (expId === 'lattice') {
    station.userData.latticeAnimating = false;
    station.userData.highlightedAtom = null;

    const latticeGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5, 3, 3, 3);
    const latticeMat = new THREE.MeshBasicMaterial({
      color: element.color,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const lattice = new THREE.Mesh(latticeGeo, latticeMat);
    lattice.position.set(0, 1.5, 0);
    lattice.name = 'lattice';
    station.add(lattice);

    const atomGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const atomMat = new THREE.MeshBasicMaterial({color: 0xffffff});
    const atoms = [];

    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        for (let z = 0; z < 2; z++) {
          const atom = new THREE.Mesh(atomGeo, atomMat);
          atom.position.set((x - 0.5) * 0.7, (y - 0.5) * 0.7, (z - 0.5) * 0.7);
          atom.name = `atom_${x}_${y}_${z}`;
          atoms.push(atom);
          lattice.add(atom);
        }
      }
    }

    station.userData.crystalMeshes = [lattice, ...atoms];
  }
}

function setupGeneralExperiment(station, element, expId) {
  station.userData.experimentActive = false;
  station.userData.experimentProgress = 0;
}

function executeExperiment(ctx, expId, delta, time) {
  const type = getExperimentType(expId);

  switch(type) {
    case 'reaction':
      executeReactionExperiment(ctx, expId, delta, time);
      break;
    case 'electrical':
      executeElectricalExperiment(ctx, expId, delta, time);
      break;
    case 'electrochemical':
      executeElectrochemicalExperiment(ctx, expId, delta, time);
      break;
    case 'nuclear':
      executeNuclearExperiment(ctx, expId, delta, time);
      break;
    case 'organic':
      executeOrganicExperiment(ctx, expId, delta, time);
      break;
    case 'crystal':
      executeCrystalExperiment(ctx, expId, delta, time);
      break;
    default:
      executeGeneralExperiment(ctx, expId, delta, time);
      break;
  }
}

function executeReactionExperiment(ctx, expId, delta, time) {
  experimentStations.forEach(station => {
    if (station.userData.experimentId !== expId) return;

    if (expId === 'water' && station.userData.reactionState === 'active') {
      station.userData.reactionState = 'active';
      audioManager.playSound('water_sizzle', 1);
    }

    if (expId === 'flame' && station.userData.flameIntensity < 1) {
      station.userData.reactionState = 'active';
      audioManager.playSound('flame', 0.7);
    }
  });
}

function executeElectricalExperiment(ctx, expId, delta, time) {
  experimentStations.forEach(station => {
    if (station.userData.experimentId !== expId) return;

    if (expId === 'conductivity' && station.userData.circuitActive) {
      station.userData.conductivity += delta * 0.1;

      const wire = station.userData.electricalMeshes[0];
      if (station.userData.conductivity >= 1) {
        wire.material.color.setHex(0x00ff00);
      } else {
        wire.material.color.setHex(0xffffff);
      }
    }
  });
}

function executeElectrochemicalExperiment(ctx, expId, delta, time) {
  experimentStations.forEach(station => {
    if (station.userData.experimentId !== expId) return;

    if (expId === 'battery') {
      station.userData.batteryLevel -= station.userData.dischargeRate;

      if (station.userData.batteryLevel <= 0) {
        station.userData.batteryLevel = 0;
      }

      const chargeBar = station.userData.batteryMeshes[1];
      chargeBar.scale.x = station.userData.batteryLevel;
    }
  });
}

function executeNuclearExperiment(ctx, expId, delta, time) {
  experimentStations.forEach(station => {
    if (station.userData.experimentId !== expId || !station.userData.fissionActive) return;

    if (expId === 'fission') {
      const core = station.userData.nuclearMeshes[0];
      core.material.opacity = 0.5 + Math.sin(time * 5) * 0.3;
      core.rotation.y += delta * 2;
    }
  });
}

function executeOrganicExperiment(ctx, expId, delta, time) {
  experimentStations.forEach(station => {
    if (station.userData.experimentId !== expId) return;

    if (expId === 'dna') {
      const helixGroup = station.userData.organicMeshes[0];
      helixGroup.rotation.y += delta * station.userData.rotationSpeed;
    }
  });
}

function executeCrystalExperiment(ctx, expId, delta, time) {
  experimentStations.forEach(station => {
    if (station.userData.experimentId !== expId) return;

    if (expId === 'lattice' && !station.userData.latticeAnimating) return;

    const lattice = station.userData.crystalMeshes[0];
    lattice.rotation.y += delta * 0.3;
  });
}

function executeGeneralExperiment(ctx, expId, delta, time) {
}

export function execute(ctx, delta, time) {
  if (atomModel) {
    atomModel.children.forEach(child => {
      if (child.userData.electron) {
        const data = child.userData;
        data.angle += data.speed * delta;
        child.position.x = Math.cos(data.angle) * data.shellRadius;
        child.position.z = Math.sin(data.angle) * data.shellRadius;
      } else if (child.userData.nucleus) {
        child.rotation.y += delta * 0.3;
        const pulse = 1 + Math.sin(time * 2) * 0.05;
        child.scale.setScalar(pulse);
      } else if (child.userData.shell) {
        child.rotation.x = Math.PI / 2 + Math.sin(time + child.position.x * 5) * 0.05;
        child.rotation.z += delta * 0.1;
      }
    });

    if (atomModel.userData.themedDisplay) {
      atomModel.rotation.y += delta * 0.15;
    }
  }

  experimentInteractions.forEach(interaction => {
    interaction.execute(delta, time);
  });
}
