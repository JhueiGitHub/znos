// game/DriftGame.ts
import * as THREE from "three";
import { Car } from "./Car";
import { Controls } from "./Controls";
import { loadAssets } from "../assets/config";

export class DriftGame {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private animationFrameId: number | null = null;
  private car: Car | null = null;
  private controls: Controls | null = null;
  private clock = new THREE.Clock();
  private isDisposed = false;
  private assets: Record<string, any> = {};

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public async init(): Promise<void> {
    // Load assets first
    this.assets = await loadAssets();

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Create scene with fog
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x88ccee, 0, 300);

    // Create camera
    const aspectRatio =
      this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
    this.camera.position.set(0, 3, 6); // Initial position behind car

    // Add lighting
    const hemisphere = new THREE.HemisphereLight(0x4488bb, 0x002244, 0.5);
    this.scene.add(hemisphere);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 40, 150);
    directionalLight.castShadow = true;
    // Configure shadow properties...
    this.scene.add(directionalLight);

    // Create simple ground plane for testing
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshStandardMaterial({ color: 0x44aa44 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Create skybox
    this.createSkybox();

    // Create car
    this.car = new Car(this.scene, this.assets);
    await this.car.init();

    // Set up controls
    this.controls = new Controls(this.car);

    // Handle window resize
    window.addEventListener("resize", this.handleResize.bind(this));

    // Force initial resize
    this.handleResize();
  }

  private createSkybox(): void {
    if (!this.scene) return;

    const skyboxTextures = [
      this.assets.textures.skybox.right,
      this.assets.textures.skybox.left,
      this.assets.textures.skybox.up,
      this.assets.textures.skybox.down,
      this.assets.textures.skybox.front,
      this.assets.textures.skybox.back,
    ];

    const skyboxCubeMap = new THREE.CubeTextureLoader().load(skyboxTextures);
    this.scene.background = skyboxCubeMap;
  }

  public start(): void {
    if (this.animationFrameId === null && !this.isDisposed) {
      this.clock.start();
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
    window.removeEventListener("resize", this.handleResize);

    // Dispose controls
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    // Dispose car
    if (this.car) {
      this.car.dispose();
      this.car = null;
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      const domElement = this.renderer.domElement;
      if (domElement && domElement.parentElement) {
        domElement.parentElement.removeChild(domElement);
      }
      this.renderer = null;
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

    const deltaTime = this.clock.getDelta();
    this.update(deltaTime);
    this.render();
  }

  private update(deltaTime: number): void {
    if (this.car) {
      this.car.update(deltaTime);

      // Update camera to follow car
      if (this.camera) {
        const carPosition = this.car.getPosition();
        const carDirection = this.car.getDirection();

        // Position camera behind car
        const cameraHeight = 2;
        const cameraDistance = 6;

        const cameraOffset = new THREE.Vector3(
          -carDirection.x * cameraDistance,
          cameraHeight,
          -carDirection.z * cameraDistance
        );

        // Set camera position with smoothing
        this.camera.position.lerp(carPosition.clone().add(cameraOffset), 0.1);

        // Make camera look at car position
        this.camera.lookAt(carPosition);
      }

      // Update speed display
      const speedDisplay = document.getElementById("speed-display");
      if (speedDisplay) {
        speedDisplay.textContent = `Speed: ${Math.floor(this.car.getSpeed())} km/h`;
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
}
