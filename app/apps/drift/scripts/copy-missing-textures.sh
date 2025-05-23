#!/bin/bash

# 🌳 Copy Missing Unity Tree Textures - Fix 404 Errors
echo "🔧 Copying missing Unity tree textures..."

# Source paths
FRISTY="/Users/matthewsheehan/Desktop/Fristy"
KROK_MODELS="/Users/matthewsheehan/Desktop/zenithos/public/assets/krok/models/trees"
KROK_TEXTURES="/Users/matthewsheehan/Desktop/zenithos/public/assets/krok/textures/trees"

# Copy Completed textures (from Trees/Maps)
echo "📋 Copying Completed textures..."
cp "$FRISTY/Trees/Maps/Completed_Difuse.png" "$KROK_MODELS/" 2>/dev/null && echo "✅ Completed_Difuse.png -> models/trees" || echo "❌ Completed_Difuse.png failed"
cp "$FRISTY/Trees/Maps/Completed_Normal.png" "$KROK_MODELS/" 2>/dev/null && echo "✅ Completed_Normal.png -> models/trees" || echo "❌ Completed_Normal.png not found"

cp "$FRISTY/Trees/Maps/Completed_Difuse.png" "$KROK_TEXTURES/" 2>/dev/null && echo "✅ Completed_Difuse.png -> textures/trees" || echo "❌ Completed_Difuse.png failed"
cp "$FRISTY/Trees/Maps/Completed_Normal.png" "$KROK_TEXTURES/" 2>/dev/null && echo "✅ Completed_Normal.png -> textures/trees" || echo "❌ Completed_Normal.png not found"

# Copy Branch textures (from Textures)
echo "🌿 Copying Branch textures..."
cp "$FRISTY/Textures/Branch 1 Difuse.png" "$KROK_MODELS/" 2>/dev/null && echo "✅ Branch 1 Difuse.png -> models/trees" || echo "❌ Branch 1 Difuse.png failed"
cp "$FRISTY/Textures/Branch 1 Normal.png" "$KROK_MODELS/" 2>/dev/null && echo "✅ Branch 1 Normal.png -> models/trees" || echo "❌ Branch 1 Normal.png not found"

cp "$FRISTY/Textures/Branch 1 Difuse.png" "$KROK_TEXTURES/" 2>/dev/null && echo "✅ Branch 1 Difuse.png -> textures/trees" || echo "❌ Branch 1 Difuse.png failed"
cp "$FRISTY/Textures/Branch 1 Normal.png" "$KROK_TEXTURES/" 2>/dev/null && echo "✅ Branch 1 Normal.png -> textures/trees" || echo "❌ Branch 1 Normal.png not found"

# Copy additional tree textures that might be missing
echo "🔍 Copying additional Unity tree textures..."
cp "$FRISTY/Trees/Maps/4_tree__normals.png" "$KROK_TEXTURES/" 2>/dev/null && echo "✅ 4_tree__normals.png -> textures/trees" || echo "ℹ️ 4_tree__normals.png not found (optional)"
cp "$FRISTY/Trees/Maps/4_tree__occlusion.png" "$KROK_TEXTURES/" 2>/dev/null && echo "✅ 4_tree__occlusion.png -> textures/trees" || echo "ℹ️ 4_tree__occlusion.png not found (optional)"
cp "$FRISTY/Trees/Maps/4_tree_Cavits.png" "$KROK_TEXTURES/" 2>/dev/null && echo "✅ 4_tree_Cavits.png -> textures/trees" || echo "ℹ️ 4_tree_Cavits.png not found (optional)"

echo ""
echo "📋 Verifying copied files:"
echo "Models directory:"
ls -la "$KROK_MODELS/"
echo ""
echo "Textures directory:"
ls -la "$KROK_TEXTURES/"

echo ""
echo "🎉 Missing texture copy complete!"
echo "🚀 Now restart your drift game - the 404 errors should be gone!"
