// app/apps/drifting/utils/track.ts
import * as THREE from "three";
import { TrackConfig } from "../types/game";

/**
 * Parameters for generating a track
 */
interface TrackGenerationParams {
  width: number; // Width of the track
  outerRadius: number; // Outer radius for curved sections
  innerRadius: number; // Inner radius for curved sections
  segments: number; // Number of segments for curved sections
  wallHeight: number; // Height of track walls
  trackColor: number; // Color of the track surface
  wallColor: number; // Color of the track walls
  createWalls: boolean; // Whether to create walls around the track
}

/**
 * Create a circular track
 */
export const createCircularTrack = (
  scene: THREE.Scene,
  params: TrackGenerationParams
) => {
  const {
    width,
    outerRadius,
    innerRadius,
    segments,
    wallHeight,
    trackColor,
    wallColor,
    createWalls,
  } = params;

  // Create the track surface
  const trackGeometry = new THREE.RingGeometry(
    innerRadius,
    outerRadius,
    segments,
    1
  );

  const trackMaterial = new THREE.MeshStandardMaterial({
    color: trackColor,
    roughness: 0.4,
    metalness: 0.1,
  });

  const track = new THREE.Mesh(trackGeometry, trackMaterial);
  track.rotation.x = -Math.PI / 2; // Lay flat on the xz plane
  track.receiveShadow = true;
  scene.add(track);

  // Create the track walls if needed
  if (createWalls) {
    // Outer wall
    const outerWallGeometry = new THREE.CylinderGeometry(
      outerRadius,
      outerRadius,
      wallHeight,
      segments,
      1,
      true
    );

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.8,
      metalness: 0.2,
    });

    const outerWall = new THREE.Mesh(outerWallGeometry, wallMaterial);
    outerWall.position.y = wallHeight / 2;
    outerWall.receiveShadow = true;
    outerWall.castShadow = true;
    scene.add(outerWall);

    // Inner wall
    const innerWallGeometry = new THREE.CylinderGeometry(
      innerRadius,
      innerRadius,
      wallHeight,
      segments,
      1,
      true
    );

    const innerWall = new THREE.Mesh(innerWallGeometry, wallMaterial);
    innerWall.position.y = wallHeight / 2;
    innerWall.receiveShadow = true;
    innerWall.castShadow = true;
    scene.add(innerWall);
  }

  return { track };
};

/**
 * Create a figure-8 track
 */
export const createFigureEightTrack = (
  scene: THREE.Scene,
  params: TrackGenerationParams
) => {
  const {
    width,
    outerRadius,
    segments,
    wallHeight,
    trackColor,
    wallColor,
    createWalls,
  } = params;

  // Create a custom shape for the figure-8
  const shape = new THREE.Shape();

  // Helper function to add a circle to the shape
  const addCircle = (x: number, radius: number) => {
    const circle = new THREE.Path();
    circle.absarc(x, 0, radius, 0, Math.PI * 2, false);
    return circle;
  };

  // Add the two circles that make up the figure-8
  shape.holes.push(
    addCircle(-outerRadius / 2, outerRadius / 2),
    addCircle(outerRadius / 2, outerRadius / 2)
  );

  // Create outer boundary of the figure-8
  shape.moveTo(-outerRadius - width, -outerRadius);
  shape.lineTo(outerRadius + width, -outerRadius);
  shape.lineTo(outerRadius + width, outerRadius);
  shape.lineTo(-outerRadius - width, outerRadius);
  shape.lineTo(-outerRadius - width, -outerRadius);

  // Create the track geometry
  const trackGeometry = new THREE.ShapeGeometry(shape, segments);
  const trackMaterial = new THREE.MeshStandardMaterial({
    color: trackColor,
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  const track = new THREE.Mesh(trackGeometry, trackMaterial);
  track.rotation.x = -Math.PI / 2; // Lay flat on the xz plane
  track.receiveShadow = true;
  scene.add(track);

  // Walls are more complex for a figure-8, would need custom extrusion
  // Simplified implementation omitted for brevity

  return { track };
};

/**
 * Add checkpoints to a track
 */
export const addCheckpoints = (
  scene: THREE.Scene,
  trackRadius: number,
  checkpointCount: number,
  height: number = 5,
  width: number = 10
) => {
  const checkpoints: THREE.Object3D[] = [];

  for (let i = 0; i < checkpointCount; i++) {
    const angle = (i / checkpointCount) * Math.PI * 2;
    const x = Math.cos(angle) * trackRadius;
    const z = Math.sin(angle) * trackRadius;

    // Create checkpoint marker
    const checkpointGeometry = new THREE.BoxGeometry(1, height, width);
    const checkpointMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
    });

    const checkpoint = new THREE.Mesh(checkpointGeometry, checkpointMaterial);
    checkpoint.position.set(x, height / 2, z);
    checkpoint.rotation.y = angle + Math.PI / 2;
    checkpoint.castShadow = false;
    checkpoint.receiveShadow = false;

    // Add userData for collision detection
    checkpoint.userData = {
      isCheckpoint: true,
      checkpointIndex: i,
    };

    scene.add(checkpoint);
    checkpoints.push(checkpoint);
  }

  return checkpoints;
};

/**
 * Create a ground plane
 */
export const createGround = (
  scene: THREE.Scene,
  size: number = 1000,
  color: number = 0x3e7e41
) => {
  const groundGeometry = new THREE.PlaneGeometry(size, size);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.8,
    metalness: 0.1,
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  return ground;
};

/**
 * Add trees and other decorative elements around the track
 */
export const addEnvironmentElements = (
  scene: THREE.Scene,
  count: number,
  minRadius: number,
  maxRadius: number
) => {
  const elements: THREE.Object3D[] = [];

  for (let i = 0; i < count; i++) {
    // Random position around the track
    const angle = Math.random() * Math.PI * 2;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Randomly decide if we're creating a tree or a rock
    const isTree = Math.random() > 0.3;

    if (isTree) {
      // Create a simple tree
      const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 5, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513, // Brown
        roughness: 0.9,
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, 2.5, z);
      trunk.castShadow = true;
      scene.add(trunk);

      // Tree top
      const topGeometry = new THREE.ConeGeometry(3, 6, 8);
      const topMaterial = new THREE.MeshStandardMaterial({
        color: 0x228b22, // Forest green
        roughness: 0.8,
      });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.set(x, 8, z);
      top.castShadow = true;
      scene.add(top);

      elements.push(trunk, top);
    } else {
      // Create a rock
      const rockGeometry = new THREE.DodecahedronGeometry(
        1 + Math.random() * 2,
        0
      );
      const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080, // Gray
        roughness: 0.9,
        metalness: 0.1,
      });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(x, 1, z);
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.scale.set(
        1 + Math.random() * 0.5,
        1 + Math.random() * 0.5,
        1 + Math.random() * 0.5
      );
      rock.castShadow = true;
      scene.add(rock);

      elements.push(rock);
    }
  }

  return elements;
};
