import * as THREE from 'three';
import { Text, Position, ParentObject3D } from '../components/index.js';
import { createHelpPanel } from '../components/HelpPanel.js';
import { ELEMENTS } from '../data/elements.js';
import { AudioManager } from '../core/AudioManager.js';
import { createElementDisplay } from '../lib/modelLoader.js';
import roomThemeManager from '../lib/RoomThemeManager.js';
import i18nManager from '../lib/I18nManager.js';
import RoomComparisonManager from '../lib/RoomComparisonManager.js';

// Experiment classes
import ReactionExperiment from '../experiments/ReactionExperiment.js';
import ElectricalExperiment from '../experiments/ElectricalExperiment.js';
import ElectrochemicalExperiment from '../experiments/ElectrochemicalExperiment.js';
import NuclearExperiment from '../experiments/NuclearExperiment.js';
import OrganicExperiment from '../experiments/OrganicExperiment.js';
import CrystalExperiment from '../experiments/CrystalExperiment.js';

var scene;
var elementData;
var atomModel;
var infoPanelMesh;
var experimentStations = [];
var audioManager;
var setupCalled = false;
var currentElementSymbol = null;
var backgroundParticles;
var backButton;
var helpPanel;
var themeCleanup = null;
var comparisonManager = null;

// Experiment instances storage - maps expId to experiment instance
var experimentInstances = {};

// Haptic feedback callback for experiments
var hapticCallback = null;

// Desktop mode state for non-VR fallback
var desktopRaycaster = new THREE.Raycaster();
var desktopMouse = new THREE.Vector2();
var hoveredStation = null;
var desktopModeActive = false;
var boundDesktopMouseMoveHandler = null;
var boundDesktopClickHandler = null;
var boundDesktopKeyHandler = null;

/**
 * Global setup - called once during app initialization
 * Does NOT create scene (scene is created per-element in enter())
 */
export function setup(ctx) {
  audioManager = new AudioManager(ctx);
  audioManager.init();
  setupCalled = true;
}

/**
 * Per-element setup - creates the scene for a specific element
 * Called from enter() when navigating to an element room
 */
async function setupElement(ctx, elementSymbol) {
  // Reset state for new element
  scene = null;
  elementData = null;
  atomModel = null;
  infoPanelMesh = null;
  experimentStations = [];
  backgroundParticles = null;
  backButton = null;
  helpPanel = null;
  themeCleanup = null;
  
  // Reset experiment instances
  experimentInstances = {};
  
  elementData = ELEMENTS.find(e => e.symbol.toLowerCase() === elementSymbol.toLowerCase());
  if (!elementData) {
    console.error('[ElementRoom] Element not found:', elementSymbol);
    return false;
  }

  currentElementSymbol = elementSymbol;
  scene = new THREE.Scene();

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
  createComparisonButton(ctx);

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

  return true;
}

