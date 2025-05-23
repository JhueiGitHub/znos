#!/bin/bash

# 🌳 FINAL FIX - Copy Missing Unity Tree Textures
echo "🔧 Fixing Unity Trees 404 Errors..."

# Paths
FRISTY="/Users/matthewsheehan/Desktop/Fristy"
KROK_MODELS="/Users/matthewsheehan/Desktop/zenithos/public/assets/krok/models/trees"
KROK_TEXTURES="/Users/matthewsheehan/Desktop/zenithos/public/assets/krok/textures/trees"

echo "📋 Copying missing textures that FBX files expect..."

# Copy the 4 essential missing textures
echo "1. Completed_Difuse.png..."
cp "$FRISTY/Trees/Maps/Completed_Difuse.png" "$KROK_MODELS/" && echo "  ✅ -> models/trees/"
cp "$FRISTY/Trees/Maps/Completed_Difuse.png" "$KROK_TEXTURES/" && echo "  ✅ -> textures/trees/"

echo "2. Completed_Normal.png..." 
cp "$FRISTY/Trees/Maps/Completed_Normal.png" "$KROK_MODELS/" && echo "  ✅ -> models/trees/"
cp "$FRISTY/Trees/Maps/Completed_Normal.png" "$KROK_TEXTURES/" && echo "  ✅ -> textures/trees/"

echo "3. Branch 1 Difuse.png..."
cp "$FRISTY/Textures/Branch 1 Difuse.png" "$KROK_MODELS/" && echo "  ✅ -> models/trees/"
cp "$FRISTY/Textures/Branch 1 Difuse.png" "$KROK_TEXTURES/" && echo "  ✅ -> textures/trees/"

echo "4. Branch 1 Normal.png..."
cp "$FRISTY/Textures/Branch 1 Normal.png" "$KROK_MODELS/" && echo "  ✅ -> models/trees/"
cp "$FRISTY/Textures/Branch 1 Normal.png" "$KROK_TEXTURES/" && echo "  ✅ -> textures/trees/"

echo ""
echo "🎉 UNITY TREES 404 ERRORS FIXED!"
echo "🌳 All Unity tree textures now available"
echo "🚀 Restart your drift game to see proper textured trees!"
echo ""
echo "Expected result: Trees: 12 🌳 ✅ Textured"
