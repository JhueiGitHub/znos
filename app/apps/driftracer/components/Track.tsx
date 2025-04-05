// /root/app/apps/driftRacer/components/Track.tsx
import * as THREE from "three";

export function createTrack(scene: THREE.Scene): {
  trackMesh: THREE.Mesh;
  startLineMesh: THREE.Mesh;
} {
  // --- Track Shape Definition (Simple Oval Example) ---
  const trackWidth = 10;
  const outerRadius = 50;
  const innerRadius = outerRadius - trackWidth;
  const curveSegments = 64; // More segments = smoother curve

  const shape = new THREE.Shape();

  // Define the outer path (clockwise)
  shape.moveTo(0, outerRadius); // Start top center
  shape.absarc(0, 0, outerRadius, Math.PI / 2, (-Math.PI / 2) * 3, true); // Full circle arc

  // Define the inner hole path (counter-clockwise)
  const hole = new THREE.Path();
  hole.moveTo(0, innerRadius); // Start top center inner edge
  hole.absarc(0, 0, innerRadius, Math.PI / 2, (-Math.PI / 2) * 3, true); // Full circle arc

  shape.holes.push(hole);

  // --- Geometry ---
  const extrudeSettings = {
    steps: 1,
    depth: 0.1, // Very thin track surface
    bevelEnabled: false,
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.rotateX(-Math.PI / 2); // Rotate to lay flat on XZ plane
  geometry.center(); // Center the track geometry

  // --- Material ---
  // Load a texture (make sure 'track_texture.png' is in /public/textures)
  const textureLoader = new THREE.TextureLoader();
  const trackTexture = textureLoader.load("/textures/track_texture.png");
  trackTexture.wrapS = THREE.RepeatWrapping;
  trackTexture.wrapT = THREE.RepeatWrapping;
  trackTexture.repeat.set(10, 10); // Adjust tiling as needed

  const material = new THREE.MeshStandardMaterial({
    // color: 0x444444, // Grey if no texture
    map: trackTexture,
    side: THREE.DoubleSide, // Render both sides
    roughness: 0.8,
    metalness: 0.1,
  });

  const trackMesh = new THREE.Mesh(geometry, material);
  trackMesh.receiveShadow = true; // Allow track to receive shadows
  trackMesh.position.y = 0.05; // Slightly above the ground plane

  // --- Start/Finish Line ---
  const startLineHeight = 0.1; // Make it slightly thicker than the track
  const startLineWidth = trackWidth;
  const startLineDepth = 1;
  const startLineGeometry = new THREE.BoxGeometry(
    startLineWidth,
    startLineHeight,
    startLineDepth
  );
  const startLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White
  const startLineMesh = new THREE.Mesh(startLineGeometry, startLineMaterial);

  // Position the start line - adjust X/Z based on your track shape
  // For the oval, placing it near Z=0 on the positive X side makes sense.
  startLineMesh.position.set(
    outerRadius - trackWidth / 2,
    startLineHeight / 2 + 0.06,
    0
  ); // Position on the track surface
  startLineMesh.name = "StartFinishLine"; // For identification

  return { trackMesh, startLineMesh };
}
