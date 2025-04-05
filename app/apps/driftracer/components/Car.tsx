// /root/app/apps/driftRacer/components/Car.tsx
import * as THREE from "three";

export class Car {
  mesh: THREE.Mesh;
  velocity = new THREE.Vector3();
  angularVelocity = 0;

  // Tunable Physics Parameters
  acceleration = 35;
  maxSpeed = 40;
  steeringSpeed = 1.5; // Radians per second
  friction = 0.98; // General velocity reduction factor per frame
  driftFriction = 0.85; // Lower friction when drifting
  turnFriction = 0.95; // Friction applied based on turning
  maxSteerAngle = Math.PI / 4; // Max wheel angle
  brakePower = 50;

  constructor(scene: THREE.Scene) {
    // Basic car shape (replace with a loaded model later if desired)
    const geometry = new THREE.BoxGeometry(1.5, 0.8, 3);
    // Simple material
    const material = new THREE.MeshStandardMaterial({
      color: 0xff0000, // Red
      roughness: 0.5,
      metalness: 0.2,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.y = 0.4; // Lift slightly off the ground
    this.mesh.castShadow = true;

    // Add simple headlights (optional)
    const headLightLeft = new THREE.SpotLight(
      0xffffff,
      1,
      10,
      Math.PI / 6,
      0.5
    );
    headLightLeft.position.set(-0.5, 0.5, 1.5);
    headLightLeft.target.position.set(-0.5, 0, 5);
    this.mesh.add(headLightLeft);
    this.mesh.add(headLightLeft.target);

    const headLightRight = new THREE.SpotLight(
      0xffffff,
      1,
      10,
      Math.PI / 6,
      0.5
    );
    headLightRight.position.set(0.5, 0.5, 1.5);
    headLightRight.target.position.set(0.5, 0, 5);
    this.mesh.add(headLightRight);
    this.mesh.add(headLightRight.target);

    // Add to scene is handled in DriftGame.tsx
  }

  update(keys: { [key: string]: boolean }, deltaTime: number) {
    const forward = keys["w"];
    const backward = keys["s"];
    const left = keys["a"];
    const right = keys["d"];
    const brake = keys[" "]; // Spacebar for brake/drift initiation

    let currentMaxSpeed = this.maxSpeed;
    let currentAcceleration = this.acceleration;
    let steerValue = 0;
    let effectiveFriction = this.friction;

    // --- Steering ---
    if (left) steerValue = this.steeringSpeed * deltaTime;
    if (right) steerValue = -this.steeringSpeed * deltaTime;

    this.angularVelocity = steerValue; // Direct steering for arcade feel

    // Apply rotation based on angular velocity
    this.mesh.rotateY(this.angularVelocity);

    // --- Acceleration / Braking ---
    const forwardVector = new THREE.Vector3(0, 0, 1);
    forwardVector.applyQuaternion(this.mesh.quaternion); // Get car's forward direction

    if (forward) {
      // Apply force in the forward direction
      this.velocity.add(
        forwardVector.multiplyScalar(currentAcceleration * deltaTime)
      );
    }
    if (backward) {
      // Apply force opposite to forward direction
      this.velocity.add(
        forwardVector.multiplyScalar(-currentAcceleration * 0.6 * deltaTime)
      ); // Less reverse power
    }
    if (brake) {
      // Stronger braking force opposite to current velocity
      const brakeForce = this.velocity
        .clone()
        .negate()
        .multiplyScalar(this.brakePower * deltaTime);
      this.velocity.add(brakeForce);
      // Induce drift when braking and turning
      if (left || right) {
        effectiveFriction = this.driftFriction;
      }
    }

    // --- Friction & Speed Limiting ---
    const currentSpeed = this.velocity.length();

    // Apply different friction if actively turning
    if (left || right) {
      effectiveFriction *= this.turnFriction; // Increase drag when turning
      // Enhance drift feel: Reduce friction more at higher speeds while turning
      if (currentSpeed > this.maxSpeed * 0.5) {
        effectiveFriction = Math.min(effectiveFriction, this.driftFriction);
      }
    } else {
      // Apply slight counter-rotation when not steering to stop spinning
      this.angularVelocity *= 0.9; // Dampen spin
    }

    this.velocity.multiplyScalar(effectiveFriction);

    // Clamp speed (optional, friction should handle it mostly)
    if (currentSpeed > currentMaxSpeed) {
      this.velocity.normalize().multiplyScalar(currentMaxSpeed);
    }

    // Prevent jittering at very low speeds
    if (this.velocity.length() < 0.01) {
      this.velocity.set(0, 0, 0);
    }
    if (Math.abs(this.angularVelocity) < 0.01 && !left && !right) {
      this.angularVelocity = 0;
    }

    // --- Update Position ---
    this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    // Keep car on the ground (simple method)
    this.mesh.position.y = 0.4;
  }
}
