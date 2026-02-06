# AI Context - MOSCÃO FIGHTER

## Project Overview
**MOSCÃO FIGHTER** is a web-based horizontal space shooter arcade game.
-   **Core Technologies**: HTML5 Canvas, Vanilla JavaScript (ES6 Modules), CSS3.
-   **Backend Helper**: PHP (specifically for `scores.php` and `get_music_files.php`).
-   **Persistence**: SQLite (`scores.db`) for storing proper high scores locally (requires XAMPP/Apache).
-   **Environment**: Intended to run in a web browser via a local web server (e.g., localhost).

## Architectural Patterns

### 1. Game Architecture
The game follows a simple **Game Loop** pattern managed in `Game.js`:
-   **Initialization**: `init()` sets up systems, loads config, and binds events.
-   **Loop**: `loop()` (via `requestAnimationFrame`) handles calculating `APP.deltaTime`, updating logic `update(deltaTime)`, and rendering `draw()`.
-   **State Machine**:
    -   `START`: Instructions and main menu.
    -   `PLAYING`: Main gameplay loop.
    -   `LEVEL_TRANSITION`: Waiting for screen clear and checking level progression.
    -   `GAMEOVER`: End state, showing score.
    -   `ENTER_NAME`: Input state for high score submission.
    -   `CELEBRATION`: Special state for fireworks/congrats.

### 2. Entity Management
The game uses a lightweight Object-Oriented approach rather than a strict ECS:
-   **Game Class**: The central god object (`src/Game.js`) that instantiates and holds references to all managers (`Player`, `Grid`, `SoundManager`).
-   **Entities**: Classes in `src/entities/` (`Player.js`, `Bullet.js`, `Shape.js`) handle their own update/draw logic but often accept the `Game` instance to access global state.
-   **Systems**: Classes in `src/systems/` (`Grid.js`, `Starfield.js`, `SoundManager.js`) manage collections of entities or global effects.

### 3. Key Subsystems
-   **i18n**: The `src/i18n.js` module handles text translations (PT-BR / EN-US), detecting browser language on startup.
-   **Audio**: `SoundManager.js` handles sound effects. Music is handled dynamically in `Game.js` with cross-fading and variation selection based on level (loaded via `get_music_files.php`).
-   **Grid/Enemies**: `Grid.js` manages the falling "tetris-like" blocks (`Shape.js`).

## Coding Conventions
-   **Modules**: Usage of ES6 `import`/`export`. `index.html` loads `game.js` with `type="module"`.
-   **Variables**: CamelCase for methods/vars (`game.startLevelTransition()`).
-   **Styling**: `style.css` handles UI overlays (DOM elements) while the game action happens on `<canvas>`.
