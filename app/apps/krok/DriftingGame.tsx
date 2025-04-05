// app/apps/drifting/DriftingGame.tsx
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GameStats, CarConfig, TrackConfig } from "./types/game";

// Configuration
const DEFAULT_CAR_CONFIG: CarConfig = {
  maxSpeed: 140,
  acceleration: 10,
  handling: 0.5,
  driftability: 0.8,
  braking: 0.5,
  mass: 1000,
};

const DEFAULT_TRACK_CONFIG: TrackConfig = {
  name: "Circuit",
  difficulty: "medium",
  length: 1000,
  checkpoints: 5,
};

// Textures and materials
const TRACK_COLOR = 0x333333;
const GRASS_COLOR = 0x3e7e41;
const CAR_COLOR = 0xff0000;
const SKY_COLOR = 0x87ceeb;

class DriftingGame {
  // DOM elements
  private container: HTMLElement;

  // Three.js components
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls | null = null;
  private clock: THREE.Clock;

  // Game objects
  private car: THREE.Object3D | null = null;
  private track: THREE.Object3D | null = null;
  private checkpoints: THREE.Object3D[] = [];
  private skybox: THREE.Mesh | null = null;

  // Game state
  private isInitialized: boolean = false;
  private isRunning: boolean = false;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private acceleration: THREE.Vector3 = new THREE.Vector3();
  private rotation: THREE.Vector3 = new THREE.Vector3();
  private speed: number = 0;
  private driftFactor: number = 0;
  private lapTime: number = 0;
  private bestLapTime: number = 0;
  private driftScore: number = 0;
  private lastTimestamp: number = 0;
  private carConfig: CarConfig = DEFAULT_CAR_CONFIG;
  private trackConfig: TrackConfig = DEFAULT_TRACK_CONFIG;

