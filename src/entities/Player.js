import { Bullet } from './Bullet.js';

export class Player {
    constructor(game) {
        this.game = game;
        this.width = 60; // Increased from 40
        this.height = 60; // Increased from 40
        this.x = game.width / 2 - this.width / 2;
        this.y = game.height - this.height - 10;
        this.speed = 2;
        this.color = '#fff';

        this.movingLeft = false;
        this.movingRight = false;

        this.image = new Image();
        this.image.src = 'assets/images/bio_ship.png';
    }

    update(deltaTime) {
        // Normalize speed (pixels per second)
        // Base speed was ~60px/sec (1px/frame @ 60fps)
        let moveDistance = (this.speed * 60) * (deltaTime / 1000);

        // Black hole gravity effect
        if (this.game.blackHole) {
            const playerCenterX = this.x + this.width / 2;
            const playerCenterY = this.y + this.height / 2;

            const dx = this.game.blackHole.x - playerCenterX;
            const dy = this.game.blackHole.y - playerCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Influence radius: 150 pixels
            const influenceRadius = 150;

            if (distance < influenceRadius) {
                // Calculate slow-down factor (0.3 at center, 1.0 at edge)
                const slowFactor = 0.2 + (0.7 * (distance / influenceRadius));
                moveDistance *= slowFactor;
            }
        }

        if (this.movingLeft && this.x > 0) {
            this.x -= moveDistance;
        }
        if (this.movingRight && this.x + this.width < this.game.width) {
            this.x += moveDistance;
        }
    }

    draw(ctx) {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        }
    }

    shoot() {
        const bulletX = this.x + this.width / 2 - 2;
        const bulletY = this.y;
        this.game.bullets.push(new Bullet(bulletX, bulletY));
        this.game.soundManager.play('shoot');
    }
}
