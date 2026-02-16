import * as THREE from 'three';
import { Text, Position, ParentObject3D } from './index.js';

/**
 * Create a help panel showing navigation controls
 * @param {Object} ctx - The app context with world for ECSY
 * @param {Object} options - Configuration options
 * @param {Object} options.position - {x, y, z} position in scene
 * @param {boolean} options.showDesktop - Show desktop controls
 * @param {boolean} options.showVR - Show VR controls
 * @returns {THREE.Mesh} The help panel mesh with text attached
 */
export function createHelpPanel(ctx, options = {}) {
  const { 
    position = {x: -3, y: 2.5, z: -3}, 
    showDesktop = true, 
    showVR = true 
  } = options;

  // Create panel background
  const panelGeo = new THREE.PlaneGeometry(2.8, 1.8);
  const panelMat = new THREE.MeshBasicMaterial({
    color: 0x1a1a2e,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(position.x, position.y, position.z);
  panel.name = 'helpPanel';

  // Build text content
  const lines = [];
  
  // Header
  lines.push('=== CONTROLS ===');
  lines.push('');
  
  if (showDesktop) {
    lines.push('[Desktop]');
    lines.push('N = Next room');
    lines.push('0-9 = Jump to room');
    lines.push('WASD = Move camera');
    lines.push('');
  }
  
  if (showVR) {
    lines.push('[VR Mode]');
    lines.push('Point + Click = Enter room');
    lines.push('Teleport pad = Move');
    lines.push('Back button = Return to lobby');
  }

  // Create text entity
  const textEntity = ctx.world.createEntity();
  textEntity
    .addComponent(Text, {
      text: lines.join('\n'),
      color: '#ffffff',
      fontSize: 0.07,
      anchor: 'top-left',
      baseline: 'top',
      textAlign: 'left',
      maxWidth: 2.5,
      lineHeight: 1.4
    })
    .addComponent(ParentObject3D, {value: panel})
    .addComponent(Position, {x: -1.25, y: 0.8, z: 0.02});

  // Store reference to text entity for updates
  panel.userData.textEntity = textEntity;
  panel.userData.visible = true;

  return panel;
}

/**
 * Show the help panel
 * @param {THREE.Mesh} panel - The help panel mesh
 */
export function showHelpPanel(panel) {
  if (panel) {
    panel.visible = true;
    panel.userData.visible = true;
  }
}

/**
 * Hide the help panel
 * @param {THREE.Mesh} panel - The help panel mesh
 */
export function hideHelpPanel(panel) {
  if (panel) {
    panel.visible = false;
    panel.userData.visible = false;
  }
}

/**
 * Toggle help panel visibility
 * @param {THREE.Mesh} panel - The help panel mesh
 */
export function toggleHelpPanel(panel) {
  if (panel) {
    if (panel.userData.visible) {
      hideHelpPanel(panel);
    } else {
      showHelpPanel(panel);
    }
  }
}
