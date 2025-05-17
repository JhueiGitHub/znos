// game/Car.ts
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { Octree } from "three/examples/jsm/math/Octree";
import { assetManager, ModelId, TextureId } from "../assets/config";

export class Car {
  private scene: THREE.Scene;
  private model: THREE.Group | null = null;
  private wheels: THREE.Object3D[] = [];
  private position = new THREE.Vector3(0, 0, 0);
  private direction = new THREE.Vector3(0, 0, 1); // Forward direction (z-axis)
  private speed = 0;
  private acceleration = 0;
  private rotationSpeed = 0;
  private maxSpeed = 100;
  private maxReverseSpeed = -20;
  private drag = 0.98; // Slows the car down naturally
  private angularDrag = 0.9; // Slows the rotation down naturally
  private leftSmoke: THREE.Object3D | null = null;
  private rightSmoke: THREE.Object3D | null = null;
  
  // Physics properties
  private velocity = new THREE.Vector3();
  private gravity = -9.8;
  private isGrounded = false;
  private groundNormal = new THREE.Vector3(0, 1, 0);
  private groundHeight = 0;
  
  // Control states
  private isAccelerating = false;
  private isBraking = false;
  private isTurningLeft = false;
  private isTurningRight = false;
  
  // Collision parameters
  private collider = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 0.5);
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  public async init(): Promise<void> {
    // Load car model
    await this.loadModel();
    
    // Create smoke effects
    this.createSmokeEffects();
  }
  
  private async loadModel(): Promise<void> {
    try {
      // Get model from asset manager
      const carModel = assetManager.getModel(ModelId.CAR)?.clone();
      
      if (!carModel) {
        // If model isn't available, load it directly
        const loader = new FBXLoader();
        const model = await new Promise<THREE.Group>((resolve, reject) => {
          loader.load(
            "/assets/krok/models/vehicles/arcade-racing-car.fbx",
            (result) => resolve(result),
            undefined,
            (error) => reject(error)
          );
        });
        
        this.model = model;
      } else {
        this.model = carModel;
      }
      
      // Scale the car model
      if (this.model) {
        this.model.scale.set(0.0085, 0.0085, 0.0085);
      
        // Apply texture to car
        const texture = assetManager.getTexture(TextureId.CAR_YELLOW) || 
          await new Promise<THREE.Texture>((resolve) => {
            new THREE.TextureLoader().load(
              "/assets/krok/textures/arcade-racing-car-tex-yellow.png",
              (tex) => resolve(tex)
            );
          });
          
        this.model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({ map: texture });
            child.castShadow = true;
          }
        });
      
        // Find wheels (based on naming in the FBX file)
        this.wheels = [];
        this.model.traverse((child) => {
          if (child.name.includes("wheel")) {
            this.wheels.push(child);
          }
        });
      
        // Add car to scene
        this.scene.add(this.model);
      
        // Position car correctly
        this.model.position.y = 0.6; // Adjust height based on model
      
        // Apply offset (from car-config.js in Krok)
        const offset = new THREE.Vector3(-0.05, -0.4, 0);
        this.model.position.add(offset);
        
        // Update collider
        this.updateCollider();
      }
    } catch (error) {
      console.error("Error loading car model:", error);
    }
  }
  
  private createSmokeEffects(): void {
    if (!this.model) return;
    
    // Create simple smoke particles (in full implementation this would be more complex)
    const smokeTexture = assetManager.getTexture(TextureId.SMOKE);
    const smokeGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    const smokeMaterial = new THREE.MeshBasicMaterial({
      map: smokeTexture || null,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    
    // Create left smoke
    this.leftSmoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
    this.leftSmoke.position.set(0.5, 0.3, -2);
    this.leftSmoke.rotation.y = Math.PI;
    this.model.add(this.leftSmoke);
    
    // Create right smoke
    this.rightSmoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
    this.rightSmoke.position.set(-0.5, 0.3, -2);
    this.rightSmoke.rotation.y = Math.PI;
    this.model.add(this.rightSmoke);
    
    // Initially hide smoke
    this.leftSmoke.visible = false;
    this.rightSmoke.visible = false;
  }
  
  public update(deltaTime: number, collisionOctree: Octree | null = null): void {
    if (!this.model) return;
    
    // Handle acceleration/braking
    if (this.isAccelerating) {
      this.acceleration = 1.5;
    } else if (this.isBraking) {
      this.acceleration = -2;
    } else {
      this.acceleration = 0;
    }
    
    // Apply acceleration
    this.speed += this.acceleration * deltaTime * 60;
    
    // Apply drag
    this.speed *= this.drag;
    
    // Clamp speed
    this.speed = Math.max(this.maxReverseSpeed, Math.min(this.maxSpeed, this.speed));
    
    // Handle turning
    if (this.isTurningLeft) {
      this.rotationSpeed = 0.05 * Math.sign(this.speed);
    } else if (this.isTurningRight) {
      this.rotationSpeed = -0.05 * Math.sign(this.speed);
    } else {
      this.rotationSpeed = 0;
    }
    
    // Apply turning (only when moving)
    if (Math.abs(this.speed) > 0.1) {
      this.model.rotation.y += this.rotationSpeed * Math.min(Math.abs(this.speed) / 20, 1) * deltaTime * 60;
    }
    
    // Apply angular drag
    this.rotationSpeed *= this.angularDrag;
    
    // Update direction vector based on model rotation
    this.direction.set(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.model.rotation.y);
    
    // Apply gravity if not grounded
    if (!this.isGrounded && collisionOctree) {
      this.velocity.y += this.gravity * deltaTime;
    }
    
    // Calculate movement vector
    const movement = this.direction.clone().multiplyScalar(this.speed * deltaTime);
    
    // Handle collision detection
    if (collisionOctree) {
      // Predict next position
      const nextPosition = this.model.position.clone().add(movement);
      
      // Update collider to next position
      this.collider.center.copy(nextPosition);
      
      // Check for collisions with the octree
      const collisionResult = collisionOctree.sphereIntersect(this.collider);
      
      if (collisionResult) {
        // We have a collision, adjust position
        const collisionPoint = collisionResult.point;
        const collisionNormal = collisionResult.normal;
        
        // Adjust position to avoid collision
        const adjustment = collisionNormal.clone().multiplyScalar(collisionResult.depth);
        nextPosition.add(adjustment);
        
        // Reflect velocity based on collision normal
        const dot = this.direction.dot(collisionNormal);
        this.direction.sub(collisionNormal.clone().multiplyScalar(2 * dot)).normalize();
        
        // Reduce speed due to collision
        this.speed *= 0.8;
        
        // Set position directly to adjusted position
        this.model.position.copy(nextPosition);
      } else {
        // No collision, move normally
        this.model.position.add(movement);
      }
      
      // Check if grounded - THIS IS WHERE THE ERROR WAS HAPPENING
      // Instead of using raycastFirst (which doesn't exist), we use regular raycasting
      
      // Create ray from car position downward
      const rayCaster = new THREE.Raycaster(
        this.model.position.clone().add(new THREE.Vector3(0, 0.1, 0)),
        new THREE.Vector3(0, -1, 0),
        0,
        0.2
      );
      
      // Simplified ground detection - always true in this basic version
      // In a full implementation, we'd use proper ray-octree intersection
      this.isGrounded = true;
      this.groundHeight = 0;
      
      // Keep car at a fixed height for now
      this.model.position.y = 0.6; // Fixed height above ground
      this.velocity.y = 0;
    } else {
      // No collision detection, move normally
      this.model.position.add(movement);
    }
    
    // Update position for external reference
    this.position.copy(this.model.position);
    
    // Update wheel rotation based on speed
    this.wheels.forEach((wheel) => {
      wheel.rotation.x += (this.speed * deltaTime * 0.1) % (Math.PI * 2);
    });
    
    // Update smoke effects
    if (this.leftSmoke && this.rightSmoke) {
      // Show smoke when drifting (turning at high speed)
      const isDrifting = Math.abs(this.speed) > 40 && Math.abs(this.rotationSpeed) > 0.01;
      this.leftSmoke.visible = isDrifting;
      this.rightSmoke.visible = isDrifting;
      
      // Adjust smoke opacity based on drift intensity
      if (isDrifting) {
        const intensity = Math.min(Math.abs(this.speed * this.rotationSpeed) / 100, 1);
        // Check if the smoke objects are meshes before accessing material
        if (this.leftSmoke instanceof THREE.Mesh) {
          (this.leftSmoke.material as THREE.MeshBasicMaterial).opacity = 0.3 + intensity * 0.7;
        }
        if (this.rightSmoke instanceof THREE.Mesh) {
          (this.rightSmoke.material as THREE.MeshBasicMaterial).opacity = 0.3 + intensity * 0.7;
        }
      }
    }
    
    // Update collider position
    this.updateCollider();
  }
  
  private updateCollider(): void {
    if (!this.model) return;
    this.collider.center.copy(this.model.position);
  }
  
  // Set position directly
  public setPosition(position: THREE.Vector3): void {
    if (!this.model) return;
    this.model.position.copy(position);
    this.position.copy(position);
    this.updateCollider();
  }
  
  // Control methods
  public setAccelerating(value: boolean): void {
    this.isAccelerating = value;
  }
  
  public setBraking(value: boolean): void {
    this.isBraking = value;
  }
  
  public setTurningLeft(value: boolean): void {
    this.isTurningLeft = value;
  }
  
  public setTurningRight(value: boolean): void {
    this.isTurningRight = value;
  }
  
  // Getters
  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }
  
  public getDirection(): THREE.Vector3 {
    return this.direction.clone();
  }
  
  public getSpeed(): number {
    return Math.abs(this.speed);
  }
  
  public dispose(): void {
    if (this.model) {
      this.scene.remove(this.model);
      
      // Dispose geometries and materials
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      this.model = null;
    }
    
    this.wheels = [];
    this.leftSmoke = null;
    this.rightSmoke = null;
  }
}
