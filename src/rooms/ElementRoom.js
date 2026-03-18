import * as THREE from 'three';
import { Text, Position, ParentObject3D, Object3D, Children } from '../components/index.js';
import { createHelpPanel } from '../components/HelpPanel.js';
import { ELEMENTS, GROUP_COLORS } from '../data/elements.js';
import { AudioManager } from '../core/AudioManager.js';
import { createElementDisplay } from '../lib/modelLoader.js';
import roomThemeManager from '../lib/RoomThemeManager.js';
import i18nManager from '../lib/I18nManager.js';

// Experiment classes
import ReactionExperiment from '../experiments/ReactionExperiment.js';
import ElectricalExperiment from '../experiments/ElectricalExperiment.js';
import ElectrochemicalExperiment from '../experiments/ElectrochemicalExperiment.js';
import NuclearExperiment from '../experiments/NuclearExperiment.js';
import OrganicExperiment from '../experiments/OrganicExperiment.js';
import CrystalExperiment from '../experiments/CrystalExperiment.js';

console.log('[ElementRoom] Module loaded, ELEMENTS:', typeof ELEMENTS, 'has ELEMENTS:', 'ELEMENTS' in {ELEMENTS, GROUP_COLORS});

var scene;
var elementData;
var atomModel;
var infoPanelMesh;
var experimentStations = [];
var audioManager;
var setupCalled = false;
var currentElementSymbol = null;
var backgroundParticles;
var orbitTrails = [];
var backButton;
var helpPanel;
var themeCleanup = null;

// Experiment instances storage - maps expId to experiment instance
var experimentInstances = {};

// Haptic feedback callback for experiments
var hapticCallback = null;

// Desktop mode state for non-VR fallback
var desktopRaycaster = new THREE.Raycaster();
var desktopMouse = new THREE.Vector2();
var hoveredStation = null;
var selectedStation = null;
var desktopModeActive = false;
var boundDesktopMouseMoveHandler = null;
var boundDesktopClickHandler = null;
var boundDesktopKeyHandler = null;

/**
 * Global setup - called once during app initialization
 * Does NOT create scene (scene is created per-element in enter())
 */
export function setup(ctx) {
  console.log('[ElementRoom] Global setup called');
  // Just initialize audio manager globally
  audioManager = new AudioManager(ctx);
  audioManager.init().then(() => {
    console.log('[ElementRoom] Audio manager initialized');
  });
  setupCalled = true;
}

/**
 * Per-element setup - creates the scene for a specific element
 * Called from enter() when navigating to an element room
 */
async function setupElement(ctx, elementSymbol) {
  console.log('[ElementRoom] setupElement called for:', elementSymbol);
  console.log('[ElementRoom] ELEMENTS available:', typeof ELEMENTS, 'length:', ELEMENTS ? ELEMENTS.length : 'N/A');
  
  // Reset state for new element
  scene = null;
  elementData = null;
  atomModel = null;
  infoPanelMesh = null;
  experimentStations = [];
  backgroundParticles = null;
  orbitTrails = [];
  backButton = null;
  helpPanel = null;
  themeCleanup = null;
  
  // Reset experiment instances
  experimentInstances = {};
  
  elementData = ELEMENTS.find(e => e.symbol.toLowerCase() === elementSymbol.toLowerCase());
  console.log('[ElementRoom] elementData found:', !!elementData, elementData);
  if (!elementData) {
    console.error('[ElementRoom] Element not found:', elementSymbol);
    return false;
  }

  currentElementSymbol = elementSymbol;
  scene = new THREE.Scene();
  console.log('[ElementRoom] Scene created:', scene);

  // Apply theme based on element
  var themeResult = roomThemeManager.applyTheme(scene, elementData.theme || 'default', elementData);
  themeCleanup = themeResult.cleanup;
  backgroundParticles = themeResult.particles;
  
  // Store theme for floor creation
  var theme = null;
  var themeColor = elementData.color;

  createFloor(ctx, themeColor, theme);
  createAtomModel(ctx, elementData);
  createInfoPanel(ctx, elementData);
  createExperimentStations(ctx, elementData);
  createExperimentInstances(ctx, elementData);
  createTeleportZone(ctx);
  createBackButton(ctx);

  // Create help panel
  helpPanel = createHelpPanel(ctx, {
    position: {x: 4, y: 3, z: -4},
    showDesktop: true,
    showVR: true
  });
  helpPanel.lookAt(0, 1.6, 0);
  scene.add(helpPanel);

  scene.userData.teleportZone = teleportFloorMesh;
  scene.userData.atomModel = atomModel;
  scene.userData.elementData = elementData;

  console.log('[ElementRoom] Setup complete for:', elementSymbol);
  return true;
}

