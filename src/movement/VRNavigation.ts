import type { Scene } from '@babylonjs/core/scene.js';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';
import { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience';

export interface VRNavigationOptions {
  /** Meshes that count as teleportable floors (default: []) */
  floorMeshes?: AbstractMesh[];
  /** Disable teleportation and use smooth movement instead (default: false) */
  disableTeleportation?: boolean;
  /** Movement speed for smooth movement (default: 4) */
  movementSpeed?: number;
}

export class VRNavigation {
  public xrExperience: WebXRDefaultExperience | null = null;
  public ready: Promise<WebXRDefaultExperience>;

  constructor(
    private scene: Scene,
    options: VRNavigationOptions = {}
  ) {
    const floorMeshes = options.floorMeshes ?? [];

    // Create WebXR experience with floor meshes for teleportation
    this.ready = WebXRDefaultExperience.CreateAsync(scene, {
      floorMeshes: floorMeshes,
      disableTeleportation: options.disableTeleportation ?? false,
      disableDefaultUI: false,
    }).then(xr => {
      this.xrExperience = xr;

      // Set initial height when entering VR
      xr.baseExperience.onInitialXRPoseSetObservable.add((xrCamera) => {
        xrCamera.position.y = 1.6;
      });

      // If teleportation is disabled, enable smooth movement
      if (options.disableTeleportation) {
        const featureManager = xr.baseExperience.featuresManager;
        featureManager.enableFeature(
          'xr-controller-movement',
          'latest',
          {
            xrInput: xr.input,
            movementSpeed: options.movementSpeed ?? 4,
            movementEnabled: true,
            rotationEnabled: true,
            movementOrientationFollowsViewerPose: true,
            movementOrientationFollowsController: false
          }
        );
      }

      return xr;
    });
  }

  /** Add a mesh as a teleportation floor */
  addFloorMesh(mesh: AbstractMesh): void {
    if (this.xrExperience?.teleportation) {
      this.xrExperience.teleportation.addFloorMesh(mesh);
    }
  }

  /** Remove a mesh from teleportation floors */
  removeFloorMesh(mesh: AbstractMesh): void {
    if (this.xrExperience?.teleportation) {
      this.xrExperience.teleportation.removeFloorMesh(mesh);
    }
  }

  dispose(): void {
    if (this.xrExperience?.baseExperience) {
      this.xrExperience.baseExperience.dispose();
    }
  }
}