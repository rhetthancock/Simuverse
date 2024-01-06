class NPC {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.health = 100;
        this.color = '#' + Math.floor(Math.random()*16777215).toString(16); // Random color
        this.size = 20;
        this.speed = Math.random() * 2 + 1;
    }
    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);
    }
    update() {
        this.x += (Math.random() * 2 - 1) * this.speed;
        this.y += (Math.random() * 2 - 1) * this.speed;
    }
}