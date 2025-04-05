// app/apps/drifting/utils/physics.ts
import * as THREE from "three";

/**
 * Simple friction model that dampens a velocity vector based on friction coefficient
 */
export const applyFriction = (
  velocity: THREE.Vector3,
  frictionCoefficient: number,
  deltaTime: number
): THREE.Vector3 => {
  const result = velocity.clone();

  // More realistic friction - higher at lower speeds
  const speed = result.length();
  const friction = Math.min(speed, frictionCoefficient * deltaTime);

  if (speed > 0) {
    const deceleration = result.clone().normalize().multiplyScalar(-friction);
    result.add(deceleration);

    // Prevent tiny oscillations by zeroing out very small values
    if (result.length() < 0.01) {
      result.set(0, 0, 0);
    }
  }

  return result;
};

/**
 * Applies aerodynamic drag to a velocity vector
 */
export const applyDrag = (
  velocity: THREE.Vector3,
  dragCoefficient: number,
  deltaTime: number
): THREE.Vector3 => {
  const result = velocity.clone();

  // Drag is proportional to velocity squared
  const speed = result.length();
  const dragMagnitude = dragCoefficient * speed * speed * deltaTime;

  if (speed > 0) {
    const drag = result.clone().normalize().multiplyScalar(-dragMagnitude);
    result.add(drag);
  }

  return result;
};

/**
 * Apply drift effect - allows car to slide sideways
 */
export const applyDrift = (
  forwardVelocity: number,
  direction: THREE.Vector3,
  steeringAngle: number,
  driftFactor: number
): THREE.Vector3 => {
  // Create a drift velocity perpendicular to forward direction
  const driftDirection = direction
    .clone()
    .applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      (Math.PI / 2) * Math.sign(steeringAngle)
    );

  // Scale drift based on speed, steering angle and drift factor
  return driftDirection.multiplyScalar(
    Math.abs(forwardVelocity) * Math.abs(steeringAngle) * driftFactor
  );
};

/**
 * Simulates engine torque curve
 * Returns acceleration based on current speed and throttle
 */
export const calculateAcceleration = (
  currentSpeed: number,
  maxSpeed: number,
  throttle: number,
  torqueCurve: { x: number; y: number }[] = []
): number => {
  // Simple linear decrease if no torque curve provided
  if (torqueCurve.length === 0) {
    const normalizedSpeed = Math.min(currentSpeed / maxSpeed, 1);
    return throttle * (1 - normalizedSpeed);
  }

  // Use the torque curve for more realistic acceleration
  const normalizedSpeed = Math.min(currentSpeed / maxSpeed, 1);

  // Find the two points in the curve to interpolate between
  let i = 0;
  while (i < torqueCurve.length - 1 && torqueCurve[i + 1].x < normalizedSpeed) {
    i++;
  }

  if (i >= torqueCurve.length - 1) {
    return throttle * torqueCurve[torqueCurve.length - 1].y;
  }

  // Interpolate between the two points
  const x0 = torqueCurve[i].x;
  const x1 = torqueCurve[i + 1].x;
  const y0 = torqueCurve[i].y;
  const y1 = torqueCurve[i + 1].y;

  const t = (normalizedSpeed - x0) / (x1 - x0);
  const torqueMultiplier = y0 + t * (y1 - y0);

  return throttle * torqueMultiplier;
};

/**
 * Calculates banking force for tilting the car during turns
 */
export const calculateBankingAngle = (
  steeringAngle: number,
  speed: number,
  maxBankAngle: number = Math.PI / 10
): number => {
  const normalizedSpeed = Math.min(speed / 100, 1);
  return -steeringAngle * normalizedSpeed * maxBankAngle;
};
