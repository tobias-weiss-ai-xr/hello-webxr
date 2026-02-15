import * as THREE from 'three';
import { Text, Position, ParentObject3D, Object3D, Children } from '../components/index.js';
import { ELEMENTS, EXPERIMENTAL_ROOMS, GROUP_COLORS, NOBLE_GAS_COLORS } from '../data/elements.js';

var scene, atomCore, electronOrbits = [];
var elementButtons = [], expButtons = [];
var periodicTableMesh;
var infoPanel, currentSelection = null;
var teleportFloor;
var starField;
var ambientParticles;

const ATOM_RADIUS = 0.8;
const ORBIT_RADIUS = 4;
const ELECTRON_SPEED = 0.5;
const STAR_COUNT = 500;
const PARTICLE_COUNT = 100;

export function setup(ctx) {
  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x0a0a1a);
  
  // Create starfield background
  createStarfield(ctx);
  createAmbientParticles(ctx);

  const floorGeo = new THREE.CylinderGeometry(15, 15, 0.2, 64);
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a2e,
    metalness: 0.3,
    roughness: 0.8
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.1;
  scene.add(floor);

  // Add floor glow ring
  const ringGeo = new THREE.RingGeometry(14.5, 15, 64);
  const ringMat = new THREE.MeshBasicMaterial({ 
    color: 0x4a90e2, 
    transparent: true, 
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  const glowRing = new THREE.Mesh(ringGeo, ringMat);
  glowRing.rotation.x = -Math.PI / 2;
  glowRing.position.y = 0.01;
  scene.add(glowRing);

  const teleportGeo = new THREE.PlaneBufferGeometry(30, 30);
  const teleportMat = new THREE.MeshBasicMaterial({visible: false});
  teleportFloor = new THREE.Mesh(teleportGeo, teleportMat);
  teleportFloor.rotation.x = -Math.PI / 2;
  teleportFloor.position.y = 0.001;
  scene.add(teleportFloor);

  createAtomNucleus(ctx);
  createElectronOrbits(ctx);
  createPeriodicTableHologram(ctx);
  createElementButtons(ctx);
  createExpRoomButtons(ctx);
  createInfoPanel(ctx);

  // Enhanced lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambientLight);

  const coreLight = new THREE.PointLight(0x4a90e2, 1.5, 15);
  coreLight.position.set(0, 2, 0);
  scene.add(coreLight);

  // Add hemisphere light for better ambient feel
  const hemiLight = new THREE.HemisphereLight(0x4a90e2, 0x1a1a2e, 0.3);
  scene.add(hemiLight);

  // Add accent lights
  const accentLight1 = new THREE.PointLight(0xFF6B6B, 0.5, 20);
  accentLight1.position.set(10, 3, 0);
  scene.add(accentLight1);

  const accentLight2 = new THREE.PointLight(0x50e3c2, 0.5, 20);
  accentLight2.position.set(-10, 3, 0);
  scene.add(accentLight2);

  scene.userData.teleport = teleportFloor;
  scene.userData.atomCore = atomCore;
  scene.userData.electronOrbits = electronOrbits;
  scene.userData.glowRing = glowRing;

  registerInteractions(ctx);
}

function createStarfield(ctx) {
  const starsGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(STAR_COUNT * 3);
  const starColors = new Float32Array(STAR_COUNT * 3);

  for (let i = 0; i < STAR_COUNT; i++) {
    const i3 = i * 3;
    const radius = 50 + Math.random() * 50;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starPositions[i3 + 2] = radius * Math.cos(phi);

    // Varied star colors (white, blue, yellow tints)
    const colorChoice = Math.random();
    if (colorChoice < 0.6) {
      starColors[i3] = 1; starColors[i3 + 1] = 1; starColors[i3 + 2] = 1;
    } else if (colorChoice < 0.8) {
      starColors[i3] = 0.8; starColors[i3 + 1] = 0.9; starColors[i3 + 2] = 1;
    } else {
      starColors[i3] = 1; starColors[i3 + 1] = 1; starColors[i3 + 2] = 0.8;
    }
  }

  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starsMaterial = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);
}

function createAmbientParticles(ctx) {
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const radius = 5 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    
    particlePositions[i3] = Math.cos(theta) * radius;
    particlePositions[i3 + 1] = 0.5 + Math.random() * 3;
    particlePositions[i3 + 2] = Math.sin(theta) * radius;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x4a90e2,
    transparent: true,
    opacity: 0.4
  });

  ambientParticles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(ambientParticles);
}

