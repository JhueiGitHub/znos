import * as THREE from "three";
import { Level } from "./Level";

export class PacmanGame {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private animationFrameId: number | null = null;
  private level: Level | null = null;
  private lastTime: number = 0;
  private keys: { [key: string]: boolean } = {};
  private isDisposed: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;

    // Set up key handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  public init(): void {
    // Create the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setClearColor(0x000000);
    this.container.appendChild(this.renderer.domElement);

    // Create the scene
    this.scene = new THREE.Scene();

    // Create the camera
    const aspectRatio =
      this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
    // Camera will be positioned in update method to follow player

    // Add some basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);

    // Create the level
    this.level = new Level(this.scene);
    this.level.load();

    // Handle window resize
    window.addEventListener("resize", this.handleResize.bind(this));

    // Force an initial resize to set up the correct dimensions
    this.handleResize();
  }

  public start(): void {
    // Start the animation loop if not already running
    if (this.animationFrameId === null && !this.isDisposed) {
      this.lastTime = performance.now();
      this.animate();
    }
  }

  public dispose(): void {
    this.isDisposed = true;

    // Stop animation loop
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Remove event listeners
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("resize", this.handleResize);

    // Dispose Three.js resources
    if (this.renderer) {
      this.renderer.dispose();
      const domElement = this.renderer.domElement;
      if (domElement && domElement.parentElement) {
        domElement.parentElement.removeChild(domElement);
      }
      this.renderer = null;
    }

    // Clean up level resources
    if (this.level) {
      this.level.dispose();
      this.level = null;
    }

    // Clear scene
    if (this.scene) {
      this.scene.clear();
      this.scene = null;
    }

    this.camera = null;
  }

  private animate(): void {
    if (this.isDisposed) return;

    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = now;

    this.update(deltaTime);
    this.render();
  }

  private update(deltaTime: number): void {
    if (this.level) {
      this.level.update(deltaTime, this.keys);

      // Update camera to follow player
      if (this.camera && this.level.getPlayer()) {
        const player = this.level.getPlayer();
        const playerMesh = player.getMesh();
        const playerDirection = player.getDirection();

        // Position camera behind player
        const cameraOffset = new THREE.Vector3(
          -playerDirection.x * 3,
          -playerDirection.y * 3,
          5 // Height above the board
        );

        // Set camera position
        this.camera.position.copy(playerMesh.position).add(cameraOffset);

        // Make camera look ahead of player
        const lookAtPosition = playerMesh.position
          .clone()
          .add(
            new THREE.Vector3(playerDirection.x * 5, playerDirection.y * 5, 0)
          );

        this.camera.lookAt(lookAtPosition);
      }
    }
  }

  private render(): void {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    if (!this.renderer || !this.camera) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keys[event.key.toLowerCase()] = true;
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keys[event.key.toLowerCase()] = false;
  }
}
