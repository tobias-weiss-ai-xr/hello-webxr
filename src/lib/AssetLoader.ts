import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader.js';
import type { Scene } from '@babylonjs/core/scene.js';

// Ensure GLTF loader is registered
// @ts-ignore - side-effect import for GLTF loader registration
import '@babylonjs/loaders/glTF';

export interface AssetManifest {
  [key: string]: {
    url: string;
    options?: Record<string, any>;
    loading?: boolean;
  };
}

export function loadAssets(
  scene: Scene,
  basePath: string,
  assets: AssetManifest,
  onComplete?: () => void,
  onProgress?: (loaded: number, total: number) => void,
): void {
  if (basePath && !basePath.endsWith('/')) {
    basePath += '/';
  }

  const keys = Object.keys(assets);
  const total = keys.length;
  let loaded = 0;

  const checkComplete = () => {
    loaded++;
    if (onProgress) onProgress(loaded, total);
    if (loaded >= total && onComplete) onComplete();
  };

  for (const assetId of keys) {
    const asset = assets[assetId];
    const assetPath = basePath + asset.url;
    const ext = asset.url.split('.').pop()?.toLowerCase() ?? '';

    switch (ext) {
      case 'gltf':
      case 'glb':
        SceneLoader.ImportMeshAsync('', basePath, asset.url, scene).then(result => {
          (assets as Record<string, any>)[assetId] = result;
          checkComplete();
        }).catch(e => {
          console.warn(`[AssetLoader] Failed to load ${asset.url}:`, e);
          (assets as Record<string, any>)[assetId] = null;
          checkComplete();
        });
        break;

      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
      case 'gif':
        loadTexture(basePath, asset.url, assets, assetId).then(checkComplete).catch(() => {
          (assets as Record<string, any>)[assetId] = null;
          checkComplete();
        });
        break;

      default:
        console.warn(`[AssetLoader] Unknown asset type: ${ext} for ${asset.url}`);
        (assets as Record<string, any>)[assetId] = null;
        checkComplete();
    }
  }
}

async function loadTexture(
  basePath: string,
  url: string,
  assets: AssetManifest,
  assetId: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      (assets as Record<string, any>)[assetId] = img;
      resolve();
    };
    img.onerror = () => reject(new Error(`Failed to load texture: ${url}`));
    img.src = basePath + url;
  });
}
