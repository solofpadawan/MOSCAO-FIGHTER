export class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = 10;
        this.active = true;
        this.color = '#0ff';
    }

    update(deltaTime) {
        // Speed was 10px/frame => 600px/second
        const speedPxPerSec = 600;
        const moveDistance = speedPxPerSec * (deltaTime / 1000);

        this.y -= moveDistance;
        if (this.y + this.height < 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
