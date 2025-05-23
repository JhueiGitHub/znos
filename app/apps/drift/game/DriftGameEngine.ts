// /app/apps/drift/game/DriftGameEngine.ts
// INDIVIDUAL GAME ENGINE - Extends the Universal foundation

import * as THREE from 'three';
import { UniversalGameEngine, UniversalAssetManager, GameConfiguration } from '@/app/components/arcade';
import { CAR_CONFIGS, TRACK_CONFIGS } from '../config/assets';

export class DriftGameEngine extends UniversalGameEngine {
  // Game-specific components
  private car: THREE.Group | null = null;
  private track: THREE.Group | null = null;
  private collisionTrack: THREE.Group | null = null;
  private wheels: THREE.Object3D[] = [];
  
  // Game state
  private carPosition = new THREE.Vector3(0, 0, 0);
  private carRotation = 0;
  private carSpeed = 0;
  private carVelocity = new THREE.Vector3();
  
  // Controls
  private keys = {
    forward: false,
    backward: false,
    left: false,
    right: false
  };

  constructor(container: HTMLElement, config: GameConfiguration) {
    super(container, config);
    this.setupControls();
  }

  // ===== IMPLEMENT UNIVERSAL METHODS =====

  protected async initializeScene(): Promise<void> {
    if (!this.scene) throw new Error('Scene not initialized');

    console.log('🏎️ Initializing Drift Game Scene...');

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);

    // Add lighting
    this.setupLighting();

    // Create skybox  
    await this.createSkybox();

    // Load and setup track
    await this.setupTrack();

    // Load and setup car
    await this.setupCar();

