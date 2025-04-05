// app/apps/pacman/PacmanGameController.ts
import * as THREE from "three";
import { createTextSprite, KeyState } from "./utils";

// Constants
const PACMAN_SPEED = 2,
  PACMAN_RADIUS = 0.25;
const GHOST_SPEED = 1.5,
  GHOST_RADIUS = PACMAN_RADIUS * 1.25;
const DOT_RADIUS = 0.05,
  PELLET_RADIUS = DOT_RADIUS * 2;
const UP = new THREE.Vector3(0, 0, 1);
const LEFT = new THREE.Vector3(-1, 0, 0);
const TOP = new THREE.Vector3(0, 1, 0);
const RIGHT = new THREE.Vector3(1, 0, 0);
const BOTTOM = new THREE.Vector3(0, -1, 0);

// Level definition
const LEVEL = [
  "# # # # # # # # # # # # # # # # # # # # # # # # # # # #",
  "# . . . . . . . . . . . . # # . . . . . . . . . . . . #",
  "# . # # # # . # # # # # . # # . # # # # # . # # # # . #",
  "# o # # # # . # # # # # . # # . # # # # # . # # # # o #",
  "# . # # # # . # # # # # . # # . # # # # # . # # # # . #",
  "# . . . . . . . . . . . . . . . . . . . . . . . . . . #",
  "# . # # # # . # # . # # # # # # # # . # # . # # # # . #",
  "# . # # # # . # # . # # # # # # # # . # # . # # # # . #",
  "# . . . . . . # # . . . . # # . . . . # # . . . . . . #",
  "# # # # # # . # # # # #   # #   # # # # # . # # # # # #",
  "          # . # # # # #   # #   # # # # # . #          ",
  "          # . # #         G           # # . #          ",
  "          # . # #   # # # # # # # #   # # . #          ",
  "# # # # # # . # #   #             #   # # . # # # # # #",
  "            .       #             #       .            ",
  "# # # # # # . # #   #             #   # # . # # # # # #",
  "          # . # #   # # # # # # # #   # # . #          ",
  "          # . # #                     # # . #          ",
  "          # . # #   # # # # # # # #   # # . #          ",
  "# # # # # # . # #   # # # # # # # #   # # . # # # # # #",
  "# . . . . . . . . . . . . # # . . . . . . . . . . . . #",
  "# . # # # # . # # # # # . # # . # # # # # . # # # # . #",
  "# . # # # # . # # # # # . # # . # # # # # . # # # # . #",
  "# o . . # # . . . . . . . P   . . . . . . . # # . . o #",
  "# # # . # # . # # . # # # # # # # # . # # . # # . # # #",
  "# # # . # # . # # . # # # # # # # # . # # . # # . # # #",
  "# . . . . . . # # . . . . # # . . . . # # . . . . . . #",
  "# . # # # # # # # # # # . # # . # # # # # # # # # # . #",
  "# . # # # # # # # # # # . # # . # # # # # # # # # # . #",
  "# . . . . . . . . . . . . . . . . . . . . . . . . . . #",
  "# # # # # # # # # # # # # # # # # # # # # # # # # # # #",
];

export class PacmanGameController {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private hudCamera: THREE.OrthographicCamera;
  private map: any = {};
  private pacman: THREE.Mesh;
  private keyState: KeyState;
  private animationFrameId: number | null = null;
  private previousFrameTime: number = 0;
  private numDotsEaten: number = 0;
  private lives: number = 3;
  private ghostSpawnTime: number = -8;
  private numGhosts: number = 0;
  private won: boolean = false;
  private lost: boolean = false;
  private lostTime: number = 0;
  private wonTime: number = 0;
  private animationSeconds: number = 0;

  // Sound effects
  private chompSound: HTMLAudioElement;
  private levelStartSound: HTMLAudioElement;
  private deathSound: HTMLAudioElement;
  private killSound: HTMLAudioElement;

  constructor(container: HTMLElement) {
    this.container = container;

    // Initialize properties that don't require DOM or other async operations
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.hudCamera = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 100);

