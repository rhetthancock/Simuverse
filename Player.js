class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = '#00ff00';
    }
    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, 20, 20);
    }
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}