// /app/components/arcade/GameEngine.ts
// SHARED FOUNDATION - All games inherit from this

import * as THREE from 'three';

export interface GameConfiguration {
  targetFPS: number;
  enablePhysics: boolean;
  enableAudio: boolean;
  maxAssetMemory: number;
  renderDistance: number;
  shadowQuality: 'low' | 'medium' | 'high';
  pauseOnBlur: boolean;
  adaptiveQuality: boolean;
}

export abstract class UniversalGameEngine {
  // Shared by ALL games in Zenithos Arcade
  protected container: HTMLElement;
  protected renderer: THREE.WebGLRenderer | null = null;
  protected scene: THREE.Scene | null = null;
  protected camera: THREE.Camera | null = null;
  protected clock = new THREE.Clock();
  
  private animationFrameId: number | null = null;
  private isRunning = false;
  private isDisposed = false;
  protected config: GameConfiguration;

  constructor(container: HTMLElement, config: GameConfiguration) {
    this.container = container;
    this.config = config;
    console.log(`🎮 Universal Game Engine initialized for container`);
  }

  // ===== METHODS EVERY GAME MUST IMPLEMENT =====
  protected abstract initializeScene(): Promise<void>;
  protected abstract updateGame(deltaTime: number): void;
  protected abstract handleResize(): void;
  protected abstract disposeGame(): void;

  // ===== SHARED FUNCTIONALITY FOR ALL GAMES =====
  
  public async initialize(): Promise<void> {
    if (this.isDisposed) throw new Error('Cannot initialize disposed game engine');

    try {
      this.setupRenderer();
      this.scene = new THREE.Scene();
      await this.initializeScene();
      window.addEventListener('resize', this.onWindowResize.bind(this));
      console.log(`✅ Game engine initialized successfully`);
    } catch (error) {
      console.error('❌ Failed to initialize game engine:', error);
      throw error;
    }
  }

  public start(): void {
    if (this.isRunning || this.isDisposed) return;
    this.isRunning = true;
    this.clock.start();
    this.gameLoop();
    console.log('🎮 Game loop started');
  }

  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log('⏸️ Game loop stopped');
  }

  public dispose(): void {
    if (this.isDisposed) return;
    
    this.stop();
    window.removeEventListener('resize', this.onWindowResize);
    this.disposeGame();
    
    if (this.renderer) {
      this.renderer.dispose();
      const canvas = this.renderer.domElement;
      if (canvas && canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
      this.renderer = null;
    }
    
    if (this.scene) {
      this.scene.clear();
      this.scene = null;
    }
    
    this.camera = null;
    this.isDisposed = true;
    console.log('🗑️ Game engine disposed');
  }

  // ===== PRIVATE SHARED METHODS =====

  private setupRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio <= 1.5,
      powerPreference: 'high-performance',
      precision: 'mediump'
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    
    // Shadow configuration
    if (this.config.shadowQuality !== 'low') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = this.config.shadowQuality === 'high' 
        ? THREE.PCFSoftShadowMap 
        : THREE.BasicShadowMap;
    }
    
    // Universal canvas styling for Zenithos containers
    const canvas = this.renderer.domElement;
    canvas.style.cssText = `
      width: 100%;
      height: 100%;
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      outline: none;
      background: transparent;
    `;
    
    this.container.appendChild(canvas);
  }

  private gameLoop(): void {
    if (!this.isRunning || this.isDisposed) return;
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    const deltaTime = this.clock.getDelta();
    
    if (deltaTime > 0.1) return; // Skip if tab was inactive
    
    try {
      this.updateGame(deltaTime);
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    } catch (error) {
      console.error('Error in game loop:', error);
      this.stop();
    }
  }

  private onWindowResize(): void {
    if (this.renderer) {
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    this.handleResize();
  }

  // ===== SHARED UTILITIES =====
  
  public getCurrentFPS(): number {
    // Implement FPS calculation
    return Math.round(1 / this.clock.getDelta());
  }
}
