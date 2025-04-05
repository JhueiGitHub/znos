// /root/app/apps/driftRacer/components/Environment.tsx
import * as THREE from "three";

export function createEnvironment(scene: THREE.Scene) {
  // --- Lighting ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft ambient light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 100, 25);
  directionalLight.castShadow = true;
  // Configure shadow properties for better quality/performance
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  scene.add(directionalLight);
  // Optional: Add a light helper for debugging
  // const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
  // scene.add(lightHelper);
  // const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  // scene.add(shadowHelper);

  // --- Ground Plane ---
  const groundGeometry = new THREE.PlaneGeometry(500, 500); // Large ground plane
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x335533, // Greenish ground
    roughness: 1.0,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = -Math.PI / 2; // Rotate to lay flat
  groundMesh.receiveShadow = true; // Allow ground to receive shadows
  scene.add(groundMesh);

  // --- Skybox ---
  const loader = new THREE.CubeTextureLoader();
  loader.setPath("/textures/skybox/"); // Path to your skybox images folder in /public
  const textureCube = loader.load([
    "px.png",
    "nx.png", // Positive X, Negative X
    "py.png",
    "ny.png", // Positive Y, Negative Y
    "pz.png",
    "nz.png", // Positive Z, Negative Z
  ]);
  scene.background = textureCube; // Set scene background to skybox

  // --- Simple Scenery (Example: Trees/Blocks) ---
  const boxGeometry = new THREE.BoxGeometry(2, 10, 2);
  const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Brown
  for (let i = 0; i < 20; i++) {
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    const angle = Math.random() * Math.PI * 2;
    const radius = 70 + Math.random() * 20; // Place outside the track
    box.position.set(Math.cos(angle) * radius, 5, Math.sin(angle) * radius);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
  }
}