function createFloor(ctx, themeColor, theme) {
  // Use theme floor color if available, otherwise derive from element color
  var floorColor = theme ? theme.floorColor : new THREE.Color(themeColor).multiplyScalar(0.1);
  
  const floorGeo = new THREE.CylinderGeometry(10, 10, 0.2, 32);
  const floorMat = new THREE.MeshStandardMaterial({
    color: floorColor,
    metalness: 0.2,
    roughness: 0.8
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.1;
  scene.add(floor);

  // Add decorative floor ring
  const ringGeo = new THREE.RingGeometry(9.5, 10, 32);
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

  const nucleusGeo = new THREE.SphereGeometry(0.5, 16, 16);
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
    const shellGeo = new THREE.TorusGeometry(shellRadius, 0.02, 8, 32);
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
      const electronGeo = new THREE.SphereGeometry(0.08, 8, 8);
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
}

function createExperimentStations(ctx, element) {
  const stationRadius = 6;
  const experiments = element.experiments || [];

  experiments.forEach((expId, index) => {
    const angle = (index / Math.max(experiments.length, 1)) * Math.PI * 2;
    const x = Math.cos(angle) * stationRadius;
    const z = Math.sin(angle) * stationRadius;

    const stationGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 12);
    const stationMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(element.color).multiplyScalar(0.8),
      transparent: true,
      opacity: 0.6
    });
    const station = new THREE.Mesh(stationGeo, stationMat);
    station.position.set(x, 0.25, z);
    station.userData.experimentId = expId;
    station.userData.element = element;

    const iconGeo = new THREE.SphereGeometry(0.2, 8, 8);
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
      }
      
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

function createComparisonButton(ctx) {
  const compareBtn = RoomComparisonManager.createCompareButton(scene, {x: 0, y: 3.2, z: -4}, 0x4a90e2);
  
  comparisonManager = {
    active: false,
    currentElement: elementData,
    selectedElement: null,
    compareButton: compareBtn,
    selectorPanel: null
  };
  
  // Add RayControl state for comparison button
  ctx.raycontrol.addState('elementCompare', {
    colliderMesh: [compareBtn],
    controller: 'primary',
    onHover: (intersection, active) => {
      compareBtn.scale.setScalar(active ? 1.1 : 1);
      compareBtn.material.opacity = active ? 1.0 : 0.8;
    },
    onHoverLeave: () => {
      compareBtn.scale.setScalar(1);
      compareBtn.material.opacity = 0.8;
    },
    onSelectStart: (intersection, e) => {
      toggleComparisonMode(ctx);
    }
  });
}

function toggleComparisonMode(ctx) {
  comparisonManager.active = !comparisonManager.active;
  
  if (comparisonManager.active) {
    showComparisonSelector(ctx);
  } else if (comparisonManager.selectorPanel) {
    cleanupSelectorPanel(ctx);
  }
}

function showComparisonSelector(ctx) {
  comparisonManager.selectorPanel = RoomComparisonManager.createSelectorPanel(
    ctx,
    scene,
    ELEMENTS
  );
  
  // Add RayControl for element selection
  ctx.raycontrol.addState('compareSelector', {
    colliderMesh: comparisonManager.selectorPanel.children,
    controller: 'primary',
    onSelectStart: (intersection, e) => {
      const elementSymbol = intersection.object.userData.elementSymbol;
      if (elementSymbol && elementSymbol !== currentElementSymbol) {
        handleElementSelection(ctx, elementSymbol);
      } else if (intersection.object.userData.closePanel) {
        cleanupSelectorPanel(ctx);
        comparisonManager.active = false;
      }
    }
  });
}

function handleElementSelection(ctx, elementSymbol) {
  const selectedEl = ELEMENTS.find(e => e.symbol.toLowerCase() === elementSymbol.toLowerCase());
  if (!selectedEl) return;
  
  comparisonManager.selectedElement = selectedEl;
  
  // Update info panel to show comparison
  RoomComparisonManager.updateInfoPanel(infoPanelMesh, comparisonManager.currentElement, selectedEl);
  
  // Close selector panel
  cleanupSelectorPanel(ctx);
  comparisonManager.active = false;
}

function cleanupSelectorPanel(ctx) {
  if (comparisonManager && comparisonManager.selectorPanel) {
    RoomComparisonManager.cleanup(scene, comparisonManager);
    comparisonManager.selectorPanel = null;
  }
  
  // Remove selector RayControl state
  ctx.raycontrol.removeState('compareSelector');
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
}

export function enter(ctx, roomIndex, roomName) {
  // Determine element symbol from room name or index
  let elementSymbol = roomName;
  if (!elementSymbol && roomIndex !== undefined) {
    // Room index 1-118 are element rooms
    const elementIndex = roomIndex - 1; // ROOM_ELEMENTS_START = 1
    if (elementIndex >= 0 && elementIndex < ELEMENTS.length) {
      elementSymbol = ELEMENTS[elementIndex].symbol.toLowerCase();
    }
  }
  
  // Check if we need to setup for a different element
  if (elementSymbol && elementSymbol !== currentElementSymbol) {
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
        }
      }
    },
    onSelectEnd: function(intersection) {}
  }, true);

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
  }, true);

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
  }, true);

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
  }, true);
  
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
  ctx.raycontrol.removeState('compareSelector');
  ctx.scene.remove(scene);
  
  // Cleanup theme resources (lights, particles)
  if (themeCleanup) {
    themeCleanup();
    themeCleanup = null;
  }
  
  // Cleanup comparison mode
  if (comparisonManager) {
    RoomComparisonManager.cleanup(scene, comparisonManager);
    
    // Remove comparison button from scene
    if (comparisonManager.compareButton) {
      scene.remove(comparisonManager.compareButton);
      comparisonManager.compareButton = null;
    }
    
    comparisonManager = null;
  }
  
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

// Performance: Cached electron/shell/nucleus references to avoid traversing children each frame
var _cachedElectrons = [];
var _cachedNucleus = null;
var _cachedShells = [];
var _bgParticlePositions = null;

// Performance: Frame skip counter for non-critical updates
var _frameCounter = 0;
var _bgParticleUpdateInterval = 2; // Update background particles every N frames

function getExperimentType(expId) {
  if (['water', 'flame'].includes(expId)) return 'reaction';
  if (['electric', 'magnetic'].includes(expId)) return 'electrical';
  if (['battery', 'galvanic'].includes(expId)) return 'electrochemical';
  if (['fusion', 'fission', 'decay'].includes(expId)) return 'nuclear';
  if (['protein', 'dna', 'polymer'].includes(expId)) return 'organic';
  if (['crystal', 'lattice'].includes(expId)) return 'crystal';
  return 'general';
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
}
