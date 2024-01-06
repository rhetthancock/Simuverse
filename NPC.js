class NPC {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.health = 100;
        this.color = '#' + Math.floor(Math.random()*16777215).toString(16); // Random color
        this.size = (Math.random() * 20) + 10;
        this.speed = Math.random() * 3 + 0.5;
    }
    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);
    }
    interactWithOtherNPCs(npcs) {
        for (let other of npcs) {
            if (other !== this && isColliding(this, other)) {
                // Define interaction logic here
                // Example: exchange items, change behavior, etc.
            }
        }
    }
    seek(target) {
        let dx = target.x - this.x;
        let dy = target.y - this.y;
        let magnitude = Math.sqrt(dx * dx + dy * dy);
        if (magnitude > 0) {
            dx /= magnitude;
            dy /= magnitude;
            this.x += dx * this.speed;
            this.y += dy * this.speed;
        }
    }
    update() {
        this.seek(player);
        // this.x += (Math.random() * 2 - 1) * this.speed;
        // this.y += (Math.random() * 2 - 1) * this.speed;
    }
}