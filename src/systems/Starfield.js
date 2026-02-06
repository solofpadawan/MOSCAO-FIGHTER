export class Starfield {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.stars = [];
        this.initStars();
    }

    initStars() {
        // Layer 1: Slow stars (but faster than blocks)
        // Blocks fall at 0.2 * multiplier.
        // Let's make slow stars speed ~ 1.0
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 1.5 + 0.5,
                speed: Math.random() * 0.5 + 0.8, // 0.8 to 1.3
                layer: 1,
                color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`
            });
        }

        // Layer 2: Fast stars
        // Speed ~ 3.0
        for (let i = 0; i < 30; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 1.0 + 2.5, // 2.5 to 3.5
                layer: 2,
                color: `rgba(200, 200, 255, ${Math.random() * 0.6 + 0.4})`
            });
        }
    }

    update(speedMultiplier) {
        // Stars move independently of game speed multiplier if we want a constant "travel" feel,
        // OR they can speed up with the game.
        // Usually in these games, the background speed is constant or slightly linked.
        // Let's link it slightly to the multiplier for effect, but keep a base speed.

        // Actually, user said "faster than pieces". Pieces speed varies.
        // Let's just make them fast enough.

        this.stars.forEach(star => {
            star.y += star.speed * (speedMultiplier > 1 ? 2 : 1); // Boost speed if fast forward

            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        });
    }

    draw(ctx) {
        this.stars.forEach(star => {
            ctx.fillStyle = star.color;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }
}
