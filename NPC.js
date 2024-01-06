class NPC {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.health = 100;
        this.color = '#' + Math.floor(Math.random()*16777215).toString(16); // Random color
    }
    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, 20, 20);
    }
}