    console.log('✅ Drift Game Scene Ready!');
  }

  protected updateGame(deltaTime: number): void {
    // Update car physics
    this.updateCarPhysics(deltaTime);
    
    // Update car visual position
    this.updateCarVisuals();
    
    // Update camera to follow car
    this.updateCamera();
    
    // Update wheel animations
    this.updateWheels(deltaTime);
  }

  protected handleResize(): void {
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  protected disposeGame(): void {
    // Remove event listeners
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    
    // Clean up game objects
    if (this.car) {
      this.scene?.remove(this.car);
      this.car = null;
    }
    
    if (this.track) {
      this.scene?.remove(this.track);
      this.track = null;
    }
    
    if (this.collisionTrack) {
      this.scene?.remove(this.collisionTrack);
      this.collisionTrack = null;
    }
    
    this.wheels = [];
  }

  // ===== GAME-SPECIFIC METHODS =====

  private setupLighting(): void {
    if (!this.scene) return;

    // Hemisphere light for natural outdoor lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x362D1D, 0.6);
    this.scene.add(hemisphereLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xFFE5B4, 1.2);
    directionalLight.position.set(120, 60, 80);
    directionalLight.castShadow = true;
    
    // Shadow configuration
    const shadowMapSize = 2048;
    const shadowDistance = 150;
    
    directionalLight.shadow.mapSize.width = shadowMapSize;
    directionalLight.shadow.mapSize.height = shadowMapSize;
    directionalLight.shadow.radius = 3;
    directionalLight.shadow.bias = -0.0001;
    directionalLight.shadow.camera.top = shadowDistance;
    directionalLight.shadow.camera.bottom = -shadowDistance;
    directionalLight.shadow.camera.left = -shadowDistance;
    directionalLight.shadow.camera.right = shadowDistance;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 400;
    
    this.scene.add(directionalLight);

    // Ambient light for overall brightness
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
  }

  private async createSkybox(): Promise<void> {
    if (!this.scene) return;

    try {
      const assetManager = UniversalAssetManager.getInstance();
      
      // Load skybox textures
      const skyboxTextures = [
        assetManager.getAsset('skybox-right'),
        assetManager.getAsset('skybox-left'), 
        assetManager.getAsset('skybox-up'),
        assetManager.getAsset('skybox-down'),
        assetManager.getAsset('skybox-front'),
        assetManager.getAsset('skybox-back')
      ];

      if (skyboxTextures.every(tex => tex)) {
        const cubeTexture = new THREE.CubeTextureLoader().load([
          assetManager.getAsset('skybox-right').image.src,
          assetManager.getAsset('skybox-left').image.src,
          assetManager.getAsset('skybox-up').image.src,
          assetManager.getAsset('skybox-down').image.src,
          assetManager.getAsset('skybox-front').image.src,
          assetManager.getAsset('skybox-back').image.src
        ]);
        
        this.scene.background = cubeTexture;
        console.log('🌅 Skybox created');
      } else {
        // Fallback to solid color
        this.scene.background = new THREE.Color(0x87CEEB);
        console.log('🌅 Using fallback skybox color');
      }
    } catch (error) {
      console.warn('Failed to create skybox:', error);
      this.scene.background = new THREE.Color(0x87CEEB);
    }
  }

  private async setupTrack(): Promise<void> {
    if (!this.scene) return;

    const assetManager = UniversalAssetManager.getInstance();
    
    try {
      // Load visual track
      const trackModel = assetManager.getAsset('drift-track-visual');
      if (trackModel) {
        this.track = trackModel.scene.clone();
        
        // Process track materials
        this.track.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            if (child.material.map) {
              child.material.map.anisotropy = 4;
            }
          }
        });
        
        this.scene.add(this.track);
        console.log('🏁 Visual track loaded');
      }
      
      // Load collision track (invisible)
      const collisionModel = assetManager.getAsset('drift-track-collision');
      if (collisionModel) {
        this.collisionTrack = collisionModel.scene.clone();
        this.collisionTrack.visible = false; // Hidden but used for physics
        this.scene.add(this.collisionTrack);
        console.log('🏁 Collision track loaded');
      }
      
    } catch (error) {
      console.warn('Failed to load track, using fallback ground:', error);
      this.createFallbackGround();
    }
  }

  private createFallbackGround(): void {
    if (!this.scene) return;

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ 
        color: 0x666666,
        roughness: 0.8,
        metalness: 0.1
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    console.log('🏁 Fallback ground created');
  }

  private async setupCar(): Promise<void> {
    if (!this.scene) return;

    const assetManager = UniversalAssetManager.getInstance();
    
    try {
      const carModel = assetManager.getAsset('drift-car');
      if (!carModel) {
        throw new Error('Car model not found');
      }

      this.car = carModel.clone();
      
      // Apply car configuration
      const config = CAR_CONFIGS.drift_car;
      this.car.scale.set(config.scale.x, config.scale.y, config.scale.z);
      this.car.position.set(config.offset.x, config.offset.y, config.offset.z);
      
      // Apply car texture
      const carTexture = assetManager.getAsset('car-texture-yellow');
      if (carTexture) {
        this.car.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({ map: carTexture });
            child.castShadow = true;
          }
        });
      }
      
      // Find and store wheel references
      this.car.traverse((child) => {
        if (child.name.toLowerCase().includes('wheel')) {
          this.wheels.push(child);
        }
      });
      
      // Position car at spawn point
      const spawnPoint = TRACK_CONFIGS.drift_track.spawnPoints[0];
      this.carPosition.set(spawnPoint.x, spawnPoint.y, spawnPoint.z);
      this.car.position.copy(this.carPosition);
      
      this.scene.add(this.car);
      console.log(`🚗 Car loaded with ${this.wheels.length} wheels`);
      
    } catch (error) {
      console.error('Failed to load car:', error);
      this.createFallbackCar();
    }
  }

  private createFallbackCar(): void {
    if (!this.scene) return;

    // Simple box car as fallback
    this.car = new THREE.Group();
    
    const carBody = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.5, 4),
      new THREE.MeshStandardMaterial({ color: 0xff4444 })
    );
    carBody.position.y = 0.25;
    carBody.castShadow = true;
    this.car.add(carBody);
    
    this.car.position.copy(this.carPosition);
    this.scene.add(this.car);
    
    console.log('🚗 Fallback car created');
  }

  private setupControls(): void {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
    }
  };

  private updateCarPhysics(deltaTime: number): void {
    const config = CAR_CONFIGS.drift_car.physics;
    
    // Handle acceleration/braking
    if (this.keys.forward) {
      this.carSpeed = Math.min(this.carSpeed + config.acceleration * deltaTime, config.maxSpeed);
    } else if (this.keys.backward) {
      this.carSpeed = Math.max(this.carSpeed - config.brakeForce * deltaTime, -config.maxSpeed * 0.5);
    } else {
      // Natural deceleration
      this.carSpeed *= 0.95;
    }
    
    // Handle turning (only when moving)
    if (Math.abs(this.carSpeed) > 0.1) {
      if (this.keys.left) {
        this.carRotation += config.turnSpeed * Math.sign(this.carSpeed) * deltaTime * 60;
      }
      if (this.keys.right) {
        this.carRotation -= config.turnSpeed * Math.sign(this.carSpeed) * deltaTime * 60;
      }
    }
    
    // Update velocity based on rotation
    this.carVelocity.set(
      Math.sin(this.carRotation) * this.carSpeed,
      0,
      Math.cos(this.carRotation) * this.carSpeed
    );
    
    // Update position
    this.carPosition.add(this.carVelocity.clone().multiplyScalar(deltaTime));
  }

  private updateCarVisuals(): void {
    if (!this.car) return;
    
    this.car.position.copy(this.carPosition);
    this.car.rotation.y = this.carRotation;
  }

  private updateCamera(): void {
    if (!this.camera || !this.car) return;
    
    // Follow camera behind car
    const cameraDistance = 8;
    const cameraHeight = 3;
    
    const cameraPosition = new THREE.Vector3(
      this.carPosition.x - Math.sin(this.carRotation) * cameraDistance,
      this.carPosition.y + cameraHeight,
      this.carPosition.z - Math.cos(this.carRotation) * cameraDistance
    );
    
    // Smooth camera movement
    this.camera.position.lerp(cameraPosition, 0.1);
    this.camera.lookAt(this.carPosition);
  }

  private updateWheels(deltaTime: number): void {
    this.wheels.forEach(wheel => {
      wheel.rotation.x += this.carSpeed * deltaTime * 0.1;
    });
  }

  // ===== PUBLIC METHODS FOR UI =====

  public getCarSpeed(): number {
    return Math.abs(this.carSpeed);
  }

  public getCarPosition(): THREE.Vector3 {
    return this.carPosition.clone();
  }
}
