// game/DriftGame.ts
import * as THREE from "three";
import { Car } from "./Car";
import { Controls } from "./Controls";
import { Environment } from "./Environment";
import { loadAssets, assetManager } from "../assets/config";

export class DriftGame {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private animationFrameId: number | null = null;
  private car: Car | null = null;
  private controls: Controls | null = null;
  private environment: Environment | null = null;
  private audioListener: THREE.AudioListener | null = null;
  private backgroundMusic: THREE.Audio | null = null;
  private clock = new THREE.Clock();
  private isDisposed = false;
  private loadingManager: THREE.LoadingManager;
  private loadingOverlay: HTMLElement | null = null;
  private isLoading = true;

  constructor(container: HTMLElement) {
    this.container = container;
    
    // Set up loading manager
    this.loadingManager = new THREE.LoadingManager();
    
    // Create loading overlay
    this.loadingOverlay = document.createElement('div');
    this.loadingOverlay.className = 'absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-20';
    this.loadingOverlay.innerHTML = `
      <div class="text-white text-xl mb-4">Loading...</div>
      <div class="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div id="progress-bar" class="h-full bg-white rounded-full" style="width: 0%"></div>
      </div>
    `;
    this.container.appendChild(this.loadingOverlay);
  }

  public async init(): Promise<void> {
    try {
      // Check if container is properly size-calculated
      if (this.container.clientWidth === 0 || this.container.clientHeight === 0) {
        console.warn('Container has zero dimensions, this may cause rendering issues but we will continue');
      }
      
      // Load assets first with progress tracking
      try {
        await loadAssets((progress, total) => {
          const progressBar = document.getElementById('progress-bar');
          if (progressBar) {
            progressBar.style.width = `${(progress / total) * 100}%`;
          }
        });
      } catch (e) {
        console.warn('Asset loading encountered issues, but we will proceed:', e);
      }

      // Create renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      // Ensure renderer uses the correct container size
      this.renderer.setSize(
        this.container.clientWidth,
        this.container.clientHeight
      );
      // Force the canvas to fill its container exactly
      const canvas = this.renderer.domElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.position = 'absolute';
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.container.appendChild(this.renderer.domElement);

      // Create audio listener
      this.audioListener = new THREE.AudioListener();
      
      // Create camera
      const aspectRatio = this.container.clientWidth / this.container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
      this.camera.position.set(0, 3, 6); // Initial position behind car
      this.camera.add(this.audioListener);
      
      // Create scene
      this.scene = new THREE.Scene();
      
      // Initialize environment
      try {
        this.environment = new Environment(this.scene);
        await this.environment.init();
      } catch (e) {
        console.warn('Environment initialization encountered issues, but we will proceed:', e);
        // Create a fallback environment with just a ground plane
        if (!this.environment) {
          this.environment = new Environment(this.scene);
        }
        
        // Add a simple ground plane
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x44aa44 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
      }

      // Create car at spawn point
      try {
        this.car = new Car(this.scene);
        await this.car.init();
        
        // Position car at spawn point if available
        try {
          const spawnPoint = this.environment?.getSpawnPoint() || new THREE.Vector3(0, 0.6, 0);
          this.car.setPosition(spawnPoint);
        } catch (e) {
          console.warn('Could not set car position, using default:', e);
          // Use default position
          if (this.car) {
            this.car.setPosition(new THREE.Vector3(0, 0.6, 0));
          }
        }
      } catch (e) {
        console.error('Failed to initialize car:', e);
        throw e; // This is critical, so we still throw
      }

      // Set up controls
      this.controls = new Controls(this.car);
      
      // Play background music
      this.setupAudio();
      
      // Handle window resize
      window.addEventListener("resize", this.handleResize.bind(this));
      
      // Force initial resize
      this.handleResize();
      
      // Hide loading overlay
      if (this.loadingOverlay && this.container.contains(this.loadingOverlay)) {
        this.container.removeChild(this.loadingOverlay);
      }
      this.isLoading = false;
    } catch (error) {
      console.error("Error in game initialization:", error);
      throw error;
    }
  }

  private setupAudio(): void {
    if (!this.audioListener) return;
    
    // Create background music
    this.backgroundMusic = new THREE.Audio(this.audioListener);
    
    // Get audio buffer from asset manager
    const buffer = assetManager.getAudio('GAME_BACKGROUND');
    if (buffer) {
      this.backgroundMusic.setBuffer(buffer);
      this.backgroundMusic.setLoop(true);
      this.backgroundMusic.setVolume(0.3);
      this.backgroundMusic.play();
    }
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

    // Stop audio
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic.disconnect();
    }

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
    
    // Dispose environment
    if (this.environment) {
      this.environment.dispose();
      this.environment = null;
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
    try {
      // Update environment
      if (this.environment) {
        this.environment.update(deltaTime);
      }
      
      if (this.car) {
        // Get collision from environment
        // We explicitly pass null to avoid collision-related errors
        const collisionOctree = null; // Disabling collision for now
        
        // Update car with collision information
        this.car.update(deltaTime, collisionOctree);

        // Update camera to follow car
        if (this.camera) {
          try {
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
          } catch (e) {
            console.warn('Error updating camera:', e);
            // Default camera position as fallback
            if (this.car && this.car.getPosition()) {
              this.camera.position.set(0, 3, 6);
              this.camera.lookAt(this.car.getPosition());
            }
          }
        }

        // Update speed display
        try {
          const speedDisplay = document.getElementById("speed-display");
          if (speedDisplay) {
            speedDisplay.textContent = `Speed: ${Math.floor(this.car.getSpeed())} km/h`;
          }
        } catch (e) {
          console.warn('Error updating speed display:', e);
        }
      }
    } catch (e) {
      console.error('Error in update loop:', e);
      // We don't rethrow here to prevent game from stopping
    }
  }

  private render(): void {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    // Log dimensions for debugging
    console.log('Container dimensions:', {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    });
    
    if (!this.renderer || !this.camera) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
