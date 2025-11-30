import { Shape } from '../entities/Shape.js';
import { BLOCK_SIZE } from '../constants.js';

export class Grid {
    constructor(game) {
        this.game = game;
        this.shapes = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // ms
        this.fallSpeed = 0.2;
    }

    update(deltaTime) {
        // Check if any shape is clearing
        const isClearing = this.shapes.some(s => s.clearing);

        if (isClearing) {
            // Only update the clearing shape(s)
            this.shapes.forEach(shape => {
                if (shape.clearing) shape.update(0, this.game.soundManager);
            });
            // Do not return, allow collisions to happen
        } else {
            // Spawning
            this.spawnTimer += deltaTime;
            // Only spawn if PLAYING (not in transition)
            if (this.game.gameState === 'PLAYING' && this.spawnTimer > this.spawnInterval) {
                this.spawnShape();
                this.spawnTimer = 0;
            }

            // Updating shapes
            // Base fall speed is now in pixels per second.
            // Original was 0.2 pixels/frame => ~12 pixels/second.
            // Let's make it a bit faster to start: 20 pixels/second.
            // Difficulty scaling: +5 pixels/second per level.
            const baseSpeed = 20 + (this.game.level - 1) * 5;

            // Apply speed multiplier (fast forward / slow motion)
            const currentSpeedPxPerSec = baseSpeed * this.game.speedMultiplier;

            // Calculate distance for this frame
            const moveDistance = currentSpeedPxPerSec * (deltaTime / 1000);

            this.shapes.forEach(shape => shape.update(moveDistance));
        }

        // Collision Detection
        this.checkCollisions();

        // Check Game Over
        for (const shape of this.shapes) {
            if (shape.getBottomY() >= this.game.player.y) {
                this.game.setGameOver();
                return;
            }
        }

        // Remove shapes that are off screen
        this.shapes = this.shapes.filter(shape => shape.y < this.game.height);

        // Remove empty shapes (cleared)
        this.shapes = this.shapes.filter(shape => shape.active);
    }

    checkCollisions() {
        const bullets = this.game.bullets;

        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.active) continue;

