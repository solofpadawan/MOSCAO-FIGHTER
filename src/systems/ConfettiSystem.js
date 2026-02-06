export class ConfettiParticle {
    constructor(x, y, colors) {
        this.x = x;
        this.y = y;
        this.color = colors[Math.floor(Math.random() * colors.length)];

        // Random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 5; // Initial upward boost

        this.gravity = 0.1;
        this.drag = 0.96;

        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;

        this.size = Math.random() * 5 + 5;
        this.life = 1.0;
        this.decay = Math.random() * 0.005 + 0.002;
    }

    update() {
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.vy += this.gravity;

        this.x += this.vx;
        this.y += this.vy;

        this.rotation += this.rotationSpeed;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

export class ConfettiSystem {
    constructor() {
        this.particles = [];
        this.colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
        this.active = false;
        this.spawnTimer = 0;
        this.duration = 0;
    }

    startCelebration(duration = 3000) {
        this.active = true;
        this.duration = duration;
        this.spawnTimer = 0;

        // Initial burst
        this.spawn(100);
    }

    spawn(count) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        for (let i = 0; i < count; i++) {
            // Spawn from center-ish or random top positions
            const x = Math.random() * width;
            const y = Math.random() * (height * 0.3); // Top 30% of screen
            this.particles.push(new ConfettiParticle(x, y, this.colors));
        }
    }

    update(deltaTime) {
        if (this.active) {
            this.duration -= deltaTime;
            if (this.duration <= 0) {
                this.active = false;
            } else {
                // Continuous spawn while active
                if (Math.random() < 0.1) {
                    this.spawn(5);
                }
            }
        }

        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}
