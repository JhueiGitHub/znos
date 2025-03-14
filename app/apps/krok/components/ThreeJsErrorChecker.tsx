"use client";

import React, { useEffect, useState } from "react";
import * as THREE from "three";

interface ThreeJsErrorCheckerProps {
  onError: (error: string) => void;
}

/**
 * Component that checks if THREE.js can initialize properly
 * This helps catch WebGL/Three.js compatibility issues early
 */
const ThreeJsErrorChecker: React.FC<ThreeJsErrorCheckerProps> = ({
  onError,
}) => {
  useEffect(() => {
    try {
      // Try to create a simple Three.js scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

      // Try to create a renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(10, 10); // Minimal size for testing

      // Try to render the scene
      renderer.render(scene, camera);

      // Dispose of resources
      renderer.dispose();
    } catch (error: any) {
      console.error("THREE.js initialization test failed:", error);
      onError(
        `THREE.js initialization failed: ${error.message || "Unknown error"}`
      );
    }
  }, [onError]);

  return null; // This component doesn't render anything
};

export default ThreeJsErrorChecker;