function createAtomNucleus(ctx) {
  const coreGroup = new THREE.Group();

  const coreGeo = new THREE.SphereGeometry(ATOM_RADIUS, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x4a90e2,
    transparent: true,
    opacity: 0.8
  });
  atomCore = new THREE.Mesh(coreGeo, coreMat);
  atomCore.position.y = 1.6;
  coreGroup.add(atomCore);

  const glowGeo = new THREE.SphereGeometry(ATOM_RADIUS * 1.5, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x4a90e2,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.y = 1.6;
  coreGroup.add(glow);

  scene.add(coreGroup);
}

function createElectronOrbits(ctx) {
  const orbitLevels = [1, 2, 3];
  const colors = [0xFF6B6B, 0x50e3c2, 0xf5a623];

  orbitLevels.forEach((level, i) => {
    const radius = ORBIT_RADIUS + (level * 1.5);
    const orbitGeo = new THREE.TorusGeometry(radius, 0.02, 16, 100);
    const orbitMat = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
      transparent: true,
      opacity: 0.5
    });
    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
    orbit.rotation.x = Math.PI / 2;
    orbit.position.y = 1.6;
    scene.add(orbit);

    const electronGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const electronMat = new THREE.MeshBasicMaterial({color: 0xffffff});
    const electron = new THREE.Mesh(electronGeo, electronMat);

    const electronGroup = new THREE.Group();
    electronGroup.position.y = 1.6;
    electronGroup.add(electron);

    electron.userData = {
      angle: Math.random() * Math.PI * 2,
      speed: ELECTRON_SPEED / (level * 0.7),
      radius: radius
    };

    scene.add(electronGroup);
    electronOrbits.push(electronGroup);
  });
}

