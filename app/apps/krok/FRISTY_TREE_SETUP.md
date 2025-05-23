# 🌲 Fristy Stylize Tree System Setup Guide

## 📁 Asset Placement Instructions

Your enhanced drift game is now ready for the **Fristy Stylize Modular Assets 2** trees! Here's exactly where to place your Unity assets:

### 🌳 Tree Models
Place these FBX files in: `/public/assets/krok/models/trees/`

- `Tree_3_1.fbx`
- `Tree_3_2.fbx` 
- `Tree_3_3.fbx`
- `Tree_3_4.fbx`

### 🎨 Tree Textures  
Place these texture files in: `/public/assets/krok/textures/trees/`

- `4_Trees_Albedo_.png` (Main color/diffuse texture)
- `4_tree_normals.png` (Normal map for surface detail)
- `4_tree_occlusion.png` (Ambient occlusion for depth)

## 🚀 What You Get

### ✨ Features Now Active:
- **120 Stunning Trees** scattered across your terrain
- **4 Tree Variants** from Fristy Stylize pack for natural variety
- **Instanced Rendering** for optimal performance
- **Automatic LOD/Culling** - trees fade at distance
- **Exclusion Zone** - no trees spawn near car start point
- **Dynamic Scaling** - trees vary in size (0.7x to 1.5x)
- **Proper Texturing** - Fristy albedo, normals, and AO maps applied

### 🎮 Debug Controls:
- **Press 'T'** - Toggle tree visibility on/off
- **Press 'D'** - Toggle debug info panel
- **Tree Counter** - See live tree count in UI

### 📊 Performance:
- **Target**: 60 FPS maintained with 120 trees
- **Distance Culling**: Trees beyond 200 units are hidden
- **Instanced Meshes**: Optimal GPU performance
- **Fallback System**: Simple trees if Fristy models fail to load

## 🔧 Customization Options

You can adjust tree settings in `DriftGame.ts` in the `initializeTreeSystem()` method:

```typescript
await this.treeSystem.initialize({
  treeCount: 120,        // Number of trees (adjust for performance)
  terrainSize: 400,      // Area coverage radius
  minScale: 0.7,         // Minimum tree size
  maxScale: 1.5,         // Maximum tree size  
  exclusionRadius: 30,   // Clear zone around spawn point
  spawnPoint: new THREE.Vector3(0, 0, 0),
});
```

## 🎯 Fallback Behavior

If Fristy assets aren't found, the system automatically creates simple placeholder trees so your game still works perfectly!

## ⚡ Performance Tips

1. **Start with 120 trees** and adjust based on your hardware
2. **Monitor FPS** using the built-in counter (Press 'F' in debug mode)
3. **Reduce tree count** if performance drops below 30 FPS
4. **Increase exclusion radius** to keep more area clear for driving

## 🎨 Visual Quality

The system applies the full Fristy material setup:
- **Albedo texture** for base colors
- **Normal maps** for surface detail and lighting
- **Ambient occlusion** for realistic depth and shadows
- **Proper roughness/metalness** values for stylized look

Your drift game now has a stunning forest environment while preserving all your working collision and car physics! 🏎️💨

## 🐛 Troubleshooting

- **No trees visible**: Check that FBX files are in `/public/assets/krok/models/trees/`
- **Trees look flat**: Ensure texture files are in `/public/assets/krok/textures/trees/`
- **Performance issues**: Reduce `treeCount` in the initialization config
- **Trees too close to car**: Increase `exclusionRadius` value

Ready to race through your Fristy forest! 🌲🚗💨
