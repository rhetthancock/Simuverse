class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = '#00ff00';
        this.size = 20;
        this.radius = this.size / 2;
        this.speed = 2;
    }
    draw(context) {
        const { x, y, radius, color } = this;
        context.beginPath();
        context.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
        context.fillStyle = color;
        context.fill();
    }
    move(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }
}