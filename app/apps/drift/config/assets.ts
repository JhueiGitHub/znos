// /app/apps/drift/config/assets.ts  
// INDIVIDUAL GAME ASSETS - This game's specific asset pack

import { AssetPack } from '@/app/components/arcade';

// 🎯 WORKING BACKWARDS FROM ASSETS FIRST (as you requested)
// Let's start with PROVEN assets from Krok, then expand

export const DRIFT_ASSET_PACK: AssetPack = {
  id: 'drift-game-v1',
  name: 'Drift Racing Game',
  version: '1.0.0',
  assets: [
    // 🚗 VEHICLES - Starting with Krok's proven car
    {
      id: 'drift-car',
      type: 'model',
      path: '/assets/drift/models/arcade-racing-car.fbx', // Krok's working car
      format: 'fbx',
      preload: true
    },
    
    // 🏁 TERRAIN - Using Krok's proven terrain system  
    {
      id: 'drift-track-visual',
      type: 'model', 
      path: '/assets/drift/models/drift-graphic.glb', // Krok's visual track
      format: 'glb',
      preload: true
    },
    {
      id: 'drift-track-collision',
      type: 'model',
      path: '/assets/drift/models/drift-collision.glb', // Krok's collision track
      format: 'glb', 
      preload: true
    },

    // 🎨 TEXTURES - Car textures (multiple variants)
    {
      id: 'car-texture-yellow',
      type: 'texture',
      path: '/assets/drift/textures/arcade-racing-car-tex-yellow.png',
      format: 'png',
      preload: true
    },
    {
      id: 'car-texture-red',
      type: 'texture',
      path: '/assets/drift/textures/arcade-racing-car-tex-red.png',
      format: 'png',
      preload: false
    },
    {
      id: 'car-texture-blue',
      type: 'texture',
      path: '/assets/drift/textures/arcade-racing-car-tex-blue.png',
      format: 'png',
      preload: false
    },

    // 🌅 ENVIRONMENT - Skybox
    {
      id: 'skybox-right',
      type: 'texture',
      path: '/assets/drift/textures/skybox/right.webp',
      format: 'webp',
      preload: true
    },
    {
      id: 'skybox-left',
      type: 'texture',
      path: '/assets/drift/textures/skybox/left.webp',
      format: 'webp',
      preload: true
    },
    {
      id: 'skybox-up',
      type: 'texture',
      path: '/assets/drift/textures/skybox/up.webp',
      format: 'webp',
      preload: true
    },
    {
      id: 'skybox-down',
      type: 'texture',
      path: '/assets/drift/textures/skybox/down.webp',
      format: 'webp',
      preload: true
    },
    {
      id: 'skybox-front',
      type: 'texture',
      path: '/assets/drift/textures/skybox/front.webp',
      format: 'webp',
      preload: true
    },
    {
      id: 'skybox-back',
      type: 'texture',
      path: '/assets/drift/textures/skybox/back.webp',
      format: 'webp',
      preload: true
    },

    // 💨 EFFECTS
    {
      id: 'smoke-texture',
      type: 'texture',
      path: '/assets/drift/textures/effects/smoke.webp',
      format: 'webp',
      preload: true
    }
  ]
};

// 🔄 ASSET STRATEGY PHASES
// Phase 1: Use Krok's proven assets (CURRENT)
// Phase 2: Add Unity asset pack trees/environment (NEXT)
// Phase 3: Add external FBX models with wheel extraction (FUTURE)

export const ASSET_STRATEGY = {
  phase1: {
    description: 'Proven Krok Assets',
    status: 'CURRENT',
    assets: ['drift-car', 'drift-track-visual', 'drift-track-collision'],
    advantage: 'Known to work, wheel mechanics already solved'
  },
  phase2: {
    description: 'Unity Asset Pack Enhancement',
    status: 'NEXT',
    assets: ['unity-trees', 'unity-rocks', 'unity-props'],
    advantage: 'High quality, designed for games, easy to import'
  },
  phase3: {
    description: 'External FBX Models',
    status: 'FUTURE', 
    assets: ['bugatti-chiron', 'lamborghini-huracan'],
    advantage: 'Coolest models, but requires wheel extraction workflow'
  }
};

// 🚗 VEHICLE CONFIGURATIONS
export const CAR_CONFIGS = {
  drift_car: {
    scale: { x: 0.0085, y: 0.0085, z: 0.0085 },
    offset: { x: -0.05, y: -0.4, z: 0 },
    wheelPositions: [
      // Front wheels
      { x: 0.8, y: -0.3, z: 1.2 },
      { x: -0.8, y: -0.3, z: 1.2 },
      // Rear wheels  
      { x: 0.8, y: -0.3, z: -1.2 },
      { x: -0.8, y: -0.3, z: -1.2 }
    ],
    physics: {
      mass: 1500,
      maxSpeed: 100,
      acceleration: 2.5,
      brakeForce: 5.0,
      turnSpeed: 0.05
    }
  }
};

// 🏁 TRACK CONFIGURATIONS  
export const TRACK_CONFIGS = {
  drift_track: {
    spawnPoints: [
      { x: 0, y: 0.6, z: 0, rotation: 0 }
    ],
    checkpoints: [
      { id: 'checkpoint-1', position: { x: 50, y: 0, z: 0 } },
      { id: 'checkpoint-2', position: { x: 100, y: 0, z: 50 } },
      { id: 'checkpoint-3', position: { x: 50, y: 0, z: 100 } },
      { id: 'checkpoint-4', position: { x: 0, y: 0, z: 50 } }
    ]
  }
};
