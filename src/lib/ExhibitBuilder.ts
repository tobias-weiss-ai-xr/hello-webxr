import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math.js';
import { ActionManager, ExecuteCodeAction } from '@babylonjs/core/Actions/index.js';
import { AdvancedDynamicTexture, TextBlock, Rectangle } from '@babylonjs/gui/2D/index.js';
import { AbstractMesh, TransformNode } from '@babylonjs/core/index.js';
import type { Scene } from '@babylonjs/core/scene.js';
import type { AppContext, ElementData } from '../types/index.js';
import { GROUP_COLORS } from '../data/elements.js';

export interface ExhibitArtifacts {
  description: string;
}

export interface ExhibitOptions {
  position: Vector3;
  element: ElementData;
  artifacts: ExhibitArtifacts;
  onExplore: () => void;
}

export class ExhibitBuilder {
  private scene: Scene;
  private ctx: AppContext;
  private uiTexture: AdvancedDynamicTexture;

  constructor(scene: Scene, ctx: AppContext, uiTexture: AdvancedDynamicTexture) {
    this.scene = scene;
    this.ctx = ctx;
    this.uiTexture = uiTexture;
  }

  buildExhibit(options: ExhibitOptions): {
    base: AbstractMesh;
    glassCase: AbstractMesh;
    atomGroup: TransformNode;
    artifacts: AbstractMesh[];
    exploreButton: AbstractMesh;
  } {
    const { position, element, artifacts, onExplore } = options;

    const base = this.createBase(position, element);
    const glassCase = this.createGlassCase(position.add(new Vector3(0, 0.3, 0)));
    const atomGroup = this.createAtomModel(position.add(new Vector3(0, 0.6, 0)), element);
    const artifactMeshes = this.createArtifacts(position.add(new Vector3(0, 1.2, 0)), artifacts, element);
    this.createInfoPanel(glassCase, element);
    const exploreButton = this.createExploreButton(position.add(new Vector3(0, 0.2, 0.8)), element, onExplore);

    return { base, glassCase, atomGroup, artifacts: artifactMeshes, exploreButton };
  }

  private createBase(position: Vector3, element: ElementData): AbstractMesh {
    const color = typeof element.color === 'number' ? element.color : GROUP_COLORS[element.group as keyof typeof GROUP_COLORS] || 0x888888;

    const baseMat = new StandardMaterial('exhibitBaseMat', this.scene);
    baseMat.diffuseColor = this.toColor3(color);
    baseMat.emissiveColor = this.toColor3(color).scale(0.3);
    baseMat.specularColor = new Color3(0.2, 0.2, 0.2);

    const base = MeshBuilder.CreateCylinder('exhibitBase', {
      diameter: 1.5,
      height: 0.1,
      tessellation: 6
    }, this.scene);
    base.position = position;
    base.material = baseMat;
    this.ctx.trackMesh(base);

    return base;
  }

  private createGlassCase(position: Vector3): AbstractMesh {
    const glassMat = new StandardMaterial('exhibitGlassMat', this.scene);
    glassMat.diffuseColor = new Color3(0.8, 0.85, 0.9);
    glassMat.alpha = 0.2;
    glassMat.specularColor = Color3.White();
    glassMat.backFaceCulling = false;

    const glassCase = MeshBuilder.CreateBox('exhibitGlass', {
      width: 1,
      height: 1.2,
      depth: 1
    }, this.scene);
    glassCase.position = position;
    glassCase.material = glassMat;
    this.ctx.trackMesh(glassCase);

    return glassCase;
  }

  private createAtomModel(position: Vector3, element: ElementData): TransformNode {
    const atomGroup = new TransformNode('atomModel_' + element.symbol, this.scene);
    atomGroup.position = position;
    this.ctx.trackNode(atomGroup);

    const color = typeof element.color === 'number' ? element.color : GROUP_COLORS[element.group as keyof typeof GROUP_COLORS] || 0x888888;
    const nucleusMat = new StandardMaterial('nucleusMat', this.scene);
    nucleusMat.diffuseColor = this.toColor3(color);
    nucleusMat.emissiveColor = this.toColor3(color);

    const nucleus = MeshBuilder.CreateSphere('nucleus', { diameter: 0.15 }, this.scene);
    nucleus.material = nucleusMat;
    nucleus.parent = atomGroup;
    this.ctx.trackMesh(nucleus);

    const electronCount = Math.min(element.period, 4);
    const electronMat = new StandardMaterial('electronMat', this.scene);
    electronMat.diffuseColor = Color3.White();
    electronMat.emissiveColor = Color3.White();

    for (let i = 0; i < electronCount; i++) {
      const angle = (Math.PI * 2 * i) / electronCount;
      const orbitRadius = 0.25 + (i * 0.1);
      const orbit = MeshBuilder.CreateTorus(`orbit_${i}`, { diameter: orbitRadius * 2, thickness: 0.01 }, this.scene);
      orbit.rotation.x = Math.PI / 2;
      orbit.rotation.y = (Math.PI / 4) * i;
      orbit.material = nucleusMat;
      orbit.parent = atomGroup;
      this.ctx.trackMesh(orbit);

      const electron = MeshBuilder.CreateSphere(`electron_${i}`, { diameter: 0.04 }, this.scene);
      electron.position.x = Math.cos(angle) * orbitRadius;
      electron.material = electronMat;
      electron.parent = atomGroup;
      electron.metadata = { angle, orbitRadius, speed: 2 / (element.period * 0.5) };
      this.ctx.trackMesh(electron);
    }

    atomGroup.metadata = { element, electrons: atomGroup.getChildren().filter(m => m.name?.startsWith('electron_')) };

    return atomGroup;
  }

