import * as THREE from "three";
import { Player } from "./Player";
import { Ghost } from "./Ghost";
import { Dot } from "./Dot";
import { PowerPellet } from "./PowerPellet";

// Layout of the level using a simple grid
// # = wall, . = dot, o = power pellet, P = player start, G = ghost start
const LEVEL_LAYOUT = [
  "###########################",
  "#............#............#",
  "#.####.#####.#.#####.####.#",
  "#o####.#####.#.#####.####o#",
  "#.####.#####.#.#####.####.#",
  "#.........................#",
  "#.####.##.#######.##.####.#",
  "#.####.##.#######.##.####.#",
  "#......##....#....##......#",
  "######.##### # #####.######",
  "     #.##### # #####.#     ",
  "     #.##    G    ##.#     ",
  "     #.## ######### ##.#     ",
  "######.## #       # ##.######",
  "      .   #       #   .      ",
  "######.## ######### ##.######",
  "     #.##           ##.#     ",
  "     #.##           ##.#     ",
  "     #.## ######### ##.#     ",
  "######.## ######### ##.######",
  "#............#............#",
  "#.####.#####.#.#####.####.#",
  "#.####.#####.#.#####.####.#",
  "#o..#.........P.........#o#",
  "###.#.##.#########.##.#.###",
  "###.#.##.#########.##.#.###",
  "#......##.....#.....##.....#",
  "#.##########.#.##########.#",
  "#.##########.#.##########.#",
  "#.........................#",
  "###########################",
];

export class Level {
  private scene: THREE.Scene;
  private player: Player | null = null;
  private ghosts: Ghost[] = [];
  private dots: Dot[] = [];
  private pellets: PowerPellet[] = [];
  private walls: THREE.Mesh[] = [];
  private grid: {
    [key: string]: { type: string; object: THREE.Object3D | null };
  } = {};

  private playerStartPosition = new THREE.Vector3(14, 23, 0);
  private ghostStartPosition = new THREE.Vector3(14, 11, 0);
  private score = 0;
  private livesDisplay: HTMLElement | null = null;
  private scoreDisplay: HTMLElement | null = null;
  private lives = 3;

