class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = '#00ff00';
        this.size = 20;
        this.speed = 2;
    }
    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);
    }
    move(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }
}