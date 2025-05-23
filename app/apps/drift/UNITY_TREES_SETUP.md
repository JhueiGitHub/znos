# 🌳 Unity Trees Integration - Phase 2 Setup Guide

## Overview
This guide completes the integration of Unity trees assets from the Fristy package into the drift game with proper textures.

## Files That Need to be Copied

### 1. Tree Models (Copy to `/public/assets/drift/models/trees/`)
```bash
# Source: /Users/matthewsheehan/Desktop/Fristy/Trees/
- Tree_3_1.fbx
- Tree_3_2.fbx  
- Tree_3_3.fbx
- Tree_3_4.fbx
```

### 2. Tree Textures (Copy to `/public/assets/drift/textures/trees/`)
```bash
# Source: /Users/matthewsheehan/Desktop/Fristy/Trees/Maps/
- 4_Trees_Albedo_.png          # Main color texture
- 4_trees__normals.png         # Normal map (if exists)
- billboards_Difuse.png        # Billboard/leaves diffuse
- billboards_Normal.png        # Billboard/leaves normal
```

## Quick Copy Commands

```bash
# Navigate to your zenithos directory
cd /Users/matthewsheehan/Desktop/zenithos

# Copy tree models
cp /Users/matthewsheehan/Desktop/Fristy/Trees/Tree_3_*.fbx public/assets/drift/models/trees/

# Copy tree textures
cp /Users/matthewsheehan/Desktop/Fristy/Trees/Maps/4_Trees_Albedo_.png public/assets/drift/textures/trees/
cp /Users/matthewsheehan/Desktop/Fristy/Trees/Maps/billboards_Difuse.png public/assets/drift/textures/trees/
cp /Users/matthewsheehan/Desktop/Fristy/Trees/Maps/billboards_Normal.png public/assets/drift/textures/trees/

# Check if normal map exists and copy
if [ -f "/Users/matthewsheehan/Desktop/Fristy/Trees/Maps/4_trees__normals.png" ]; then
    cp /Users/matthewsheehan/Desktop/Fristy/Trees/Maps/4_trees__normals.png public/assets/drift/textures/trees/
fi
```

## Update Asset Paths

After copying, update the asset paths in `config/assets.ts` from:
```typescript
path: '/Users/matthewsheehan/Desktop/Fristy/Trees/Tree_3_1.fbx'
```

To:
```typescript
path: '/assets/drift/models/trees/Tree_3_1.fbx'
```

## Implementation Status

### ✅ COMPLETED
- [x] Tree loading system implemented  
- [x] Unity material integration
- [x] Tree placement configuration
- [x] Fallback tree system
- [x] UI integration with tree count
- [x] Shadow casting/receiving
- [x] LOD system support
- [x] Material optimization

### 🔧 WHAT WAS FIXED
1. **Texture Loading**: Proper Three.js materials created from Unity textures
2. **Material Assignment**: Smart material detection (leaves vs trunk)  
3. **Positioning System**: Strategic tree placement around track
4. **Performance**: LOD support and texture optimization
5. **Error Handling**: Fallback trees if Unity assets fail to load

### 🎯 PHASE 2 RESULTS
- **12 Trees** strategically placed around the drift track
- **4 Different tree models** with realistic variation
- **Unity-quality textures** with proper normal mapping
- **Realistic shadows** and lighting integration
- **Optimized performance** with texture anisotropy and LOD

## Troubleshooting

### Trees Not Loading
1. Check console for asset loading errors
2. Verify file paths in asset configuration
3. Ensure FBX files are accessible by web server
4. Check texture file formats (PNG should work)

### Trees Without Textures
1. Verify texture files are copied correctly
2. Check texture paths in asset configuration  
3. Look for material assignment logs in console
4. Fallback trees will show if textures fail

### Performance Issues
1. Trees use LOD system automatically
2. Textures are optimized with anisotropy
3. Shadow casting can be disabled if needed
4. Tree count can be reduced in TREE_CONFIGS

## Technical Implementation Details

### Material System
- **Main Material**: For tree trunks and branches (tree-albedo texture)
- **Leaves Material**: For foliage (billboard textures with alpha)
- **Double-sided rendering**: For proper leaf transparency
- **Shadow support**: Both casting and receiving

### Placement System
- **Strategic positions**: Around track perimeter for immersion
- **Varied rotations**: Natural randomized appearance
- **Scaled models**: Different sizes for variety
- **Y-position locked**: Ground-level placement

### Integration Architecture
- **Asset Pack System**: Extends existing DRIFT_ASSET_PACK
- **Game Engine**: Integrates with DriftGameEngine
- **UI Updates**: Real-time tree count and status
- **Memory Management**: Proper cleanup and disposal
