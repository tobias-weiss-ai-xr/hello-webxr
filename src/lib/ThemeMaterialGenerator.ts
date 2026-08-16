import type { Scene } from '@babylonjs/core/scene.js';
import type { Texture } from '@babylonjs/core/Materials/Textures/texture.js';
import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { StandardMaterial as StdMat } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import type { Theme } from '../types/index.js';

/**
 * Generates theme-specific materials while reusing base textures.
 * Limits unique materials to maintain performance (max 12 per scene).
 */
export class ThemeMaterialGenerator {
  private textureCache: Map<string, Texture> = new Map();
  private materialCache: Map<string, StdMat> = new Map();
  
  constructor(private scene: Scene) {}
  
  /**
   * Get or load a base texture
   */
  private getTexture(textureKey: string): Texture | null {
    if (this.textureCache.has(textureKey)) {
      return this.textureCache.get(textureKey)!;
    }
    
    // For now, return null - textures will be added in future phases
    // This maintains the pattern without requiring asset files yet
    return null;
  }
  
  /**
   * Generate wall material for a theme
   */
  generateWallMaterial(theme: Theme): StdMat {
    const cacheKey = `wall_${theme.id}`;
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!;
    }
    
    const material = new StdMat(cacheKey, this.scene);
    material.diffuseColor = theme.baseColor;
    material.specularColor = new Color3(0.05, 0.05, 0.05);
    material.emissiveColor = theme.accentColor.scale(0.05);
    
    this.materialCache.set(cacheKey, material);
    return material;
  }
  
  /**
   * Generate floor material for a theme
   */
  generateFloorMaterial(theme: Theme): StdMat {
    const cacheKey = `floor_${theme.id}`;
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!;
    }
    
    const material = new StdMat(cacheKey, this.scene);
    material.diffuseColor = theme.baseColor.scale(0.9);
    material.specularColor = new Color3(0.1, 0.1, 0.1);
    material.emissiveColor = theme.accentColor.scale(0.02);
    
    this.materialCache.set(cacheKey, material);
    return material;
  }
  
  /**
   * Generate ceiling material for a theme
   */
  generateCeilingMaterial(theme: Theme): StdMat {
    const cacheKey = `ceiling_${theme.id}`;
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!;
    }
    
    const material = new StdMat(cacheKey, this.scene);
    material.diffuseColor = theme.baseColor.scale(0.7);
    material.emissiveColor = new Color3(0, 0, 0);
    
    this.materialCache.set(cacheKey, material);
    return material;
  }
  
  /**
   * Generate doorway frame material for a theme
   */
  generateDoorwayFrameMaterial(theme: Theme): StdMat {
    const cacheKey = `doorway_${theme.id}`;
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!;
    }
    
    const material = new StdMat(cacheKey, this.scene);
    material.emissiveColor = theme.accentColor.scale(0.3);
    material.alpha = 0.6;
    material.disableLighting = true;
    
    this.materialCache.set(cacheKey, material);
    return material;
  }
  
  /**
   * Clean up cached materials and textures
   */
  dispose(): void {
    this.textureCache.forEach(texture => texture.dispose());
    this.textureCache.clear();
    
    this.materialCache.forEach(material => material.dispose());
    this.materialCache.clear();
  }
}