#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define source and destination paths
const SOURCE_BASE = '/Users/matthewsheehan/Desktop/pokerio/public';
const DEST_BASE = '/Users/matthewsheehan/Desktop/zenithos/public/apps/pokerio';

// Asset mapping structure
const ASSETS_TO_COPY = [
  // Root level assets
  { src: 'cards.png', dest: 'cards.png' },
  { src: 'donald.png', dest: 'donald.png' },
  { src: 'icon.png', dest: 'icon.png' },
  { src: 'iconclean.png', dest: 'iconclean.png' },
  { src: 'smallheart.png', dest: 'smallheart.png' },
  
  // FBX files
  { src: 'fbx/endy-rigged.fbx', dest: 'fbx/endy-rigged.fbx' },
  
  // Fonts
  { src: 'fonts/Roboto_Bold.typeface.json', dest: 'fonts/Roboto_Bold.typeface.json' },
  
  // Textures
  { src: 'textures/bricks500x500x2.png', dest: 'textures/bricks500x500x2.png' },
  { src: 'textures/bricks500x500x21.png', dest: 'textures/bricks500x500x21.png' },
  { src: 'textures/bricks500x500x22.png', dest: 'textures/bricks500x500x22.png' },
  { src: 'textures/democard.png', dest: 'textures/democard.png' },
  { src: 'textures/google.png', dest: 'textures/google.png' },
  { src: 'textures/gray500x500.png', dest: 'textures/gray500x500.png' },
  { src: 'textures/green500x500.png', dest: 'textures/green500x500.png' },
  { src: 'textures/greenbricks500x500x2.png', dest: 'textures/greenbricks500x500x2.png' },
  { src: 'textures/smoke500x500.png', dest: 'textures/smoke500x500.png' },
  { src: 'textures/tri_pattern.jpg', dest: 'textures/tri_pattern.jpg' }
];

// Function to ensure directory exists
function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Function to copy a single file
function copyFile(src, dest) {
  const sourcePath = path.join(SOURCE_BASE, src);
  const destPath = path.join(DEST_BASE, dest);
  
  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source file not found: ${sourcePath}`);
    return false;
  }
  
  // Ensure destination directory exists
  ensureDirectoryExists(destPath);
  
  // Copy the file
  try {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied: ${src} → ${dest}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to copy ${src}: ${error.message}`);
    return false;
  }
}

// Main execution
console.log('🎲 Starting PokerIO asset copy process...\n');
console.log(`Source: ${SOURCE_BASE}`);
console.log(`Destination: ${DEST_BASE}\n`);

let successCount = 0;
let failCount = 0;

// Create base destination directory if it doesn't exist
if (!fs.existsSync(DEST_BASE)) {
  fs.mkdirSync(DEST_BASE, { recursive: true });
  console.log(`Created base directory: ${DEST_BASE}\n`);
}

// Copy all assets
for (const asset of ASSETS_TO_COPY) {
  if (copyFile(asset.src, asset.dest)) {
    successCount++;
  } else {
    failCount++;
  }
}

console.log('\n🎯 Asset copy complete!');
console.log(`✅ Successfully copied: ${successCount} files`);
console.log(`❌ Failed to copy: ${failCount} files`);

if (failCount === 0) {
  console.log('\n🎉 All assets copied successfully!');
} else {
  console.log('\n⚠️  Some assets failed to copy. Please check the errors above.');
}