    // Initialize keyState with utility function
    this.keyState = { cleanup: () => {} } as KeyState;

    // Initialize pacman as a placeholder (will be replaced in init)
    this.pacman = new THREE.Mesh();

    // Preload audio
    this.chompSound = new Audio("/media/pacman/pacman_chomp.mp3");
    this.levelStartSound = new Audio("/media/pacman/pacman_beginning.mp3");
    this.deathSound = new Audio("/media/pacman/pacman_death.mp3");
    this.killSound = new Audio("/media/pacman/pacman_eatghost.mp3");

    // Configure audio
    this.chompSound.volume = 0.5;
    this.chompSound.loop = true;
    this.levelStartSound.volume = 0.7;
    this.deathSound.volume = 0.7;
    this.killSound.volume = 0.7;
  }

  // Initialize the game (can be async)
  async init(): Promise<void> {
    this.setupRenderer();
    this.setupScene();
    this.setupKeyboardEvents();
    this.setupResizeHandler();

    // Create the game map
    this.map = this.createMap(LEVEL);

    // Create HUD camera
    this.hudCamera = this.createHudCamera(this.map);

    // Create pacman
    this.pacman = this.createPacman(this.map.pacmanSpawn);

    // Create lives display
    this.createLivesDisplay();

    return Promise.resolve();
  }

  // Start the game
  start(): void {
    // Play start sound
    this.levelStartSound.play();

    // Reset any game state if needed
    this.won = false;
    this.lost = false;
    this.numDotsEaten = 0;

    // Start animation loop
    this.previousFrameTime = performance.now();
    this.animationLoop();
  }

  // Clean up resources
  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Remove event listeners
    this.keyState.cleanup();
    window.removeEventListener("resize", this.handleResize);

    // Dispose Three.js objects
    this.renderer.dispose();

    // Stop sounds
    this.chompSound.pause();
    this.levelStartSound.pause();
    this.deathSound.pause();
    this.killSound.pause();
  }

  // Toggle help dialog
  toggleHelp(): void {
    const helpDialog = document.getElementById("help-dialog");
    if (helpDialog) {
      helpDialog.style.display =
        helpDialog.style.display === "none" || !helpDialog.style.display
          ? "block"
          : "none";
    }
  }

  // Private methods for game setup and logic
  private setupRenderer(): void {
    this.renderer.setClearColor("black", 1.0);
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.container.appendChild(this.renderer.domElement);
  }

  private setupScene(): void {
    // Add ambient light
    this.scene.add(new THREE.AmbientLight(0x888888));

    // Add spotlight
    const light = new THREE.SpotLight("white", 0.5);
    light.position.set(0, 0, 50);
    this.scene.add(light);

    // Setup camera
    this.camera.up.copy(UP);
  }

  private setupKeyboardEvents(): void {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);

    document.body.addEventListener("keydown", this.handleKeyDown);
    document.body.addEventListener("keyup", this.handleKeyUp);
    document.body.addEventListener("blur", this.handleBlur);
  }

  private setupResizeHandler(): void {
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keyState[event.code] = true;
    this.keyState[String.fromCharCode(event.keyCode)] = true;
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keyState[event.code] = false;
    this.keyState[String.fromCharCode(event.keyCode)] = false;
  }

  private handleBlur(): void {
    // Reset key states when window loses focus
    for (const key in this.keyState) {
      if (this.keyState.hasOwnProperty(key)) {
        this.keyState[key] = false;
      }
    }
  }

  private handleResize(): void {
    // Update renderer and camera on window resize
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private animationLoop(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animationLoop());

    const now = performance.now();
    const delta = (now - this.previousFrameTime) / 1000;
    this.previousFrameTime = now;

    // Limit delta to avoid large jumps if the browser was inactive
    const limitedDelta = Math.min(delta, 1 / 30);

    // Update animation time
    this.animationSeconds += limitedDelta;

    // Update game state
    this.update(limitedDelta, this.animationSeconds);

    // Render scene
    this.renderer.setViewport(
      0,
      0,
      this.renderer.domElement.width,
      this.renderer.domElement.height
    );
    this.renderer.render(this.scene, this.camera);

    // Render HUD
    this.renderHud();
  }

  private update(delta: number, now: number): void {
    this.updatePacman(delta, now);
    this.updateCamera(delta, now);

    // Update ghosts and other objects
    const objectsToRemove: THREE.Object3D[] = [];

    this.scene.children.forEach((object: any) => {
      if (object.isGhost === true) {
        this.updateGhost(object, delta, now);
      }

      if (object.isWrapper === true) {
        this.wrapObject(object);
      }

      if (object.isTemporary === true && now > object.removeAfter) {
        objectsToRemove.push(object);
      }
    });

    // Remove temporary objects
    objectsToRemove.forEach((object) => this.scene.remove(object));

    // Spawn ghosts
    if (this.numGhosts < 4 && now - this.ghostSpawnTime > 8) {
      this.createGhost(this.map.ghostSpawn);
      this.numGhosts += 1;
      this.ghostSpawnTime = now;
    }
  }

  // Game creation methods
  private createMap(levelDefinition: string[]): any {
    const map: any = {};
    map.bottom = -(levelDefinition.length - 1);
    map.top = 0;
    map.left = 0;
    map.right = 0;
    map.numDots = 0;
    map.pacmanSpawn = null;
    map.ghostSpawn = null;

    for (let row = 0; row < levelDefinition.length; row++) {
      // Set the coordinates of the map so that they match the
      // coordinate system for objects.
      const y = -row;
      map[y] = {};

      // Get the length of the longest row in the level definition.
      const length = Math.floor(levelDefinition[row].length / 2);
      map.right = Math.max(map.right, length);

      // Skip every second element, which is just a space for readability.
      for (let column = 0; column < levelDefinition[row].length; column += 2) {
        const x = Math.floor(column / 2);
        const cell = levelDefinition[row][column];
        let object = null;

        if (cell === "#") {
          object = this.createWall();
        } else if (cell === ".") {
          object = this.createDot();
          map.numDots += 1;
        } else if (cell === "o") {
          object = this.createPowerPellet();
        } else if (cell === "P") {
          map.pacmanSpawn = new THREE.Vector3(x, y, 0);
        } else if (cell === "G") {
          map.ghostSpawn = new THREE.Vector3(x, y, 0);
        }

        if (object !== null) {
          object.position.set(x, y, 0);
          map[y][x] = object;
          this.scene.add(object);
        }
      }
    }

    map.centerX = (map.left + map.right) / 2;
    map.centerY = (map.bottom + map.top) / 2;

    return map;
  }

  private createWall(): THREE.Mesh {
    const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: "blue" });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    (wall as any).isWall = true;
    return wall;
  }

  private createDot(): THREE.Mesh {
    const dotGeometry = new THREE.SphereGeometry(DOT_RADIUS);
    const dotMaterial = new THREE.MeshPhongMaterial({ color: 0xffdab9 }); // Peach color
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    (dot as any).isDot = true;
    return dot;
  }

  private createPowerPellet(): THREE.Mesh {
    const pelletGeometry = new THREE.SphereGeometry(PELLET_RADIUS, 12, 8);
    const pelletMaterial = new THREE.MeshPhongMaterial({ color: 0xffdab9 }); // Peach color
    const pellet = new THREE.Mesh(pelletGeometry, pelletMaterial);
    (pellet as any).isPowerPellet = true;
    return pellet;
  }

  private createPacman(position: THREE.Vector3): THREE.Mesh {
    // Create spheres with decreasingly small horizontal sweeps for pacman death animation
    const pacmanGeometries: THREE.SphereGeometry[] = [];
    const numFrames = 40;

    for (let i = 0; i < numFrames; i++) {
      const offset = (i / (numFrames - 1)) * Math.PI;
      const geometry = new THREE.SphereGeometry(
        PACMAN_RADIUS,
        16,
        16,
        offset,
        Math.PI * 2 - offset * 2
      );
      geometry.rotateX(Math.PI / 2);
      pacmanGeometries.push(geometry);
    }

    const pacmanMaterial = new THREE.MeshPhongMaterial({
      color: "yellow",
      side: THREE.DoubleSide,
    });

    const pacman = new THREE.Mesh(pacmanGeometries[0], pacmanMaterial);
    (pacman as any).frames = pacmanGeometries;
    (pacman as any).currentFrame = 0;
    (pacman as any).isPacman = true;
    (pacman as any).isWrapper = true;
    (pacman as any).atePellet = false;
    (pacman as any).distanceMoved = 0;

    // Initialize pacman facing left
    pacman.position.copy(position);
    (pacman as any).direction = new THREE.Vector3(-1, 0, 0);

    this.scene.add(pacman);
    return pacman;
  }

  private createGhost(position: THREE.Vector3): THREE.Mesh {
    const ghostGeometry = new THREE.SphereGeometry(GHOST_RADIUS, 16, 16);
    const ghostMaterial = new THREE.MeshPhongMaterial({ color: "red" });
    const ghost = new THREE.Mesh(ghostGeometry, ghostMaterial);

    (ghost as any).isGhost = true;
    (ghost as any).isWrapper = true;
    (ghost as any).isAfraid = false;

    // Ghosts start moving left
    ghost.position.copy(position);
    (ghost as any).direction = new THREE.Vector3(-1, 0, 0);

    this.scene.add(ghost);
    return ghost;
  }

  private createHudCamera(map: any): THREE.OrthographicCamera {
    const halfWidth = (map.right - map.left) / 2;
    const halfHeight = (map.top - map.bottom) / 2;

    const hudCamera = new THREE.OrthographicCamera(
      -halfWidth,
      halfWidth,
      halfHeight,
      -halfHeight,
      1,
      100
    );

    hudCamera.position.copy(new THREE.Vector3(map.centerX, map.centerY, 10));
    hudCamera.lookAt(new THREE.Vector3(map.centerX, map.centerY, 0));

    return hudCamera;
  }

  private createLivesDisplay(): void {
    const livesContainer = document.getElementById("lives");
    if (livesContainer) {
      // Clear existing content
      livesContainer.innerHTML = "";

      // Create life indicators
      for (let i = 0; i < this.lives; i++) {
        const life = document.createElement("div");
        life.className = "life";
        livesContainer.appendChild(life);
      }
    }
  }

  // Game update methods
  private updatePacman(delta: number, now: number): void {
    // Play chomp sound if player is moving
    if (
      !this.won &&
      !this.lost &&
      (this.keyState["W"] ||
        this.keyState["S"] ||
        this.keyState["KeyW"] ||
        this.keyState["KeyS"])
    ) {
      this.chompSound.play();
    } else {
      this.chompSound.pause();
    }

    // Move if we haven't died or won
    if (!this.won && !this.lost) {
      this.movePacman(delta);
    }

    // Check for win
    if (!this.won && this.numDotsEaten === this.map.numDots) {
      this.won = true;
      this.wonTime = now;

      this.showText("You won =D", 1, now);
      this.levelStartSound.play();
    }

    // Go to next level 4 seconds after winning
    if (this.won && now - this.wonTime > 3) {
      // Reset pacman position and direction
      this.pacman.position.copy(this.map.pacmanSpawn);
      (this.pacman as any).direction.copy(LEFT);
      (this.pacman as any).distanceMoved = 0;

      // Reset dots, power pellets, and ghosts
      this.scene.children.forEach((object: any) => {
        if (object.isDot === true || object.isPowerPellet === true) {
          object.visible = true;
        }
        if (object.isGhost === true) {
          this.scene.remove(object);
        }
      });

      // Increase speed
      (PACMAN_SPEED as any) += 1;
      (GHOST_SPEED as any) += 1;

      this.won = false;
      this.numDotsEaten = 0;
      this.numGhosts = 0;
    }

    // Reset pacman 4 seconds after dying
    if (this.lives > 0 && this.lost && now - this.lostTime > 4) {
      this.lost = false;
      this.pacman.position.copy(this.map.pacmanSpawn);
      (this.pacman as any).direction.copy(LEFT);
      (this.pacman as any).distanceMoved = 0;
    }

    // Animate model
    if (this.lost) {
      // If pacman got eaten, show dying animation
      const angle = ((now - this.lostTime) * Math.PI) / 2;
      const frame = Math.min(
        (this.pacman as any).frames.length - 1,
        Math.floor((angle / Math.PI) * (this.pacman as any).frames.length)
      );

      this.pacman.geometry = (this.pacman as any).frames[frame];
    } else {
      // Otherwise, show eating animation based on how much pacman has moved
      const maxAngle = Math.PI / 4;
      const angle = ((this.pacman as any).distanceMoved * 2) % (maxAngle * 2);
      const adjustedAngle = angle > maxAngle ? maxAngle * 2 - angle : angle;
      const frame = Math.floor(
        (adjustedAngle / Math.PI) * (this.pacman as any).frames.length
      );

      this.pacman.geometry = (this.pacman as any).frames[frame];
    }
  }

  private movePacman(delta: number): void {
    // Update rotation based on direction so that mouth is always facing forward
    const pacmanDirection = (this.pacman as any).direction;
    (this.pacman as any).up
      .copy(pacmanDirection)
      .applyAxisAngle(UP, -Math.PI / 2);

    const lookAtPosition = new THREE.Vector3()
      .copy(this.pacman.position)
      .add(UP);
    this.pacman.lookAt(lookAtPosition);

    // Move based on current keys being pressed
    if (this.keyState["W"] || this.keyState["KeyW"]) {
      // W - move forward
      this.pacman.translateOnAxis(LEFT, PACMAN_SPEED * delta);
      (this.pacman as any).distanceMoved += PACMAN_SPEED * delta;
    }

    if (this.keyState["A"] || this.keyState["KeyA"]) {
      // A - rotate left
      pacmanDirection.applyAxisAngle(UP, (Math.PI / 2) * delta);
    }

    if (this.keyState["D"] || this.keyState["KeyD"]) {
      // D - rotate right
      pacmanDirection.applyAxisAngle(UP, (-Math.PI / 2) * delta);
    }

    if (this.keyState["S"] || this.keyState["KeyS"]) {
      // S - move backward
      this.pacman.translateOnAxis(LEFT, -PACMAN_SPEED * delta);
      (this.pacman as any).distanceMoved += PACMAN_SPEED * delta;
    }

    // Check for collision with walls
    const leftSide = this.pacman.position
      .clone()
      .addScaledVector(LEFT, PACMAN_RADIUS)
      .round();
    const topSide = this.pacman.position
      .clone()
      .addScaledVector(TOP, PACMAN_RADIUS)
      .round();
    const rightSide = this.pacman.position
      .clone()
      .addScaledVector(RIGHT, PACMAN_RADIUS)
      .round();
    const bottomSide = this.pacman.position
      .clone()
      .addScaledVector(BOTTOM, PACMAN_RADIUS)
      .round();

    if (this.isWall(leftSide)) {
      this.pacman.position.x = leftSide.x + 0.5 + PACMAN_RADIUS;
    }
    if (this.isWall(rightSide)) {
      this.pacman.position.x = rightSide.x - 0.5 - PACMAN_RADIUS;
    }
    if (this.isWall(topSide)) {
      this.pacman.position.y = topSide.y - 0.5 - PACMAN_RADIUS;
    }
    if (this.isWall(bottomSide)) {
      this.pacman.position.y = bottomSide.y + 0.5 + PACMAN_RADIUS;
    }

    // Check for dots and power pellets
    const cell = this.getAt(this.pacman.position);

    // Make pacman eat dots
    if (cell && (cell as any).isDot === true && cell.visible === true) {
      this.removeAt(this.pacman.position);
      this.numDotsEaten += 1;
    }

    // Make pacman eat power pellets
    (this.pacman as any).atePellet = false;
    if (cell && (cell as any).isPowerPellet === true && cell.visible === true) {
      this.removeAt(this.pacman.position);
      (this.pacman as any).atePellet = true;

      this.killSound.play();
    }
  }

  private updateCamera(delta: number, now: number): void {
    // Target positions for camera
    let targetPosition = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3();

    if (this.won) {
      // After winning, pan camera out to show whole level
      targetPosition.set(this.map.centerX, this.map.centerY, 30);
      targetLookAt.set(this.map.centerX, this.map.centerY, 0);
    } else if (this.lost) {
      // After losing, move camera to look down at pacman's body from above
      targetPosition.copy(this.pacman.position).addScaledVector(UP, 4);
      targetLookAt
        .copy(this.pacman.position)
        .addScaledVector((this.pacman as any).direction, 0.01);
    } else {
      // Place camera above and behind pacman, looking towards direction of pacman
      targetPosition
        .copy(this.pacman.position)
        .addScaledVector(UP, 1.5)
        .addScaledVector((this.pacman as any).direction, -1);

      targetLookAt
        .copy(this.pacman.position)
        .add((this.pacman as any).direction);
    }

    // Move camera slowly during win/lose animations
    const cameraSpeed = this.lost || this.won ? 1 : 10;

    // Smooth camera movement
    if (!this.camera.position.equals(targetPosition)) {
      this.camera.position.lerp(targetPosition, delta * cameraSpeed);
    }

    // Track to maintain lookAt position
    if (!(this.camera as any).lookAtPosition) {
      (this.camera as any).lookAtPosition = new THREE.Vector3();
    }

    (this.camera as any).lookAtPosition.lerp(targetLookAt, delta * cameraSpeed);
    this.camera.lookAt((this.camera as any).lookAtPosition);
  }

  private updateGhost(ghost: THREE.Mesh, delta: number, now: number): void {
    // Make all ghosts afraid if Pacman just ate a pellet
    if ((this.pacman as any).atePellet === true) {
      (ghost as any).isAfraid = true;
      (ghost as any).becameAfraidTime = now;

      (ghost.material as THREE.MeshPhongMaterial).color.setStyle("white");
    }

    // Make ghosts not afraid anymore after 10 seconds
    if ((ghost as any).isAfraid && now - (ghost as any).becameAfraidTime > 10) {
      (ghost as any).isAfraid = false;
      (ghost.material as THREE.MeshPhongMaterial).color.setStyle("red");
    }

    this.moveGhost(ghost, delta);

    // Check for collision between Pacman and ghost
    if (
      !this.lost &&
      !this.won &&
      this.distance(this.pacman, ghost) < PACMAN_RADIUS + GHOST_RADIUS
    ) {
      if ((ghost as any).isAfraid === true) {
        this.scene.remove(ghost);
        this.numGhosts -= 1;

        this.killSound.play();
      } else {
        this.lives -= 1;

        // Update life display
        const livesContainer = document.getElementById("lives");
        if (livesContainer && livesContainer.children.length > 0) {
          livesContainer.removeChild(livesContainer.children[0]);
        }

        if (this.lives > 0) {
          this.showText("You died =(", 0.1, now);
        } else {
          this.showText("Game over =(", 0.1, now);
        }

        this.lost = true;
        this.lostTime = now;

        this.deathSound.play();
      }
    }
  }

  private moveGhost(ghost: THREE.Mesh, delta: number): void {
    const previousPosition = new THREE.Vector3()
      .copy(ghost.position)
      .addScaledVector((ghost as any).direction, 0.5)
      .round();

    ghost.translateOnAxis((ghost as any).direction, delta * GHOST_SPEED);

    const currentPosition = new THREE.Vector3()
      .copy(ghost.position)
      .addScaledVector((ghost as any).direction, 0.5)
      .round();

    // If the ghost is transitioning from one cell to the next, see if they can turn
    if (!currentPosition.equals(previousPosition)) {
      const leftTurn = new THREE.Vector3()
        .copy((ghost as any).direction)
        .applyAxisAngle(UP, Math.PI / 2);
      const rightTurn = new THREE.Vector3()
        .copy((ghost as any).direction)
        .applyAxisAngle(UP, -Math.PI / 2);

      const forwardWall = this.isWall(currentPosition);
      const leftWall = this.isWall(
        currentPosition.copy(ghost.position).add(leftTurn)
      );
      const rightWall = this.isWall(
        currentPosition.copy(ghost.position).add(rightTurn)
      );

      if (!leftWall || !rightWall) {
        // If the ghost can turn, randomly choose one of the possible turns
        const possibleTurns = [];
        if (!forwardWall) possibleTurns.push((ghost as any).direction);
        if (!leftWall) possibleTurns.push(leftTurn);
        if (!rightWall) possibleTurns.push(rightTurn);

        if (possibleTurns.length === 0) {
          // Reverse direction if no turns are possible
          (ghost as any).direction.negate();
        } else {
          const newDirection =
            possibleTurns[Math.floor(Math.random() * possibleTurns.length)];
          (ghost as any).direction.copy(newDirection);

          // Snap ghost to center of current cell and start moving in new direction
          ghost.position
            .round()
            .addScaledVector((ghost as any).direction, delta);
        }
      }
    }
  }

  private renderHud(): void {
    // Increase size of pacman and dots in HUD to make them easier to see
    this.scene.children.forEach((object: any) => {
      if (object.isWall !== true) {
        object.scale.set(2.5, 2.5, 2.5);
      }
    });

    // Only render in the bottom left 200x200 square of the screen
    this.renderer.enableScissorTest(true);
    this.renderer.setScissor(10, 10, 200, 200);
    this.renderer.setViewport(10, 10, 200, 200);
    this.renderer.render(this.scene, this.hudCamera);
    this.renderer.enableScissorTest(false);

    // Reset scales after rendering HUD
    this.scene.children.forEach((object: any) => {
      object.scale.set(1, 1, 1);
    });
  }

  // Helper methods
  private getAt(position: THREE.Vector3): THREE.Object3D | null {
    const x = Math.round(position.x);
    const y = Math.round(position.y);

    return this.map[y] && this.map[y][x] ? this.map[y][x] : null;
  }

  private isWall(position: THREE.Vector3): boolean {
    const cell = this.getAt(position);
    return cell !== null && (cell as any).isWall === true;
  }

  private removeAt(position: THREE.Vector3): void {
    const x = Math.round(position.x);
    const y = Math.round(position.y);

    if (this.map[y] && this.map[y][x]) {
      // Don't actually remove, just make invisible
      this.map[y][x].visible = false;
    }
  }

  private wrapObject(object: THREE.Object3D): void {
    if (object.position.x < this.map.left) {
      object.position.x = this.map.right;
    } else if (object.position.x > this.map.right) {
      object.position.x = this.map.left;
    }

    if (object.position.y > this.map.top) {
      object.position.y = this.map.bottom;
    } else if (object.position.y < this.map.bottom) {
      object.position.y = this.map.top;
    }
  }

  private distance(object1: THREE.Object3D, object2: THREE.Object3D): number {
    // Calculate difference between objects' positions
    const difference = new THREE.Vector3()
      .copy(object1.position)
      .sub(object2.position);
    return difference.length();
  }

  private showText(message: string, size: number, now: number): THREE.Sprite {
    // Create text sprite using our utility function
    const text = createTextSprite(message, "red", size * 5);

    // Position text just above pacman
    text.position.copy(this.pacman.position).add(UP);

    // Since sprite always faces camera, no need to set direction

    // Remove after 3 seconds
    (text as any).isTemporary = true;
    (text as any).removeAfter = now + 3;

    this.scene.add(text);
    return text;
  }
}