function createFloor(ctx, themeColor, theme) {
  // Use theme floor color if available, otherwise derive from element color
  var floorColor = theme ? theme.floorColor : new THREE.Color(themeColor).multiplyScalar(0.1);
  
  const floorGeo = new THREE.CylinderGeometry(10, 10, 0.2, 64);
  const floorMat = new THREE.MeshStandardMaterial({
    color: floorColor,
    metalness: 0.2,
    roughness: 0.8
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.1;
  scene.add(floor);

  // Add decorative floor ring
  const ringGeo = new THREE.RingGeometry(9.5, 10, 64);
  const ringMat = new THREE.MeshBasicMaterial({ 
    color: themeColor, 
    transparent: true, 
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  scene.add(ring);
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

  const config = element.electronConfiguration || [element.atomicNumber];
  config.forEach((electronCount, shellIndex) => {
    if (electronCount === 0) return; // Skip empty shells

    const shellRadius = 1.0 + shellIndex * 0.6;

    // Create shell ring (torus)
    const shellGeo = new THREE.TorusGeometry(shellRadius, 0.02, 16, 64);
    const shellMat = new THREE.MeshBasicMaterial({
      color: element.color,
      transparent: true,
      opacity: 0.2
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.rotation.x = Math.PI / 2;
    shell.userData.shell = true;
    shell.userData.shellIndex = shellIndex;
    atomModel.add(shell);

    // Place electrons around this shell
    for (let i = 0; i < electronCount; i++) {
      const angle = (i / electronCount) * Math.PI * 2;
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
        electron: true,
        shellIndex: shellIndex
      };

      atomModel.add(electron);
    }

    // Add shell label (K, L, M, N, etc.) - simple colored sphere for now
    const shellLetters = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
    if (shellIndex < shellLetters.length) {
      const labelGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const labelMat = new THREE.MeshBasicMaterial({
        color: element.color,
        transparent: true,
        opacity: 1.0
      });
      const label = new THREE.Mesh(labelGeo, labelMat);
      label.position.set(shellRadius + 0.8, (shellIndex - 1) * 0.6, 0);
      label.userData.shellLabel = true;
      atomModel.add(label);
    }
  });

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
      text: `${element.symbol} - ${element.name}\n${i18nManager.t('element.info.group')}: ${element.group}\n${i18nManager.t('element.info.period')}: ${element.period}\n${i18nManager.t('element.info.block')}: ${element.block}\n${i18nManager.t('element.info.group')}: ${element.groupNumber}`,
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
      text: `${i18nManager.t('element.info.atomicNumber')}: ${element.atomicNumber}\n${i18nManager.t('element.info.mass')}: ${element.mass}\n${i18nManager.t('element.info.group')}: ${element.group}\n${i18nManager.t('element.info.period')}: ${element.period}\n${i18nManager.t('element.info.block')}: ${element.block}\n${i18nManager.t('element.info.group')}: ${element.groupNumber}\nTheme: ${element.theme}\n\n${element.description}`,
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

/**
 * Create experiment instances based on element.experiments[] array
 * Maps experiment IDs to their corresponding experiment class instances
 */
function createExperimentInstances(ctx, element) {
  const experiments = element.experiments || [];
  
  experiments.forEach(expId => {
    const type = getExperimentType(expId);
    let experiment = null;
    
    switch(type) {
      case 'reaction':
        experiment = new ReactionExperiment({
          audioManager: audioManager
        });
        // Configure with element symbol and reaction type
        if (element.symbol && (expId === 'water' || expId === 'flame')) {
          experiment.configure(element.symbol, expId);
        }
        break;
      case 'electrical':
        experiment = new ElectricalExperiment({
          audioManager: audioManager
        });
        break;
      case 'electrochemical':
        experiment = new ElectrochemicalExperiment(expId === 'battery' ? 'battery' : 
                                                     expId === 'galvanic' ? 'galvanic' : 'electrolysis');
        experiment.setAudioManager(audioManager);
        break;
      case 'nuclear':
        experiment = new NuclearExperiment({
          audioManager: audioManager,
          hapticPulse: hapticCallback
        });
        experiment.setExperimentType(expId);
        break;
      case 'organic':
        experiment = new OrganicExperiment();
        experiment.setAudioManager(audioManager);
        // Set visualization mode based on expId
        if (expId === 'dna') {
          experiment.setVisualizationMode('dna');
        } else if (expId === 'protein') {
          experiment.setVisualizationMode('protein');
        } else if (expId === 'polymer') {
          experiment.setVisualizationMode('polymer');
        }
        break;
      case 'crystal':
        experiment = new CrystalExperiment({
          audioManager: audioManager
        });
        experiment.configure(expId === 'hexagonal' ? 'hexagonal' : 'cubic');
        break;
      default:
        break;
    }
    
    if (experiment) {
      // Set haptic callback if available
      if (experiment.setHapticCallback && hapticCallback) {
        experiment.setHapticCallback(hapticCallback);
      }
      
      experimentInstances[expId] = experiment;
      
      // Find the station for this experiment and render into it
      const station = experimentStations.find(s => s.userData.experimentId === expId);
      if (station && experiment.render) {
        // Create a group to hold experiment visuals
        const experimentGroup = new THREE.Group();
        experimentGroup.name = 'experimentVisuals_' + expId;
        station.add(experimentGroup);
        experiment.render(experimentGroup);
        station.userData.experimentInstance = experiment;
        console.log('[ElementRoom] Experiment rendered for:', expId);
      }
      
      console.log('[ElementRoom] Created experiment instance:', expId, 'type:', type);
    }
  });
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

function createBackButton(ctx) {
  const backGeo = new THREE.BoxGeometry(0.8, 0.3, 0.05);
  const backMat = new THREE.MeshBasicMaterial({
    color: 0x4a90e2,
    transparent: true,
    opacity: 0.8
  });
  backButton = new THREE.Mesh(backGeo, backMat);
  backButton.position.set(0, 2.8, -4);
  backButton.name = 'backButton';
  scene.add(backButton);
}

/**
 * Desktop mode: Check if VR is active
 */
function isVRMode(ctx) {
  return ctx.vrMode === true;
}

/**
 * Desktop mode: Handle mouse movement for experiment hover
 */
function handleDesktopMouseMove(ctx, event) {
  if (isVRMode(ctx) || experimentStations.length === 0) {
    return;
  }
  
  var rect = ctx.renderer.domElement.getBoundingClientRect();
  desktopMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  desktopMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  // Raycast from camera through mouse position
  desktopRaycaster.setFromCamera(desktopMouse, ctx.camera);
  var intersects = desktopRaycaster.intersectObjects(experimentStations, false);
  
  // Reset previous hover state
  if (hoveredStation && (!intersects.length || intersects[0].object !== hoveredStation)) {
    hoveredStation.scale.setScalar(1);
    hoveredStation.material.opacity = 0.6;
    hoveredStation = null;
  }
  
  // Set new hover state
  if (intersects.length > 0) {
    var station = intersects[0].object;
    if (station !== hoveredStation) {
      hoveredStation = station;
      station.scale.setScalar(1.15);
      station.material.opacity = 0.85;
    }
  }
}

/**
 * Desktop mode: Handle mouse click for experiment trigger
 */
function handleDesktopClick(ctx, event) {
  if (isVRMode(ctx) || experimentStations.length === 0) {
    return;
  }
  
  var rect = ctx.renderer.domElement.getBoundingClientRect();
  desktopMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  desktopMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  // Raycast from camera through mouse position
  desktopRaycaster.setFromCamera(desktopMouse, ctx.camera);
  var intersects = desktopRaycaster.intersectObjects(experimentStations, false);
  
  if (intersects.length > 0) {
    var station = intersects[0].object;
    triggerExperiment(ctx, station);
  }
}

/**
 * Desktop mode: Handle keyboard shortcut 'E' for experiment trigger
 * Triggers the nearest experiment or cycles through available experiments
 */
function handleDesktopKey(ctx, event) {
  if (isVRMode(ctx) || experimentStations.length === 0) {
    return;
  }
  
  // 'E' key to trigger nearest experiment
  if (event.code === 'KeyE') {
    event.preventDefault();
    
    // Find nearest experiment station to camera
    var nearestStation = null;
    var nearestDistance = Infinity;
    
    var cameraPosition = ctx.camera.position.clone();
    
    experimentStations.forEach(function(station) {
      var distance = cameraPosition.distanceTo(station.position);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestStation = station;
      }
    });
    
    if (nearestStation && nearestDistance < 10) {
      // Visual feedback - pulse effect
      var originalScale = nearestStation.scale.x;
      nearestStation.scale.setScalar(1.3);
      setTimeout(function() {
        if (nearestStation) {
          nearestStation.scale.setScalar(originalScale);
        }
      }, 150);
      
      triggerExperiment(ctx, nearestStation);
    }
  }
  
  // 'R' key to reset all experiments
  if (event.code === 'KeyR') {
    event.preventDefault();
    resetAllExperiments(ctx);
  }
}

/**
 * Trigger an experiment by station
 */
function triggerExperiment(ctx, station) {
  var expId = station.userData.experimentId;
  console.log('[ElementRoom] Desktop trigger experiment:', expId);
  
  // Get the experiment instance and start it
  var experiment = experimentInstances[expId];
  if (experiment) {
    var currentState = experiment.state || experiment._state || 'IDLE';
    
    // Start the experiment if it's idle
    if (currentState === 'IDLE') {
      experiment.start();
      // For ReactionExperiment, also drop the element
      if (experiment.drop) {
        experiment.drop();
      }
      console.log('[ElementRoom] Started experiment (desktop):', expId);
      
      // Visual feedback - highlight station
      station.material.opacity = 1.0;
      setTimeout(function() {
        if (station.material) {
          station.material.opacity = 0.6;
        }
      }, 300);
    } else if (currentState === 'COMPLETED') {
      // Reset and restart if completed
      if (experiment.reset) {
        experiment.reset();
        console.log('[ElementRoom] Reset experiment (desktop):', expId);
      }
    }
  } else {
    console.warn('[ElementRoom] No experiment instance found for:', expId);
  }
}

/**
 * Reset all experiments
 */
function resetAllExperiments(ctx) {
  console.log('[ElementRoom] Resetting all experiments');
  Object.keys(experimentInstances).forEach(function(expId) {
    var experiment = experimentInstances[expId];
    if (experiment && experiment.reset) {
      experiment.reset();
    }
  });
  
  // Reset station visuals
  experimentStations.forEach(function(station) {
    station.scale.setScalar(1);
    station.material.opacity = 0.6;
  });
}

/**
 * Setup desktop mode event listeners
 */
function setupDesktopMode(ctx) {
  if (desktopModeActive) {
    return;
  }
  
  desktopModeActive = true;
  
  // Create bound handlers for cleanup
  boundDesktopMouseMoveHandler = function(event) {
    handleDesktopMouseMove(ctx, event);
  };
  boundDesktopClickHandler = function(event) {
    handleDesktopClick(ctx, event);
  };
  boundDesktopKeyHandler = function(event) {
    handleDesktopKey(ctx, event);
  };
  
  // Add event listeners
  ctx.renderer.domElement.addEventListener('mousemove', boundDesktopMouseMoveHandler);
  ctx.renderer.domElement.addEventListener('click', boundDesktopClickHandler);
  window.addEventListener('keydown', boundDesktopKeyHandler);
  
  console.log('[ElementRoom] Desktop mode enabled - mouse and keyboard controls active');
}

/**
 * Cleanup desktop mode event listeners
 */
function cleanupDesktopMode(ctx) {
  if (!desktopModeActive) {
    return;
  }
  
  desktopModeActive = false;
  
  // Remove event listeners
  if (boundDesktopMouseMoveHandler) {
    ctx.renderer.domElement.removeEventListener('mousemove', boundDesktopMouseMoveHandler);
    boundDesktopMouseMoveHandler = null;
  }
  if (boundDesktopClickHandler) {
    ctx.renderer.domElement.removeEventListener('click', boundDesktopClickHandler);
    boundDesktopClickHandler = null;
  }
  if (boundDesktopKeyHandler) {
    window.removeEventListener('keydown', boundDesktopKeyHandler);
    boundDesktopKeyHandler = null;
  }
  
  // Reset hover state
  if (hoveredStation) {
    hoveredStation.scale.setScalar(1);
    hoveredStation.material.opacity = 0.6;
    hoveredStation = null;
  }
  
  console.log('[ElementRoom] Desktop mode disabled');
}

export function enter(ctx, roomIndex, roomName) {
  console.log('[ElementRoom] enter called, roomIndex:', roomIndex, 'roomName:', roomName);
  
  // Determine element symbol from room name or index
  let elementSymbol = roomName;
  if (!elementSymbol && roomIndex !== undefined) {
    // Room index 1-118 are element rooms
    const elementIndex = roomIndex - 1; // ROOM_ELEMENTS_START = 1
    if (elementIndex >= 0 && elementIndex < ELEMENTS.length) {
      elementSymbol = ELEMENTS[elementIndex].symbol.toLowerCase();
    }
  }
  
  console.log('[ElementRoom] Entering element room for:', elementSymbol);
  
  // Check if we need to setup for a different element
  if (elementSymbol && elementSymbol !== currentElementSymbol) {
    console.log('[ElementRoom] New element detected, setting up:', elementSymbol);
    // Clean up previous scene if exists
    if (scene) {
      ctx.scene.remove(scene);
    }
    // Setup new element (synchronously for now)
    setupElement(ctx, elementSymbol);
  }
  
  if (!scene) {
    console.error('[ElementRoom] Scene is undefined after setup, skipping enter');
    return;
  }
  
  ctx.scene.add(scene);
  ctx.renderer.setClearColor(scene.background);
  
  // Setup haptic callback for experiments
  if (ctx.hapticManager && ctx.hapticManager.pulse) {
    hapticCallback = function(intensity) {
      ctx.hapticManager.pulse(intensity, 100);
    };
  } else if (ctx.controllers && ctx.controllers.primary && ctx.controllers.primary.gamepad && ctx.controllers.primary.gamepad.hapticActuators) {
    const actuator = ctx.controllers.primary.gamepad.hapticActuators[0];
    if (actuator) {
      hapticCallback = function(intensity) {
        actuator.pulse(intensity, 100);
      };
    }
  }
  
  // Update haptic callbacks on existing experiments
  Object.keys(experimentInstances).forEach(function(expId) {
    const experiment = experimentInstances[expId];
    if (experiment && experiment.setHapticCallback && hapticCallback) {
      experiment.setHapticCallback(hapticCallback);
    }
  });
  
  ctx.raycontrol.activateState('elementExperiments');
  ctx.raycontrol.activateState('elementTeleport');
  ctx.raycontrol.activateState('elementInfoPanel');

  ctx.raycontrol.addState('elementExperiments', {
    colliderMesh: experimentStations,
    controller: 'primary',
    onHover: function(intersection, active) {
      const station = intersection.object;
      station.scale.setScalar(active ? 1.2 : 1);
    },
    onHoverLeave: function() {},
    onSelectStart: function(intersection, e) {
      const station = intersection.object;
      const expId = station.userData.experimentId;
      console.log('[ElementRoom] Experiment selected:', expId);
      
      // Get the experiment instance and start it
      const experiment = experimentInstances[expId];
      if (experiment) {
        // Start the experiment if it's idle
        if (experiment.state === 'IDLE' || experiment._state === 'IDLE') {
          experiment.start();
          // For ReactionExperiment, also drop the element
          if (experiment.drop) {
            experiment.drop();
          }
          // Trigger haptic feedback on start
          if (hapticCallback) {
            hapticCallback(0.5);
          }
          console.log('[ElementRoom] Started experiment:', expId);
        }
      }
    },
    onSelectEnd: function(intersection) {}
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

ctx.raycontrol.addState('elementBackToLobby', {
    colliderMesh: [backButton],
    controller: 'primary',
    onHover: (intersection, active) => {
      backButton.scale.setScalar(active ? 1.1 : 1);
      backButton.material.opacity = active ? 1.0 : 0.8;
    },
    onHoverLeave: () => {
      backButton.scale.setScalar(1);
      backButton.material.opacity = 0.8;
    },
    onSelectStart: (intersection, e) => {
      ctx.goto = 0;
    }
  });
  
  // Setup desktop mode for non-VR fallback (mouse + keyboard controls)
  setupDesktopMode(ctx);
}

export function exit(ctx) {
  // Cleanup desktop mode event listeners first
  cleanupDesktopMode(ctx);
  
  // Remove RayControl states to prevent "already exist" warnings when re-entering
  ctx.raycontrol.removeState('elementExperiments');
  ctx.raycontrol.removeState('elementTeleport');
  ctx.raycontrol.removeState('elementInfoPanel');
  ctx.raycontrol.removeState('elementBackToLobby');
  ctx.raycontrol.removeState('elementCompare');
  ctx.scene.remove(scene);
  
  // Cleanup theme resources (lights, particles)
  if (themeCleanup) {
    themeCleanup();
    themeCleanup = null;
  }
  
  // Reset comparison mode
  comparisonRoom = null;
  comparisonActive = false;
  
  // Reset all experiment instances
  var expIds = Object.keys(experimentInstances);
  for (var i = 0; i < expIds.length; i++) {
    var experiment = experimentInstances[expIds[i]];
    if (experiment && experiment.reset) {
      experiment.reset();
    }
    // Call dispose if available (for NuclearExperiment)
    if (experiment && experiment.dispose) {
      experiment.dispose();
    }
  }
  experimentInstances = {};
  
  // Clear haptic callback
  hapticCallback = null;
  
  // Performance: Clear cached references on room exit
  _cachedElectrons = [];
  _cachedNucleus = null;
  _cachedShells = [];
  _bgParticlePositions = null;
}

var experimentInteractions = [];

// Performance: Cached electron/shell/nucleus references to avoid traversing children each frame
var _cachedElectrons = [];
var _cachedNucleus = null;
var _cachedShells = [];
var _bgParticlePositions = null;

// Performance: Frame skip counter for non-critical updates
var _frameCounter = 0;
var _bgParticleUpdateInterval = 2; // Update background particles every N frames

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
  // Performance: Increment frame counter for frame skipping
  _frameCounter++;
  var shouldUpdateBgParticles = (_frameCounter % _bgParticleUpdateInterval) === 0;
  
  if (atomModel) {
    // Performance: Cache electron references on first frame after atom model creation
    if (_cachedElectrons.length === 0 && atomModel.children.length > 0) {
      for (var i = 0; i < atomModel.children.length; i++) {
        var child = atomModel.children[i];
        if (child.userData.electron) {
          _cachedElectrons.push(child);
        } else if (child.userData.nucleus) {
          _cachedNucleus = child;
        } else if (child.userData.shell) {
          _cachedShells.push(child);
        }
      }
    }
    
    // Performance: Use cached references instead of traversing all children
    var electron, data;
    for (var e = 0; e < _cachedElectrons.length; e++) {
      electron = _cachedElectrons[e];
      data = electron.userData;
      data.angle += data.speed * delta;
      electron.position.x = Math.cos(data.angle) * data.shellRadius;
      electron.position.z = Math.sin(data.angle) * data.shellRadius;
      // Add subtle bobbing motion
      electron.position.y = Math.sin(time * 3 + data.angle) * 0.05;
    }
    
    // Update nucleus if cached
    if (_cachedNucleus) {
      _cachedNucleus.rotation.y += delta * 0.3;
      var pulse = 1 + Math.sin(time * 2) * 0.05;
      _cachedNucleus.scale.setScalar(pulse);
    }
    
    // Update shells
    var shell;
    for (var s = 0; s < _cachedShells.length; s++) {
      shell = _cachedShells[s];
      shell.rotation.x = Math.PI / 2 + Math.sin(time + shell.position.x * 5) * 0.05;
      shell.rotation.z += delta * 0.1;
    }

    // Slow rotation of entire atom model
    atomModel.rotation.y += delta * 0.1;
    
    if (atomModel.userData.themedDisplay) {
      atomModel.rotation.y += delta * 0.15;
    }
  }

  // Animate background particles with frame skipping for performance
  if (backgroundParticles && shouldUpdateBgParticles) {
    // Cache position array reference
    if (!_bgParticlePositions) {
      _bgParticlePositions = backgroundParticles.geometry.attributes.position.array;
    }
    var posLen = _bgParticlePositions.length;
    for (var p = 0; p < posLen; p += 3) {
      _bgParticlePositions[p + 1] += Math.sin(time + p) * 0.001;
    }
    backgroundParticles.geometry.attributes.position.needsUpdate = true;
  }
  
  // Always rotate background particles (cheap operation)
  if (backgroundParticles) {
    backgroundParticles.rotation.y += delta * 0.01;
  }

  // Update experiment instances
  var expKeys = Object.keys(experimentInstances);
  for (var k = 0; k < expKeys.length; k++) {
    var expId = expKeys[k];
    var experiment = experimentInstances[expId];
    if (experiment && experiment.update) {
      experiment.update(delta);
    }
  }

  // Performance: Early exit if no interactions
  if (experimentInteractions.length === 0) {
    return;
  }
  
  experimentInteractions.forEach(interaction => {
    interaction.execute(delta, time);
  });
}