  private createArtifacts(position: Vector3, artifacts: ExhibitArtifacts, element: ElementData): AbstractMesh[] {
    const artifactMeshes: AbstractMesh[] = [];
    const artifactItems = artifacts.description.split(',').map(s => s.trim());

    artifactItems.forEach((item, i) => {
      const artifactMat = new StandardMaterial(`artifactMat_${i}`, this.scene);
      artifactMat.diffuseColor = new Color3(0.9, 0.9, 0.85);
      artifactMat.emissiveColor = new Color3(0.1, 0.1, 0.08);

      const artifact = MeshBuilder.CreateBox(`artifact_${element.symbol}_${i}`, {
        width: 0.15 + (i % 3) * 0.05,
        height: 0.2 + ((i + 1) % 3) * 0.05,
        depth: 0.15 + ((i + 2) % 3) * 0.05
      }, this.scene);
      artifact.position = position.add(new Vector3(
        (i - 1) * 0.25,
        Math.sin(i * 1.5) * 0.1,
        0
      ));
      artifact.material = artifactMat;
      artifact.metadata = { description: item };
      this.ctx.trackMesh(artifact);
      artifactMeshes.push(artifact);
    });

    return artifactMeshes;
  }

  private createInfoPanel(mesh: AbstractMesh, element: ElementData): void {
    const symbolLabel = new TextBlock(`symbol_${element.symbol}`, element.symbol);
    symbolLabel.color = 'white';
    symbolLabel.fontSize = 28;
    symbolLabel.fontWeight = 'bold';
    this.uiTexture.addControl(symbolLabel);
    symbolLabel.linkWithMesh(mesh);
    symbolLabel.linkOffsetY = -50;

    const nameLabel = new TextBlock(`name_${element.symbol}`, element.name);
    nameLabel.color = 'white';
    nameLabel.fontSize = 16;
    nameLabel.fontWeight = 'bold';
    this.uiTexture.addControl(nameLabel);
    nameLabel.linkWithMesh(mesh);
    nameLabel.linkOffsetY = -20;

    const descLabel = new TextBlock(`desc_${element.symbol}`, element.description.substring(0, 50) + '...');
    descLabel.color = '#cccccc';
    descLabel.fontSize = 12;
    descLabel.textWrapping = true;
    descLabel.width = 1.8;
    this.uiTexture.addControl(descLabel);
    descLabel.linkWithMesh(mesh);
    descLabel.linkOffsetY = 40;
  }

  private createExploreButton(position: Vector3, element: ElementData, onClick: () => void): AbstractMesh {
    const buttonMat = new StandardMaterial('exploreButtonMat', this.scene);
    buttonMat.diffuseColor = new Color3(0, 0.6, 0.9);
    buttonMat.emissiveColor = new Color3(0, 0.4, 0.6);

    const button = MeshBuilder.CreateCylinder('exploreButton', {
      diameter: 0.5,
      height: 0.05,
      tessellation: 32
    }, this.scene);
    button.position = position;
    button.rotation.x = Math.PI / 2;
    button.material = buttonMat;
    button.metadata = { element, onClick };
    this.ctx.trackMesh(button);

    const label = new TextBlock('exploreLabel', 'Explore');
    label.color = 'white';
    label.fontSize = 12;
    label.fontWeight = 'bold';
    this.uiTexture.addControl(label);
    label.linkWithMesh(button);

    button.actionManager = new ActionManager(this.scene);
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        button.scaling.setAll(1.1);
      })
    );
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        button.scaling.setAll(1);
      })
    );
    button.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, onClick)
    );

    return button;
  }

  private toColor3(color: number): Color3 {
    return Color3.FromInts((color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
  }
}