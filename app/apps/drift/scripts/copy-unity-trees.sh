#!/bin/bash

# 🌳 Unity Trees Integration - File Copy Script
# This script copies Unity trees assets to the drift game directory

echo "🌳 Starting Unity Trees Integration..."

# Set paths
FRISTY_PATH="/Users/matthewsheehan/Desktop/Fristy"
ZENITHOS_PATH="/Users/matthewsheehan/Desktop/zenithos"
TREES_MODELS_PATH="$ZENITHOS_PATH/public/assets/drift/models/trees"
TREES_TEXTURES_PATH="$ZENITHOS_PATH/public/assets/drift/textures/trees"

# Create directories if they don't exist
echo "📁 Creating directories..."
mkdir -p "$TREES_MODELS_PATH"
mkdir -p "$TREES_TEXTURES_PATH"

# Copy tree models
echo "🌳 Copying tree models..."
if [ -d "$FRISTY_PATH/Trees" ]; then
    cp "$FRISTY_PATH/Trees/Tree_3_1.fbx" "$TREES_MODELS_PATH/" 2>/dev/null && echo "✅ Tree_3_1.fbx copied" || echo "❌ Tree_3_1.fbx failed"
    cp "$FRISTY_PATH/Trees/Tree_3_2.fbx" "$TREES_MODELS_PATH/" 2>/dev/null && echo "✅ Tree_3_2.fbx copied" || echo "❌ Tree_3_2.fbx failed"
    cp "$FRISTY_PATH/Trees/Tree_3_3.fbx" "$TREES_MODELS_PATH/" 2>/dev/null && echo "✅ Tree_3_3.fbx copied" || echo "❌ Tree_3_3.fbx failed"
    cp "$FRISTY_PATH/Trees/Tree_3_4.fbx" "$TREES_MODELS_PATH/" 2>/dev/null && echo "✅ Tree_3_4.fbx copied" || echo "❌ Tree_3_4.fbx failed"
else
    echo "❌ Fristy Trees directory not found at $FRISTY_PATH/Trees"
    exit 1
fi

# Copy tree textures
echo "🍃 Copying tree textures..."
if [ -d "$FRISTY_PATH/Trees/Maps" ]; then
    cp "$FRISTY_PATH/Trees/Maps/4_Trees_Albedo_.png" "$TREES_TEXTURES_PATH/" 2>/dev/null && echo "✅ 4_Trees_Albedo_.png copied" || echo "❌ 4_Trees_Albedo_.png failed"
    cp "$FRISTY_PATH/Trees/Maps/billboards_Difuse.png" "$TREES_TEXTURES_PATH/" 2>/dev/null && echo "✅ billboards_Difuse.png copied" || echo "❌ billboards_Difuse.png failed"
    cp "$FRISTY_PATH/Trees/Maps/billboards_Normal.png" "$TREES_TEXTURES_PATH/" 2>/dev/null && echo "✅ billboards_Normal.png copied" || echo "❌ billboards_Normal.png failed"
    
    # Optional normal map
    cp "$FRISTY_PATH/Trees/Maps/4_trees__normals.png" "$TREES_TEXTURES_PATH/" 2>/dev/null && echo "✅ 4_trees__normals.png copied" || echo "ℹ️ 4_trees__normals.png not found (optional)"
else
    echo "❌ Fristy Trees/Maps directory not found at $FRISTY_PATH/Trees/Maps"
    exit 1
fi

# Verify files were copied
echo ""
echo "📋 Verification:"
echo "Tree Models:"
ls -la "$TREES_MODELS_PATH/"
echo ""
echo "Tree Textures:"
ls -la "$TREES_TEXTURES_PATH/"

echo ""
echo "🎉 Unity Trees Integration Complete!"
echo "🚀 Now restart your drift game to see the Unity trees with proper textures."
echo "💡 Check the game UI for tree count and texture status."
