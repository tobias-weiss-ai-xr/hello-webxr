/**
 * RoomComparisonManager - Handles element comparison UI and state
 * 
 * Provides mesh-based UI (no Troika text) to avoid font loading issues
 * while maintaining compatibility with existing info panel text entities
 */
import * as THREE from 'three';
import { Text, Position, ParentObject3D } from '../components/index.js';

export default {
  /**
   * Create comparison button
   * @param {THREE.Scene} scene - Scene to add button to
   * @param {Object} position - {x, y, z} position
   * @param {number} color - Button color
   * @returns {THREE.Mesh} Button mesh
   */
  createCompareButton(scene, position, color) {
    const btnGeo = new THREE.BoxGeometry(0.8, 0.3, 0.05);
    const btnMat = new THREE.MeshBasicMaterial({
      color: color || 0x4a90e2,
      transparent: true,
      opacity: 0.8
    });
    const compareBtn = new THREE.Mesh(btnGeo, btnMat);
    compareBtn.position.set(position.x, position.y, position.z);
    compareBtn.name = 'compareButton';
    compareBtn.userData.compareButton = true;
    scene.add(compareBtn);
    return compareBtn;
  },
  
  /**
   * Create selector panel with element grid
   * @param {Object} ctx - Application context
   * @param {THREE.Scene} scene - Scene to add panel to
   * @param {Array} elements - Element data array
   * @returns {THREE.Group} Panel group with cleanup method
   */
  createSelectorPanel(ctx, scene, elements, onSelect) {
    const panelGroup = new THREE.Group();
    
    // Panel background
    const panelGeo = new THREE.BoxGeometry(6, 7, 0.1);
    const panelMat = new THREE.MeshBasicMaterial({
      color: 0x2a2a3a,
      transparent: true,
      opacity: 0.95
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(-3, 0.5, 0);
    panelGroup.add(panel);
    
    // Title plate (colored mesh, NO text entity)
    const titleGeo = new THREE.PlaneGeometry(5.8, 0.6);
    const titleMat = new THREE.MeshBasicMaterial({color: 0xFFC107});
    const titlePlate = new THREE.Mesh(titleGeo, titleMat);
    titlePlate.position.set(0, 3.2, 0.06);
    panelGroup.add(titlePlate);
    
    // Create element buttons grid (8x4 = 32 buttons)
    const buttons = [];
    const gridSize = { rows: 4, cols: 8 };
    const buttonSize = { width: 0.6, height: 0.4 };
    const spacing = { x: 0.65, y: 0.45 };
    const startPos = { x: -2.2, y: 2.0 };
    
    elements.slice(0, 32).forEach((element, index) => {
      const btnGeo = new THREE.BoxGeometry(buttonSize.width, buttonSize.height, 0.05);
      const btnMat = new THREE.MeshBasicMaterial({
        color: element.color,
        transparent: true,
        opacity: 0.7
      });
      const button = new THREE.Mesh(btnGeo, btnMat);
      
      const col = index % gridSize.cols;
      const row = Math.floor(index / gridSize.cols);
      button.position.set(
        startPos.x + col * spacing.x,
        startPos.y - row * spacing.y,
        0.05
      );
      
      button.userData = {
        elementSymbol: element.symbol,
        elementName: element.name,
        atomicNumber: element.atomicNumber
      };
      
      panelGroup.add(button);
      buttons.push(button);
    });
    
    // Close button
    const closeBtnGeo = new THREE.BoxGeometry(2, 0.4, 0.05);
    const closeBtnMat = new THREE.MeshBasicMaterial({color: 0x666666});
    const closeBtn = new THREE.Mesh(closeBtnGeo, closeBtnMat);
    closeBtn.position.set(0, -2.8, 0.05);
    closeBtn.userData = { closePanel: true };
    panelGroup.add(closeBtn);
    buttons.push(closeBtn);
    
    panelGroup.userData = {
      buttons: buttons,
      cleanup: () => {
        if (panelGroup.parent) {
          panelGroup.parent.remove(panelGroup);
        }
      }
    };
    
    scene.add(panelGroup);
    return panelGroup;
  },
  
  /**
   * Update info panel to show comparison
   * @param {THREE.Mesh} infoPanelMesh - Info panel mesh
   * @param {Object} currentElement - Current room element
   * @param {Object} selectedElement - Selected comparison element
   */
  updateInfoPanel(infoPanelMesh, currentElement, selectedElement) {
    if (!infoPanelMesh || !infoPanelMesh.userData.textEntities) return;
    
    const titleEntity = infoPanelMesh.userData.textEntities[0];
    const descEntity = infoPanelMesh.userData.textEntities[1];
    
    if (titleEntity && titleEntity.hasComponent(Text)) {
      const titleComp = titleEntity.getComponent(Text);
      titleComp.text = `${currentElement.symbol} vs. ${selectedElement.symbol}`;
      titleComp.fontSize = 0.12;
      titleEntity.addComponent(Text, titleComp);
    }
    
    if (descEntity && descEntity.hasComponent(Text)) {
      const descComp = descEntity.getComponent(Text);
      descComp.text = this.formatComparisonText(currentElement, selectedElement);
      descComp.fontSize = 0.06;
      descEntity.addComponent(Text, descComp);
    }
  },
  
  formatComparisonText(el1, el2) {
    return `Atomic Numbers:
${el1.atomicNumber} vs. ${el2.atomicNumber}

Mass:
${el1.mass} vs. ${el2.mass}

Group:
${el1.group} vs. ${el2.group}

Period:
${el1.period} vs. ${el2.period}

Electron Configuration:
${el1.electronConfiguration.join(', ')}
vs.
${el2.electronConfiguration.join(', ')}`;
  },
  
  /**
   * Cleanup all comparison UI
   * @param {THREE.Scene} scene - Scene containing UI
   * @param {Object} comparisonManager - State object
   */
  cleanup(scene, comparisonManager) {
    if (comparisonManager.selectorPanel) {
      comparisonManager.selectorPanel.userData.cleanup();
      comparisonManager.selectorPanel = null;
    }
    comparisonManager.selectedElement = null;
  }
};