            for (const shape of this.shapes) {
                if (shape.clearing) continue; // Ignore clearing shapes

                // Check if bullet is within horizontal bounds of the shape
                const shapePixelX = shape.x * BLOCK_SIZE;
                const shapeWidth = shape.cols * BLOCK_SIZE;

                if (bullet.x >= shapePixelX && bullet.x < shapePixelX + shapeWidth) {
                    // Calculate relative column
                    const col = Math.floor((bullet.x - shapePixelX) / BLOCK_SIZE);

                    // Find the lowest block in this column
                    let lowestRow = -1;
                    for (let r = shape.rows - 1; r >= 0; r--) {
                        if (shape.layout[r][col] === 1) {
                            lowestRow = r;
                            break;
                        }
                    }

                    if (lowestRow !== -1) {
                        const blockBottomY = shape.y + (lowestRow + 1) * BLOCK_SIZE;

                        // Check if bullet hit the bottom of this block
                        // We give a bit of leeway (speed) to ensure we don't skip through
                        if (bullet.y <= blockBottomY && bullet.y > blockBottomY - BLOCK_SIZE) {
                            // Hit! Add block below
                            this.addBlockToShape(shape, lowestRow + 1, col);
                            bullet.active = false;
                            this.game.soundManager.play('hit');
                            break; // Bullet handled
                        }
                    }
                }
            }
        }
    }

    addBlockToShape(shape, row, col) {
        // Extend layout if necessary
        if (row >= shape.rows) {
            // Add new row
            const newRow = new Array(shape.cols).fill(0);
            shape.layout.push(newRow);

            // Also extend blockScales for animation
            const newScales = new Array(shape.cols).fill(1.0);
            shape.blockScales.push(newScales);

            shape.rows++;
        }

        shape.layout[row][col] = 1;

        // Check for rectangle
        if (this.isRectangle(shape)) {
            // Score and clear
            this.game.score += shape.rows * shape.cols * 100;
            document.getElementById('score').innerText = `Score: ${this.game.score}`;

            // Emit particles from the center of the shape
            const centerX = (shape.x + shape.cols / 2) * BLOCK_SIZE;
            const centerY = shape.y + (shape.rows / 2) * BLOCK_SIZE;
            this.game.particleSystem.emit(centerX, centerY, shape.color, 20);
            this.game.soundManager.play('clear');

            // Start animation instead of removing immediately
            shape.startClearAnimation();
        }
    }

    isRectangle(shape) {
        for (let r = 0; r < shape.rows; r++) {
            for (let c = 0; c < shape.cols; c++) {
                if (shape.layout[r][c] === 0) return false;
            }
        }
        return true;
    }

    draw(ctx) {
        this.shapes.forEach(shape => shape.draw(ctx, this.game.blockTexture));
    }

    spawnShape() {
        // Complex shapes that are "top-heavy" (no holes accessible only from above)
        // and not complete rectangles.
        const layouts = [
            // Large L (Right)
            [
                [1, 1, 1],
                [1, 0, 0],
                [1, 0, 0]
            ],
            // Large L (Left)
            [
                [1, 1, 1],
                [0, 0, 1],
                [0, 0, 1]
            ],
            // The "Podium"
            [
                [1, 1, 1],
                [0, 1, 0],
                [0, 1, 0]
            ],
            // Steps (Right)
            [
                [1, 1, 1, 1],
                [1, 1, 1, 0],
                [1, 1, 0, 0],
                [1, 0, 0, 0]
            ],
            // Steps (Left)
            [
                [1, 1, 1, 1],
                [0, 1, 1, 1],
                [0, 0, 1, 1],
                [0, 0, 0, 1]
            ],
            // U-shape (Inverted/Fillable)
            [
                [1, 1, 1, 1],
                [1, 0, 0, 1],
                [1, 0, 0, 1]
            ],
            // Comb
            [
                [1, 1, 1, 1, 1],
                [1, 0, 1, 0, 1],
                [1, 0, 1, 0, 1]
            ],
            // Big T
            [
                [1, 1, 1, 1, 1],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0]
            ]
        ];

        const colors = ['#ff00ff', '#ffff00', '#00ffff', '#00ff00', '#ff0000', '#ffffff'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        // Try to spawn a shape that doesn't collide
        // We'll try a few times to find a valid spot
        for (let attempt = 0; attempt < 10; attempt++) {
            // Deep copy layout
            const layout = JSON.parse(JSON.stringify(layouts[Math.floor(Math.random() * layouts.length)]));
            const cols = layout[0].length;
            const maxCol = (this.game.width / BLOCK_SIZE) - cols;
            // Ensure padding of 1 block on left (min x = 1) and right (max x = maxCol - 1)
            // Range: [1, maxCol - 1]
            // Count: (maxCol - 1) - 1 + 1 = maxCol - 1
            const x = Math.floor(Math.random() * (maxCol - 1)) + 1;
            const y = -100; // Spawn higher up

            // Check collision with existing shapes
            let collides = false;
            for (const shape of this.shapes) {
                // Simple bounding box check first for optimization
                // We only care if they are close vertically
                if (Math.abs(shape.y - y) < (shape.rows + layout.length) * BLOCK_SIZE) {
                    // Check horizontal overlap
                    const shapeLeft = shape.x;
                    const shapeRight = shape.x + shape.cols;
                    const newLeft = x;
                    const newRight = x + cols;

                    if (newLeft < shapeRight && newRight > shapeLeft) {
                        // Potential collision, strict check could be done here but bounding box is safer for "no overlap" rule
                        collides = true;
                        break;
                    }
                }
            }

            if (!collides) {
                this.shapes.push(new Shape(x, y, layout, randomColor));
                return; // Success
            }
        }
        // If we fail 10 times, we just skip spawning this tick to avoid overlapping
    }
}
