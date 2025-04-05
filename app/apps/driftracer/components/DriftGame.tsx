// /root/app/apps/driftRacer/components/DriftGame.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
// You might want OrbitControls for debugging, but remove for final game
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Car } from "./Car"; // Import the Car class/logic
import { createTrack } from "./Track"; // Import track creation function
import { createEnvironment } from "./Environment"; // Import environment setup

interface DriftGameProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const DriftGame: React.FC<DriftGameProps> = ({ containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInstance = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    car: Car;
    keys: { [key: string]: boolean };
    clock: THREE.Clock;
    startLine: THREE.Mesh | null;
    passedStartLineAway: boolean; // Track direction through start line
    lapStartTime: number | null;
    currentLapTime: number;
  } | null>(null);

  const [lapTimeDisplay, setLapTimeDisplay] = useState<string>("0.000");

  useEffect(() => {
    if (!containerRef.current || gameInstance.current) return; // Already initialized or no container

    const container = containerRef.current;

    // --- Basic Three.js Setup ---
    const scene = new THREE.Scene();
    const clock = new THREE.Clock();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10); // Initial camera position

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Use alpha for potential transparency
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // Enable shadows
    container.appendChild(renderer.domElement);

    // --- Environment ---
    createEnvironment(scene); // Add skybox, ground plane, lights

    // --- Track ---
    const { trackMesh, startLineMesh } = createTrack(scene); // Create and add track geometry
    scene.add(trackMesh);
    scene.add(startLineMesh);

    // --- Car ---
    const car = new Car(scene); // Create the car instance
    scene.add(car.mesh);

    // --- Controls ---
    const keys: { [key: string]: boolean } = {};
    const onKeyDown = (event: KeyboardEvent) => {
      keys[event.key.toLowerCase()] = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys[event.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // --- Game State ---
    gameInstance.current = {
      scene,
      camera,
      renderer,
      car,
      keys,
      clock,
      startLine: startLineMesh,
      passedStartLineAway: false,
      lapStartTime: null,
      currentLapTime: 0,
    };

    // --- Lap Timing Logic ---
    const checkLapCompletion = () => {
      if (!gameInstance.current || !gameInstance.current.startLine) return;

      const { car, startLine, passedStartLineAway, lapStartTime } =
        gameInstance.current;
      const carPos = car.mesh.position;
      const startLinePos = startLine.position;

      // Simple check: Z position relative to start line and proximity in X
      const zThreshold = 0.5; // How close in Z to trigger
      const xThreshold = 5; // Width of the start line trigger area

      // Check if car is near the start line XZ plane
      if (Math.abs(carPos.x - startLinePos.x) < xThreshold) {
        const carZ = carPos.z;
        const lineZ = startLinePos.z;

        // Detect crossing *away* from the start (Z becoming more positive)
        if (carZ > lineZ && carZ < lineZ + zThreshold && !passedStartLineAway) {
          console.log("Passed start line going away");
          gameInstance.current.passedStartLineAway = true;
          // Start timer only on the *first* crossing away if it's not running
          if (lapStartTime === null) {
            console.log("Starting Lap Timer!");
            gameInstance.current.lapStartTime =
              gameInstance.current.clock.getElapsedTime();
          }
        }
        // Detect crossing back *towards* the start (Z becoming less positive) *after* having gone away
        else if (
          carZ < lineZ &&
          carZ > lineZ - zThreshold &&
          passedStartLineAway
        ) {
          console.log("Crossed back over start line - LAP COMPLETE!");
          if (lapStartTime !== null) {
            const endTime = gameInstance.current.clock.getElapsedTime();
            const lapDuration = endTime - lapStartTime;
            gameInstance.current.currentLapTime = lapDuration;
            setLapTimeDisplay(lapDuration.toFixed(3)); // Update UI state
            console.log(`Lap Time: ${lapDuration.toFixed(3)}s`);
          }
          // Reset for next lap
          gameInstance.current.passedStartLineAway = false;
          gameInstance.current.lapStartTime =
            gameInstance.current.clock.getElapsedTime(); // Start timer for the *next* lap immediately
        }
      }

      // Update live lap time if timer is running
      if (gameInstance.current.lapStartTime !== null) {
        const elapsed =
          gameInstance.current.clock.getElapsedTime() -
          gameInstance.current.lapStartTime;
        // Don't update display state every frame for performance, only on lap completion,
        // but you *could* update a separate live timer display if needed.
        // setLapTimeDisplay(elapsed.toFixed(3)); // Example of live update (can be performance heavy)
      }
    };

    // --- Resize Handling ---
    const handleResize = () => {
      if (!gameInstance.current || !containerRef.current) return;
      const { camera, renderer } = gameInstance.current;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- Animation Loop ---
    const animate = () => {
      if (!gameInstance.current) return; // Stop loop if cleaned up
      const { scene, camera, renderer, car, keys, clock } =
        gameInstance.current;

      const deltaTime = clock.getDelta(); // Time since last frame

      // Update car physics and movement
      car.update(keys, deltaTime);

      // Update camera to follow car
      const cameraOffset = new THREE.Vector3(0, 4, -8); // Adjust as needed
      const worldOffset = cameraOffset.applyMatrix4(car.mesh.matrixWorld);
      camera.position.lerp(worldOffset, 0.1); // Smooth camera movement (lerp)
      camera.lookAt(car.mesh.position);

      // Check for lap completion
      checkLapCompletion();

      // Render the scene
      renderer.render(scene, camera);

      // Request next frame
      requestAnimationFrame(animate);
    };

    animate(); // Start the loop

    // --- Cleanup ---
    return () => {
      console.log("Cleaning up Drift Racer Three.js instance");
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", handleResize);
      if (gameInstance.current) {
        // Dispose of geometries, materials, textures
        gameInstance.current.scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else if (object.material) {
              object.material.dispose();
            }
          }
        });
        // Stop renderer and remove canvas
        gameInstance.current.renderer.dispose(); // Release WebGL context
        if (containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
      }
      gameInstance.current = null; // Clear the ref
    };
  }, [containerRef]); // Re-run effect if containerRef changes (shouldn't typically)

  // Simple UI Overlay for Lap Time
  return (
    <>
      {/* Canvas will be appended by Three.js */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          color: "white",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "5px 10px",
          borderRadius: "5px",
          fontFamily: "monospace",
          fontSize: "16px",
          zIndex: 10, // Ensure it's above the canvas
        }}
      >
        Lap Time: {lapTimeDisplay}s
      </div>
    </>
  );
};

export default DriftGame;
