# Project Structure - MOSCÃO FIGHTER

## Directory Layout

### Root (`/`)
-   **`index.html`**: Entry point. Contains the DOM UI overlays (Start Screen, Game Over, HUD) and the `<canvas>` element. Loads `game.js`.
-   **`game.js`**: Bootstrap script. Instantiates the main `Game` class from `src/Game.js`.
-   **`style.css`**: Styles for the HTML UI overlays (fonts, positions, animations like blinking text).
-   **`scores.php`**: API endpoint. Handles receiving POST requests to save scores and GET requests to retrieve the top 10. Interacts with `scores.db`.
-   **`get_music_files.php`**: API endpoint. Scans the `assets/music` directory and returns a JSON list of available tracks for the dynamic music system.
-   **`scores.db`**: SQLite database file (binary). Stores player high scores.
-   **`README.md`**: Human-readable documentation.
-   **`AI_CONTEXT.md`**: Architectual context for AI agents.
-   **`PROJECT_STRUCTURE.md`**: This file.

### Source Code (`src/`)
-   **`Game.js`**: Core game logic. Contains the game loop (`update`/`draw`), state management, and orchestration of all other systems.
-   **`constants.js`**: (Likely) Shared constants like screen dimensions or key codes (minimal usage observed).
-   **`i18n.js`**: Internationalization module. Dictionary object containing PT/EN strings and methods to update the DOM.

#### Entities (`src/entities/`)
-   **`Player.js`**: Player ship logic. Movement handling (keyboard/touch) and shooting.
-   **`Bullet.js`**: Projectile logic.
-   **`Shape.js`**: Enemy/Block logic. Handles behavior of falling pieces.

#### Systems (`src/systems/`)
-   **`Grid.js`**: Spawns and manages the `Shape` entities. Handles the "rows" logic similar to Tetris.
-   **`Starfield.js`**: Background visual effect. Manages scrolling stars to give the sensation of speed.
-   **`SoundManager.js`**: Wrapper for loading and playing short SFX (Web Audio API or HTML5 Audio).
-   **`ConfettiSystem.js`**: Visual effect system used for celebrations.
-   **`ParticleSystem.js`**: Visual effect system for explosions (when blocks are destroyed).

### Assets (`assets/`)
-   **`images/`**: Sprites (ship, blocks, backgrounds).
-   **`music/`**: Background tracks (Ogg format).
-   **`audio/`**: Sound effects (SFX).

## Dependency Graph
`index.html` → `game.js` → `src/Game.js`
`src/Game.js` imports:
  ├── `src/entities/Player.js`
  ├── `src/systems/Grid.js`
  ├── `src/systems/Starfield.js`
  ├── `src/systems/SoundManager.js`
  └── `src/i18n.js`
