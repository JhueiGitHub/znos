// scripts/validateFristyAssets.js
// Run this script to validate that Fristy assets are properly placed

const fs = require('fs');
const path = require('path');

const ASSET_BASE = 'public/assets/krok';

const requiredAssets = {
  models: [
    'models/trees/Tree_3_1.fbx',
    'models/trees/Tree_3_2.fbx', 
    'models/trees/Tree_3_3.fbx',
    'models/trees/Tree_3_4.fbx'
  ],
  textures: [
    'textures/trees/4_Trees_Albedo_.png',
    'textures/trees/4_tree_normals.png',
    'textures/trees/4_tree_occlusion.png'
  ]
};

console.log('🌲 Validating Fristy Stylize Assets...\n');

let allAssetsFound = true;
let missingAssets = [];

// Check models
console.log('📦 Checking Tree Models:');
requiredAssets.models.forEach(assetPath => {
  const fullPath = path.join(ASSET_BASE, assetPath);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${assetPath}`);
  
  if (!exists) {
    allAssetsFound = false;
    missingAssets.push(assetPath);
  }
});

console.log('\n🎨 Checking Tree Textures:');
requiredAssets.textures.forEach(assetPath => {
  const fullPath = path.join(ASSET_BASE, assetPath);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${assetPath}`);
  
  if (!exists) {
    allAssetsFound = false;
    missingAssets.push(assetPath);
  }
});

console.log('\n📊 Validation Results:');
if (allAssetsFound) {
  console.log('🎉 All Fristy assets found! Your tree system is ready!');
  console.log('\n🚀 Next steps:');
  console.log('  1. Start your NextJS development server');
  console.log('  2. Navigate to your Krok drift game');
  console.log('  3. Press "D" to toggle debug mode');
  console.log('  4. Press "T" to toggle tree visibility');
  console.log('  5. Enjoy your enhanced forest environment!');
} else {
  console.log(`❌ Missing ${missingAssets.length} assets:`);
  missingAssets.forEach(asset => {
    console.log(`  - ${asset}`);
  });
  
  console.log('\n📋 Setup Instructions:');
  console.log('  1. Extract your Fristy Stylize Modular Assets 2 pack');
  console.log('  2. Copy the tree FBX files to: public/assets/krok/models/trees/');
  console.log('  3. Copy the tree texture files to: public/assets/krok/textures/trees/');
  console.log('  4. Run this script again to validate');
  console.log('\n📖 See FRISTY_TREE_SETUP.md for detailed instructions');
}

console.log(`\n🌲 Tree System Status: ${allAssetsFound ? 'READY' : 'SETUP REQUIRED'}`);
