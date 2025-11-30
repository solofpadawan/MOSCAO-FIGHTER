import { BLOCK_SIZE } from '../constants.js';

export class Shape {
    constructor(x, y, layout, color) {
        this.x = x; // Grid coordinate (column index)
        this.y = y; // Pixel coordinate
        this.layout = layout; // 2D array: 1 = block, 0 = empty
        this.rows = layout.length;
        this.cols = layout[0].length;
        this.color = color || '#f0f';
        this.active = true;

        // Animation properties
        this.clearing = false;
        this.animationQueue = []; // List of {r, c} to clear
        this.animationTimer = 0;
        this.blockScales = []; // 2D array matching layout to store scale (1.0 to 0.0)

        // Initialize block scales
        for (let r = 0; r < this.rows; r++) {
            this.blockScales[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.blockScales[r][c] = 1.0;
            }
        }
    }

    startClearAnimation() {
        this.clearing = true;
        this.animationQueue = this.getSpiralOrder();
    }

    getSpiralOrder() {
        const result = [];
        let top = 0, bottom = this.rows - 1;
        let left = 0, right = this.cols - 1;
        let dir = 0; // 0: right, 1: down, 2: left, 3: up

        while (top <= bottom && left <= right) {
            if (dir === 0) { // Right
                for (let i = left; i <= right; i++) {
                    if (this.layout[top][i] === 1) result.push({ r: top, c: i });
                }
                top++;
            } else if (dir === 1) { // Down
                for (let i = top; i <= bottom; i++) {
                    if (this.layout[i][right] === 1) result.push({ r: i, c: right });
                }
                right--;
            } else if (dir === 2) { // Left
                for (let i = right; i >= left; i--) {
                    if (this.layout[bottom][i] === 1) result.push({ r: bottom, c: i });
                }
                bottom--;
            } else if (dir === 3) { // Up
                for (let i = bottom; i >= top; i--) {
                    if (this.layout[i][left] === 1) result.push({ r: i, c: left });
                }
                left++;
            }
            dir = (dir + 1) % 4;
        }
        return result;
    }

    update(speed, soundManager) {
        if (this.clearing) {
            // Animation logic
            this.animationTimer++;
            if (this.animationTimer % 10 === 0 && this.animationQueue.length > 0) {
                const block = this.animationQueue.shift();
                // Mark this block to start shrinking (we can use a special value or just handle it in draw)
                // Actually, let's just set a flag or start decreasing scale in update
                this.blockScales[block.r][block.c] = 0.9; // Start shrinking

                if (soundManager) {
                    soundManager.play('metallic');
                }
            }

            // Update scales
            let allCleared = true;
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (this.blockScales[r][c] < 1.0 && this.blockScales[r][c] > 0) {
                        this.blockScales[r][c] -= 0.05; // Shrink speed
                        if (this.blockScales[r][c] < 0) this.blockScales[r][c] = 0;
                        allCleared = false;
                    } else if (this.blockScales[r][c] === 1.0 && this.layout[r][c] === 1) {
                        allCleared = false; // Still waiting to start shrinking
                    }
                }
            }

            if (allCleared && this.animationQueue.length === 0) {
                this.active = false; // Done
                this.clearing = false; // Stop animation state
            }
        } else {
            this.y += speed;
        }
    }

    draw(ctx, texture) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.layout[r][c] === 1) {
                    const scale = this.blockScales[r][c];
                    if (scale <= 0) continue;

                    const pixelX = (this.x + c) * BLOCK_SIZE;
                    const pixelY = this.y + (r * BLOCK_SIZE);
                    // Draw with scale
                    const size = BLOCK_SIZE * scale;
                    const offset = (BLOCK_SIZE - size) / 2;

                    ctx.fillRect(pixelX + offset, pixelY + offset, size, size);

                    // Draw texture overlay
                    if (texture && texture.complete) {
                        ctx.save();
                        ctx.globalCompositeOperation = 'multiply';
                        ctx.globalAlpha = 0.7;
                        ctx.drawImage(texture, pixelX + offset, pixelY + offset, size, size);
                        ctx.restore();
                    }

                    ctx.strokeRect(pixelX + offset, pixelY + offset, size, size);
                }
            }
        }
    }

    getBottomY() {
        return this.y + (this.rows * BLOCK_SIZE);
    }
}