  // Control state
  private keys: { [key: string]: boolean } = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
  };

  // Callback functions
  public onUpdate: ((stats: GameStats) => void) | null = null;
  public onGameOver: (() => void) | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // Set up event listeners
    window.addEventListener("resize", this.handleResize);
  }

  // Initialize the game
  public async init(): Promise<void> {
    // Set up scene
    this.setupLights();
    this.setupSkybox();

    // Load assets
    await Promise.all([this.loadTrack(), this.loadCar()]);

    // Set up camera
    this.camera.position.set(0, 5, -10);
    this.camera.lookAt(0, 0, 0);

    // Set up physics (simplified)
    this.setupPhysics();

    this.isInitialized = true;

    return Promise.resolve();
  }

  // Start the game loop
  public start(): void {
    if (!this.isInitialized) {
      console.error("Game not initialized");
      return;
    }

    this.isRunning = true;
    this.clock.start();
    this.lastTimestamp = performance.now();
    this.animate();
  }

  // Pause the game
  public pause(): void {
    this.isRunning = false;
    this.clock.stop();
  }

  // Resume the game
  public resume(): void {
    this.isRunning = true;
    this.clock.start();
    this.lastTimestamp = performance.now();
    this.animate();
  }

  // Dispose of all resources
  public dispose(): void {
    this.isRunning = false;

    // Remove event listeners
    window.removeEventListener("resize", this.handleResize);

    // Dispose of Three.js resources
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) object.geometry.dispose();

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });

    this.renderer.dispose();

    // Remove canvas from DOM
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }

  // Update control states
  public updateControls(keys: { [key: string]: boolean }): void {
    this.keys = { ...keys };
  }

  // Private methods
  private setupLights(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;

    // Adjust shadow properties for better quality
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 10;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;

    this.scene.add(directionalLight);
  }

  private setupSkybox(): void {
    // Simple skydome
    const geometry = new THREE.SphereGeometry(500, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: SKY_COLOR,
      side: THREE.BackSide,
    });

    this.skybox = new THREE.Mesh(geometry, material);
    this.scene.add(this.skybox);
  }

  private async loadTrack(): Promise<void> {
    // For demo purposes, create a simple track
    return new Promise((resolve) => {
      // Create ground plane
      const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: GRASS_COLOR,
        roughness: 0.8,
        metalness: 0.2,
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      this.scene.add(ground);

      // Create a simple circular track
      const trackRadius = 100;
      const trackWidth = 20;
      const trackGeometry = new THREE.RingGeometry(
        trackRadius - trackWidth / 2,
        trackRadius + trackWidth / 2,
        64
      );
      const trackMaterial = new THREE.MeshStandardMaterial({
        color: TRACK_COLOR,
        roughness: 0.3,
        metalness: 0.4,
      });
      const track = new THREE.Mesh(trackGeometry, trackMaterial);
      track.rotation.x = -Math.PI / 2;
      track.position.y = 0.1; // Slightly above ground to prevent z-fighting
      track.receiveShadow = true;
      this.scene.add(track);

      this.track = track;

      // Add checkpoints
      this.createCheckpoints(trackRadius, 8);

      resolve();
    });
  }

  private createCheckpoints(radius: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const checkpointGeometry = new THREE.BoxGeometry(2, 5, 15);
      const checkpointMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.5,
      });

      const checkpoint = new THREE.Mesh(checkpointGeometry, checkpointMaterial);
      checkpoint.position.set(x, 2.5, z);
      checkpoint.rotation.y = angle + Math.PI / 2;
      checkpoint.castShadow = true;

      this.scene.add(checkpoint);
      this.checkpoints.push(checkpoint);
    }
  }

  private async loadCar(): Promise<void> {
    return new Promise((resolve) => {
      // Create a simple car representation
      const carGeometry = new THREE.BoxGeometry(4, 1.5, 2);
      const carMaterial = new THREE.MeshStandardMaterial({
        color: CAR_COLOR,
        roughness: 0.2,
        metalness: 0.8,
      });

      this.car = new THREE.Mesh(carGeometry, carMaterial);
      this.car.castShadow = true;
      this.car.position.set(0, 1, 0);

      // Add wheels
      this.addWheels(this.car);

      this.scene.add(this.car);
      resolve();
    });
  }

  private addWheels(car: THREE.Object3D): void {
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.5,
    });

    // Adjust rotation for wheel orientation
    wheelGeometry.rotateZ(Math.PI / 2);

    // Position of wheels relative to car
    const wheelPositions = [
      { x: -1.5, y: -0.5, z: 1 }, // Front left
      { x: 1.5, y: -0.5, z: 1 }, // Front right
      { x: -1.5, y: -0.5, z: -1 }, // Rear left
      { x: 1.5, y: -0.5, z: -1 }, // Rear right
    ];

    wheelPositions.forEach((position) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(position.x, position.y, position.z);
      wheel.castShadow = true;
      car.add(wheel);
    });
  }

  private setupPhysics(): void {
    // Simple physics setup - just initializing vectors
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.rotation = new THREE.Vector3();
  }

  private handleResize = (): void => {
    if (!this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = (): void => {
    if (!this.isRunning) return;

    requestAnimationFrame(this.animate);

    const now = performance.now();
    const deltaTime = Math.min((now - this.lastTimestamp) / 1000, 0.1); // Cap at 100ms
    this.lastTimestamp = now;

    this.update(deltaTime);
    this.render();
  };

  private update(deltaTime: number): void {
    if (!this.car) return;

    // Update lap time
    this.lapTime += deltaTime;

    // Process input controls
    this.processControls(deltaTime);

    // Update car physics
    this.updateCarPhysics(deltaTime);

    // Camera follows car
    this.updateCamera();

    // Check for collisions and checkpoints
    this.checkCollisions();

    // Update stats
    if (this.onUpdate) {
      this.onUpdate({
        speed: this.speed,
        lapTime: this.lapTime,
        bestLapTime: this.bestLapTime,
        driftScore: this.driftScore,
      });
    }
  }

  private processControls(deltaTime: number): void {
    // Acceleration and braking
    if (this.keys.ArrowUp) {
      this.acceleration.z = this.carConfig.acceleration;
    } else if (this.keys.ArrowDown) {
      this.acceleration.z = -this.carConfig.braking * 15;
    } else {
      this.acceleration.z = 0;
    }

    // Steering
    if (this.keys.ArrowLeft) {
      this.rotation.y = this.carConfig.handling * 3;
      this.driftFactor = this.keys.Space ? this.carConfig.driftability : 0;
    } else if (this.keys.ArrowRight) {
      this.rotation.y = -this.carConfig.handling * 3;
      this.driftFactor = this.keys.Space ? this.carConfig.driftability : 0;
    } else {
      this.rotation.y = 0;
      this.driftFactor = 0;
    }

    // Drifting (handbrake)
    if (this.keys.Space) {
      // Increase drift score when drifting at speed
      if (Math.abs(this.rotation.y) > 0 && this.speed > 50) {
        this.driftScore += (deltaTime * this.speed) / 10;
      }
    }
  }

  private updateCarPhysics(deltaTime: number): void {
    if (!this.car) return;

    // Update velocity based on acceleration
    this.velocity.z += this.acceleration.z * deltaTime;

    // Apply drag/friction
    const drag = 0.98;
    this.velocity.z *= drag;

    // Limit maximum speed
    const maxSpeedVelocity = this.carConfig.maxSpeed / 10;
    if (this.velocity.z > maxSpeedVelocity) this.velocity.z = maxSpeedVelocity;
    if (this.velocity.z < -maxSpeedVelocity / 2)
      this.velocity.z = -maxSpeedVelocity / 2;

    // Update speed display value (in km/h)
    this.speed = Math.abs(this.velocity.z * 10) * 3.6;

    // Apply rotation
    if (Math.abs(this.velocity.z) > 0.1) {
      // Only allow turning when moving
      this.car.rotation.y +=
        this.rotation.y * deltaTime * Math.sign(this.velocity.z);

      // Apply drift effect
      if (this.driftFactor > 0) {
        // When drifting, we allow more sideways movement
        const driftDirection = this.rotation.y;
        this.velocity.x =
          ((driftDirection * this.speed) / 80) * this.driftFactor;
      } else {
        // Gradually reduce sideways velocity when not drifting
        this.velocity.x *= 0.9;
      }
    } else {
      // Gradually reduce sideways velocity when very slow
      this.velocity.x *= 0.9;
    }

    // Calculate forward direction based on car orientation
    const forwardDirection = new THREE.Vector3(0, 0, 1);
    forwardDirection.applyQuaternion(this.car.quaternion);

    // Calculate sideways direction
    const sidewaysDirection = new THREE.Vector3(1, 0, 0);
    sidewaysDirection.applyQuaternion(this.car.quaternion);

    // Move car
    this.car.position.add(forwardDirection.multiplyScalar(this.velocity.z));
    this.car.position.add(sidewaysDirection.multiplyScalar(this.velocity.x));
  }

  private updateCamera(): void {
    if (!this.car) return;

    // Position camera behind and above car
    const idealOffset = new THREE.Vector3(0, 5, -10);
    idealOffset.applyQuaternion(this.car.quaternion);
    idealOffset.add(this.car.position);

    // Smooth camera movement
    this.camera.position.lerp(idealOffset, 0.05);

    // Look at car
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(this.car.position);
    targetPosition.y += 2; // Look slightly above car

    this.camera.lookAt(targetPosition);
  }

  private checkCollisions(): void {
    if (!this.car) return;

    // Simple collision detection with track boundaries
    const carPosition = this.car.position.clone();

    // Check if car is on track (simplified for demo)
    if (carPosition.length() > 120 || carPosition.length() < 80) {
      // Car is off the track - apply friction/slow down
      this.velocity.z *= 0.95;
    }

    // Simple checkpoint detection
    this.checkpoints.forEach((checkpoint, index) => {
      const distance = checkpoint.position.distanceTo(carPosition);
      if (distance < 10) {
        // Car passed through checkpoint
        // In a real game, we'd track which checkpoints were hit in sequence
      }
    });
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}

export default DriftingGame;
