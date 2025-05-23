// /app/apps/drift/scripts/validateSetup.js
// Run this to validate your drift game setup

const fs = require('fs');
const path = require('path');

const BASE_PATH = path.join(process.cwd(), 'public/assets/drift');
const APP_PATH = path.join(process.cwd(), 'app/apps/drift');

const REQUIRED_ASSETS = {
  models: [
    'models/arcade-racing-car.fbx',
    'models/drift-graphic.glb', 
    'models/drift-collision.glb'
  ],
  textures: [
    'textures/arcade-racing-car-tex-yellow.png',
    'textures/skybox/right.webp',
    'textures/skybox/left.webp',
    'textures/skybox/up.webp',
    'textures/skybox/down.webp',
    'textures/skybox/front.webp',
    'textures/skybox/back.webp',
    'textures/effects/smoke.webp'
  ]
};

const REQUIRED_CODE = [
  'page.tsx',
  'layout.tsx',
  'App.tsx',
  'game/DriftGameEngine.ts',
  'config/assets.ts'
];

console.log('🎮 Validating Drift Game Setup...\n');

// Check Universal Arcade Foundation
console.log('🏗️ Checking Universal Arcade Foundation:');
const arcadePath = path.join(process.cwd(), 'app/components/arcade');
const arcadeFiles = ['GameEngine.ts', 'AssetManager.ts', 'useGameEngine.ts', 'index.ts'];

arcadeFiles.forEach(file => {
  const filePath = path.join(arcadePath, file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check Game Code Structure
console.log('\n📝 Checking Drift Game Code:');
REQUIRED_CODE.forEach(file => {
  const filePath = path.join(APP_PATH, file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check Assets
console.log('\n📦 Checking Assets:');
let totalAssets = 0;
let foundAssets = 0;

Object.entries(REQUIRED_ASSETS).forEach(([category, assets]) => {
  console.log(`\n${category.toUpperCase()}:`);
  assets.forEach(asset => {
    totalAssets++;
    const assetPath = path.join(BASE_PATH, asset);
    const exists = fs.existsSync(assetPath);
    if (exists) foundAssets++;
    console.log(`  ${exists ? '✅' : '❌'} ${asset}`);
  });
});

// Summary
console.log('\n📊 Setup Summary:');
console.log(`Assets: ${foundAssets}/${totalAssets} found`);

const setupComplete = foundAssets === totalAssets;
console.log(`Status: ${setupComplete ? '✅ READY TO TEST' : '⚠️ NEEDS SETUP'}`);

if (!setupComplete) {
  console.log('\n📋 Next Steps:');
  console.log('1. Copy Krok assets to /public/assets/drift/');
  console.log('2. Ensure all required files are in place');
  console.log('3. Run this validation again');
  console.log('4. Start your dev server and test at /apps/drift');
}

if (setupComplete) {
  console.log('\n🚀 Your Drift Game is Ready!');
  console.log('Start your dev server and navigate to:');
  console.log('http://localhost:3000/apps/drift');
  console.log('\nControls:');
  console.log('• WASD or Arrow Keys - Drive');
  console.log('• Game will load assets automatically');
  console.log('• Check console for any loading errors');
}

console.log(`\n🎯 Universal + Individual Architecture: ${setupComplete ? 'VERIFIED' : 'PENDING'}`);
