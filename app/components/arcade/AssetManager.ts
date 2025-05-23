// /app/components/arcade/AssetManager.ts  
// SHARED ASSET SYSTEM - Used by all games

import * as THREE from 'three';

export interface AssetDefinition {
  id: string;
  type: 'model' | 'texture' | 'audio';
  path: string;
  format?: 'fbx' | 'glb' | 'gltf' | 'png' | 'jpg' | 'webp' | 'mp3' | 'ogg';
  preload?: boolean;
}

export interface AssetPack {
  id: string;
  name: string;
  version: string;
  assets: AssetDefinition[];
}

export class UniversalAssetManager {
  private static instance: UniversalAssetManager;
  private cache = new Map<string, any>();
  private loaders = new Map<string, THREE.Loader>();
  private loadingPromises = new Map<string, Promise<any>>();

  public static getInstance(): UniversalAssetManager {
    if (!UniversalAssetManager.instance) {
      UniversalAssetManager.instance = new UniversalAssetManager();
    }
    return UniversalAssetManager.instance;
  }

  private constructor() {
    this.setupLoaders();
  }

  private setupLoaders(): void {
    // Basic loaders
    this.loaders.set('texture', new THREE.TextureLoader());
    this.loaders.set('audio', new THREE.AudioLoader());
    
    // Model loaders (loaded dynamically to reduce bundle size)
    this.setupModelLoaders();
  }

  private async setupModelLoaders(): Promise<void> {
    try {
      const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
      
      this.loaders.set('fbx', new FBXLoader());
      this.loaders.set('gltf', new GLTFLoader());
      this.loaders.set('glb', new GLTFLoader());
      
      console.log('📦 Model loaders initialized');
    } catch (error) {
      console.error('Failed to setup model loaders:', error);
    }
  }

  /**
   * Load complete asset pack for a game
   */
  public async loadAssetPack(pack: AssetPack): Promise<void> {
    console.log(`📦 Loading asset pack: ${pack.name} v${pack.version}`);
    
    const loadPromises = pack.assets.map(asset => this.loadAsset(asset));
    
    try {
      await Promise.all(loadPromises);
      console.log(`✅ Asset pack loaded: ${pack.name}`);
    } catch (error) {
      console.error(`❌ Failed to load asset pack: ${pack.name}`, error);
      throw error;
    }
  }

  /**
   * Load individual asset
   */
  public async loadAsset(asset: AssetDefinition): Promise<any> {
    // Return from cache if already loaded
    if (this.cache.has(asset.id)) {
      return this.cache.get(asset.id);
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(asset.id)) {
      return this.loadingPromises.get(asset.id);
    }

    // Start loading
    const loadPromise = this.doLoadAsset(asset);
    this.loadingPromises.set(asset.id, loadPromise);

    try {
      const loadedAsset = await loadPromise;
      this.cache.set(asset.id, loadedAsset);
      this.loadingPromises.delete(asset.id);
      
      console.log(`✅ Asset loaded: ${asset.id}`);
      return loadedAsset;
    } catch (error) {
      this.loadingPromises.delete(asset.id);
      console.error(`❌ Failed to load asset: ${asset.id}`, error);
      throw error;
    }
  }

  private async doLoadAsset(asset: AssetDefinition): Promise<any> {
    // Determine loader type
    const fileExtension = asset.path.split('.').pop()?.toLowerCase();
    let loaderType = asset.format || asset.type;
    
    // Override based on file extension
    if (fileExtension === 'fbx' || fileExtension === 'gltf' || fileExtension === 'glb') {
      loaderType = fileExtension;
    }

    // Wait for model loaders to be ready
    if (['fbx', 'gltf', 'glb'].includes(loaderType)) {
      await this.setupModelLoaders();
    }

    const loader = this.loaders.get(loaderType);
    if (!loader) {
      throw new Error(`No loader available for asset type: ${loaderType}`);
    }

    return new Promise((resolve, reject) => {
      loader.load(
        asset.path,
        (result) => {
          // Post-process based on type
          if (asset.type === 'texture' && result instanceof THREE.Texture) {
            result.anisotropy = 4; // Better texture quality
          }
          resolve(result);
        },
        (progress) => {
          // Optional: Progress tracking
          const percent = Math.round((progress.loaded / progress.total) * 100);
          console.log(`Loading ${asset.id}: ${percent}%`);
        },
        (error) => reject(error)
      );
    });
  }

  /**
   * Get cached asset
   */
  public getAsset<T = any>(assetId: string): T | null {
    return this.cache.get(assetId) || null;
  }

  /**
   * Check if asset is loaded
   */
  public isAssetLoaded(assetId: string): boolean {
    return this.cache.has(assetId);
  }

  /**
   * Get loading progress for pack
   */
  public getPackProgress(pack: AssetPack): { loaded: number; total: number; percent: number } {
    const total = pack.assets.length;
    const loaded = pack.assets.filter(asset => this.isAssetLoaded(asset.id)).length;
    const percent = Math.round((loaded / total) * 100);
    
    return { loaded, total, percent };
  }

  /**
   * Dispose assets for specific game
   */
  public disposeAssetPack(packId: string): void {
    console.log(`🗑️ Disposing asset pack: ${packId}`);
    // Implementation would track pack ownership and dispose accordingly
  }

  /**
   * Get memory usage estimate
   */
  public getMemoryUsage(): { assets: number; sizeMB: number } {
    return {
      assets: this.cache.size,
      sizeMB: Math.round(this.cache.size * 2) // Rough estimate
    };
  }
}