  // Add getter for player to allow camera to follow
  public getPlayer(): Player | null {
    return this.player;
  }

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.livesDisplay = document.getElementById("lives-display");
    this.scoreDisplay = document.getElementById("score-display");
  }

  public load(): void {
    // Clear any existing level objects
    this.clearLevel();

    // Parse the level layout
    this.parseLevel();

    // Create player
    this.player = new Player(this.playerStartPosition);
    this.scene.add(this.player.getMesh());

    // Create ghosts
    this.createGhosts();

    // Update UI
    this.updateLivesDisplay();
    this.updateScoreDisplay();
  }

  public update(deltaTime: number, keys: { [key: string]: boolean }): void {
    // Update player
    if (this.player) {
      const previousPosition = this.player.getMesh().position.clone();
      this.player.update(deltaTime, keys);

      // Check collision with walls
      if (this.checkWallCollision(this.player.getMesh())) {
        this.player.getMesh().position.copy(previousPosition);
      }

      // Check collision with dots and pellets
      this.checkDotCollision();
      this.checkPelletCollision();

      // Check collision with ghosts
      this.checkGhostCollision();
    }

    // Update ghosts
    this.ghosts.forEach((ghost) => {
      ghost.update(deltaTime, this.player?.getMesh().position);
    });
  }

  public dispose(): void {
    this.clearLevel();
  }

  private clearLevel(): void {
    // Remove player
    if (this.player) {
      this.scene.remove(this.player.getMesh());
      this.player = null;
    }

    // Remove ghosts
    this.ghosts.forEach((ghost) => {
      this.scene.remove(ghost.getMesh());
    });
    this.ghosts = [];

    // Remove dots
    this.dots.forEach((dot) => {
      this.scene.remove(dot.getMesh());
    });
    this.dots = [];

    // Remove pellets
    this.pellets.forEach((pellet) => {
      this.scene.remove(pellet.getMesh());
    });
    this.pellets = [];

    // Remove walls
    this.walls.forEach((wall) => {
      this.scene.remove(wall);
    });
    this.walls = [];

    // Clear grid
    this.grid = {};
  }

  private parseLevel(): void {
    // Create a game board that's flat on the XY plane
    const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });

    // Create a floor plane for the entire level
    const floorGeometry = new THREE.PlaneGeometry(30, 31);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2; // Rotate to be horizontal
    floor.position.set(14, 15, -0.5); // Center the floor under the maze
    this.scene.add(floor);

    for (let y = 0; y < LEVEL_LAYOUT.length; y++) {
      const row = LEVEL_LAYOUT[y];
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        const position = new THREE.Vector3(x, LEVEL_LAYOUT.length - 1 - y, 0);

        // Store in grid for collision detection
        const gridKey = `${position.x},${position.y}`;

        switch (cell) {
          case "#": // Wall
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.copy(position);
            this.scene.add(wall);
            this.walls.push(wall);
            this.grid[gridKey] = { type: "wall", object: wall };
            break;

          case ".": // Dot
            const dot = new Dot(position);
            this.scene.add(dot.getMesh());
            this.dots.push(dot);
            this.grid[gridKey] = { type: "dot", object: dot.getMesh() };
            break;

          case "o": // Power pellet
            const pellet = new PowerPellet(position);
            this.scene.add(pellet.getMesh());
            this.pellets.push(pellet);
            this.grid[gridKey] = { type: "pellet", object: pellet.getMesh() };
            break;

          case "P": // Player start
            this.playerStartPosition.copy(position);
            this.grid[gridKey] = { type: "empty", object: null };
            break;

          case "G": // Ghost start
            this.ghostStartPosition.copy(position);
            this.grid[gridKey] = { type: "empty", object: null };
            break;

          default:
            this.grid[gridKey] = { type: "empty", object: null };
            break;
        }
      }
    }
  }

  private createGhosts(): void {
    // Create 4 ghosts with different colors
    const colors = [0xff0000, 0x00ffff, 0xff69b4, 0xffa500];

    for (let i = 0; i < 4; i++) {
      const offset = new THREE.Vector3((i - 1.5) * 1.5, 0, 0);
      const position = this.ghostStartPosition.clone().add(offset);
      const ghost = new Ghost(position, colors[i]);
      this.scene.add(ghost.getMesh());
      this.ghosts.push(ghost);
    }
  }

  private checkWallCollision(object: THREE.Object3D): boolean {
    const position = object.position.clone();

    // Check collision with walls at rounded position
    const roundedPosition = position.clone().round();
    const gridKey = `${roundedPosition.x},${roundedPosition.y}`;

    return this.grid[gridKey]?.type === "wall";
  }

  private checkDotCollision(): void {
    if (!this.player) return;

    const position = this.player.getMesh().position.clone().round();
    const gridKey = `${position.x},${position.y}`;

    if (this.grid[gridKey]?.type === "dot") {
      const dotIndex = this.dots.findIndex(
        (dot) => dot.getMesh() === this.grid[gridKey].object
      );

      if (dotIndex !== -1) {
        // Remove the dot from the scene
        this.scene.remove(this.dots[dotIndex].getMesh());
        this.dots.splice(dotIndex, 1);

        // Update grid
        this.grid[gridKey] = { type: "empty", object: null };

        // Update score
        this.score += 10;
        this.updateScoreDisplay();

        // Play sound (would implement properly in a full game)
        // this.playSound('chomp');
      }
    }
  }

  private checkPelletCollision(): void {
    if (!this.player) return;

    const position = this.player.getMesh().position.clone().round();
    const gridKey = `${position.x},${position.y}`;

    if (this.grid[gridKey]?.type === "pellet") {
      const pelletIndex = this.pellets.findIndex(
        (pellet) => pellet.getMesh() === this.grid[gridKey].object
      );

      if (pelletIndex !== -1) {
        // Remove the pellet from the scene
        this.scene.remove(this.pellets[pelletIndex].getMesh());
        this.pellets.splice(pelletIndex, 1);

        // Update grid
        this.grid[gridKey] = { type: "empty", object: null };

        // Update score
        this.score += 50;
        this.updateScoreDisplay();

        // Make ghosts vulnerable
        this.ghosts.forEach((ghost) => ghost.setVulnerable(true));

        // Set a timeout to make ghosts normal again
        setTimeout(() => {
          this.ghosts.forEach((ghost) => ghost.setVulnerable(false));
        }, 10000);

        // Play sound (would implement properly in a full game)
        // this.playSound('powerPellet');
      }
    }
  }

  private checkGhostCollision(): void {
    if (!this.player) return;

    this.ghosts.forEach((ghost, index) => {
      const distance = this.player!.getMesh().position.distanceTo(
        ghost.getMesh().position
      );

      if (distance < 1) {
        if (ghost.isVulnerable()) {
          // Ghost is vulnerable, eat it
          ghost.reset(this.ghostStartPosition.clone());

          // Update score
          this.score += 200;
          this.updateScoreDisplay();

          // Play sound (would implement properly in a full game)
          // this.playSound('eatGhost');
        } else {
          // Player dies
          this.lives--;
          this.updateLivesDisplay();

          if (this.lives > 0 && this.player) {
            // Reset player position
            this.player.reset(this.playerStartPosition.clone());

            // Play sound (would implement properly in a full game)
            // this.playSound('death');
          } else {
            // Game over
            console.log("Game Over");
            // this.showGameOver();
          }
        }
      }
    });
  }

  private updateScoreDisplay(): void {
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = `Score: ${this.score}`;
    }
  }

  private updateLivesDisplay(): void {
    if (this.livesDisplay) {
      this.livesDisplay.innerHTML = "";

      for (let i = 0; i < this.lives; i++) {
        const lifeElement = document.createElement("div");
        lifeElement.className = "w-4 h-4 rounded-full bg-yellow-400";
        this.livesDisplay.appendChild(lifeElement);
      }
    }
  }
}
