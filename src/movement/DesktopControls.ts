import type { Scene } from '@babylonjs/core/scene.js';
import type { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera.js';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Collider } from '@babylonjs/core/Collisions/collider.js';

export interface DesktopControlsOptions {
  /** Maximum movement speed in units/second (default: 4) */
  maxSpeed?: number;
  /** Acceleration in units/second² (default: 12) */
  acceleration?: number;
  /** Deceleration (friction) when no input (default: 8) */
  deceleration?: number;
}

export class DesktopControls {
  private velocity = Vector3.Zero();
  private inputDirection = Vector3.Zero();
  private maxSpeed: number;
  private accel: number;
  private decel: number;
  private keys = new Set<string>();
  private observer: ReturnType<Scene['onBeforeRenderObservable']['add']> | null = null;
  private collider: Collider;

  constructor(
    private camera: UniversalCamera,
    private scene: Scene,
    options: DesktopControlsOptions = {}
  ) {
    this.maxSpeed = options.maxSpeed ?? 4;
    this.accel = options.acceleration ?? 12;
    this.decel = options.deceleration ?? 8;

    this.collider = new Collider();

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.update = this.update.bind(this);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.observer = scene.onBeforeRenderObservable.add(this.update);
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.keys.add(e.code);
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keys.delete(e.code);
  }

  private update(): void {
    this.inputDirection.set(0, 0, 0);

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) this.inputDirection.z += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) this.inputDirection.z -= 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) this.inputDirection.x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) this.inputDirection.x += 1;

    const hasInput = this.inputDirection.lengthSquared() > 0;
    const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
    const cameraForward = this.camera.getDirection(Vector3.Forward());
    cameraForward.y = 0;
    cameraForward.normalize();
    const cameraRight = this.camera.getDirection(Vector3.Right());
    cameraRight.y = 0;
    cameraRight.normalize();

    if (hasInput) {
      const moveDir = cameraForward
        .scale(this.inputDirection.z)
        .add(cameraRight.scale(this.inputDirection.x));
      moveDir.normalize();

      this.velocity.addInPlace(moveDir.scale(this.accel * deltaTime));
      if (this.velocity.length() > this.maxSpeed) {
        this.velocity.normalize().scaleInPlace(this.maxSpeed);
      }
    } else {
      if (this.velocity.length() > 0.01) {
        this.velocity.scaleInPlace(Math.max(0, 1 - this.decel * deltaTime));
      } else {
        this.velocity.set(0, 0, 0);
      }
    }

    // Use scene collision coordinator so walls/floors block movement
    const displacement = this.velocity.scale(deltaTime);
    const coordinator = this.scene.collisionCoordinator;

    // Initialize collider with camera ellipsoid
    this.collider._initialize(this.camera.position, displacement, 0.001);
    this.collider._radius = this.camera.ellipsoid;

    coordinator.getNewPosition(
      this.camera.position,
      displacement,
      this.collider,
      3,
      null,
      (_collisionIndex: number, newPosition: Vector3, _collidedMesh: AbstractMesh | null) => {
        this.camera.position.copyFrom(newPosition);
      },
      0,
      true
    );
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    if (this.observer) {
      this.scene.onBeforeRenderObservable.remove(this.observer);
      this.observer = null;
    }
  }
}