function createPeriodicTableHologram(ctx) {
  const pTableGroup = new THREE.Group();

  const width = 12;
  const height = 7;
  const cols = 18;
  const rows = 7;

  const cellWidth = width / cols;
  const cellHeight = height / rows;

  for (let z = 0; z < ELEMENTS.length && z < 3; z++) {
    const element = ELEMENTS[z];
    const cellGeo = new THREE.BoxGeometry(cellWidth * 0.8, cellHeight * 0.8, 0.05);
    const cellMat = new THREE.MeshBasicMaterial({
      color: element.color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const cell = new THREE.Mesh(cellGeo, cellMat);

    const x = (element.groupNumber - 9) * cellWidth;
    const y = (4 - element.period) * cellHeight;

    cell.position.set(x, y + 2, -6);
    cell.userData.element = element;
    cell.name = `element_${element.symbol}`;

    pTableGroup.add(cell);
  }

  periodicTableMesh = pTableGroup;
  scene.add(pTableGroup);
}

function createElementButtons(ctx) {
  const buttonGroup = new THREE.Group();
  const radius = 8;
  const angleStep = (Math.PI * 2) / ELEMENTS.length;

  ELEMENTS.forEach((element, index) => {
    const angle = index * angleStep;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const buttonGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const buttonMat = new THREE.MeshBasicMaterial({
      color: element.color,
      transparent: true,
      opacity: 0.7
    });
    const button = new THREE.Mesh(buttonGeo, buttonMat);
    button.position.set(x, 1.6, z);
    button.userData.element = element;
    button.userData.roomIndex = index + 1;
    button.name = `element_${element.symbol}_button`;

    buttonGroup.add(button);
    elementButtons.push(button);

    const textEntity = ctx.world.createEntity();
    textEntity
      .addComponent(Text, {
        text: element.symbol,
        color: '#ffffff',
        fontSize: 0.15,
        anchor: 'center',
        baseline: 'middle',
        textAlign: 'center'
      })
      .addComponent(ParentObject3D, {value: button})
      .addComponent(Position, {x: 0, y: 0.4, z: 0});

    buttonGroup.add(button);
  });

  scene.add(buttonGroup);
}

function createExpRoomButtons(ctx) {
  const buttonGroup = new THREE.Group();
  const radius = 12;
  const angleStep = (Math.PI * 2) / EXPERIMENTAL_ROOMS.length;

  EXPERIMENTAL_ROOMS.forEach((room, index) => {
    const angle = index * angleStep;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const buttonGeo = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    const buttonMat = new THREE.MeshBasicMaterial({
      color: room.color,
      transparent: true,
      opacity: 0.6
    });
    const button = new THREE.Mesh(buttonGeo, buttonMat);
    button.position.set(x, 1.6, z);
    button.userData.expRoom = room;
    button.userData.roomIndex = ELEMENTS.length + index + 1;
    button.name = `exp_${room.id}_button`;

    buttonGroup.add(button);
    expButtons.push(button);
  });

  scene.add(buttonGroup);
}

function createInfoPanel(ctx) {
  const panelGeo = new THREE.PlaneGeometry(3, 2);
  const panelMat = new THREE.MeshBasicMaterial({
    color: 0x2a2a3a,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide
  });
  infoPanel = new THREE.Mesh(panelGeo, panelMat);
  infoPanel.position.set(0, 3.5, -4);
  infoPanel.visible = false;
  scene.add(infoPanel);

  const titleTextEntity = ctx.world.createEntity();
  titleTextEntity
    .addComponent(Text, {
      text: '',
      color: '#ffffff',
      fontSize: 0.12,
      anchor: 'center',
      baseline: 'top',
      textAlign: 'center'
    })
    .addComponent(ParentObject3D, {value: infoPanel})
    .addComponent(Position, {x: 0, y: 0.6, z: 0.01});

  infoPanel.userData.titleText = titleTextEntity;

  const descTextEntity = ctx.world.createEntity();
  descTextEntity
    .addComponent(Text, {
      text: '',
      color: '#cccccc',
      fontSize: 0.06,
      anchor: 'center',
      baseline: 'top',
      textAlign: 'center',
      maxWidth: 2.6,
      lineHeight: 1.4
    })
    .addComponent(ParentObject3D, {value: infoPanel})
    .addComponent(Position, {x: 0, y: -0.2, z: 0.01});

  infoPanel.userData.descText = descTextEntity;
}

function registerInteractions(ctx) {
  ctx.raycontrol.addState('lobbyElements', {
    colliderMesh: [...elementButtons],
    controller: 'primary',
    onHover: (intersection, active) => {
      const button = intersection.object;
      button.scale.setScalar(active ? 1.3 : 1);
      showElementInfo(button.userData.element);
    },
    onHoverLeave: (intersection) => {
      hideElementInfo();
    },
    onSelectStart: (intersection, e) => {
      ctx.goto = intersection.object.userData.roomIndex;
    },
    onSelectEnd: (intersection) => {}
  });

  ctx.raycontrol.addState('lobbyExpRooms', {
    colliderMesh: [...expButtons],
    controller: 'primary',
    onHover: (intersection, active) => {
      const button = intersection.object;
      button.scale.setScalar(active ? 1.2 : 1);
    },
    onHoverLeave: (intersection) => {},
    onSelectStart: (intersection, e) => {
      ctx.goto = intersection.object.userData.roomIndex;
    },
    onSelectEnd: (intersection) => {}
  });

  ctx.raycontrol.addState('lobbyTeleport', {
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
}

function showElementInfo(element) {
  if (!element || currentSelection === element.symbol) return;

  currentSelection = element.symbol;
  infoPanel.visible = true;

  const titleComp = infoPanel.userData.titleText.getComponent(Text);
  titleComp.text = `${element.symbol} - ${element.name}`;

  const descComp = infoPanel.userData.descText.getComponent(Text);
  descComp.text = element.description;
}

function hideElementInfo() {
  currentSelection = null;
  infoPanel.visible = false;
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x0a0a1a);
  ctx.scene.add(scene);
  ctx.raycontrol.activateState('lobbyElements');
  ctx.raycontrol.activateState('lobbyExpRooms');
  ctx.raycontrol.activateState('lobbyTeleport');
}

export function exit(ctx) {
  ctx.raycontrol.deactivateState('lobbyElements');
  ctx.raycontrol.deactivateState('lobbyExpRooms');
  ctx.raycontrol.deactivateState('lobbyTeleport');
  ctx.scene.remove(scene);
  hideElementInfo();
}

export function execute(ctx, delta, time) {
  if (atomCore) {
    atomCore.material.opacity = 0.6 + Math.sin(time * 2) * 0.2;
    atomCore.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
  }

  electronOrbits.forEach(group => {
    const electron = group.children[0];
    const userData = electron.userData;
    userData.angle += userData.speed * delta;
    electron.position.x = Math.cos(userData.angle) * userData.radius;
    electron.position.z = Math.sin(userData.angle) * userData.radius;
  });

  if (periodicTableMesh) {
    periodicTableMesh.rotation.y = time * 0.1;
    periodicTableMesh.position.y = 2 + Math.sin(time * 0.5) * 0.2;
  }

  elementButtons.forEach((button, i) => {
    button.position.y = 1.6 + Math.sin(time * 2 + i * 0.5) * 0.1;
  });

  // Animate starfield rotation
  if (starField) {
    starField.rotation.y += delta * 0.01;
  }

  // Animate ambient particles
  if (ambientParticles) {
    const positions = ambientParticles.geometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(time + i) * 0.002;
    }
    ambientParticles.geometry.attributes.position.needsUpdate = true;
    ambientParticles.rotation.y += delta * 0.02;
  }

  // Animate floor glow ring
  if (scene.userData.glowRing) {
    scene.userData.glowRing.material.opacity = 0.2 + Math.sin(time * 1.5) * 0.1;
  }
}
