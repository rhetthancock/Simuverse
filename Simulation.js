class Simulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = canvas.getContext('2d');
        this.frames = 0;
        this.keysPressed = {};
        this.resources = [];
        this.zones = [
            { x: 100, y: 100, width: 200, height: 200, effect: 'slow', color: '#222222' }
        ];
        this.player = new Player(50, 50);
        this.npcs = [];
        for (let i = 0; i < 10; i++) {
            this.spawnResource();
            this.npcs.push(new NPC(Math.random() * this.canvas.width, Math.random() * this.canvas.height));
        }
    }
    applyZoneEffects() {
        for (let zone of this.zones) {
            this.npcs.forEach(npc => {
                if (isInZone(npc, zone)) {
                    if (zone.effect === 'slow') {
                        npc.speed = 0.25;
                    }
                }
            });
        }
    }
    checkInteractions() {
        this.npcs.forEach(npc => {
            if (isColliding(this.player, npc)) {
                npc.color = '#ff0000';
            }
        });
    }
    simLoop() {
        requestAnimationFrame(() => this.simLoop());
        this.update();
        this.render();
    }
    handleKeyDown(event) {
        this.keysPressed[event.key] = true;
    }
    handleKeyUp(event) {
        delete this.keysPressed[event.key];
    }
    handleResize() {
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;
    }
    movePlayer() {
        const speed = this.player.speed;
        if (this.keysPressed['ArrowUp']) this.player.move(0, -speed);
        if (this.keysPressed['ArrowDown']) this.player.move(0, speed);
        if (this.keysPressed['ArrowLeft']) this.player.move(-speed, 0);
        if (this.keysPressed['ArrowRight']) this.player.move(speed, 0);
    }
    render() {
        const context = this.context;
        // Redraw (Clear) Background
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        // Draw Zones
        for(let zone of this.zones) {
            context.fillStyle = zone.color;
            context.fillRect(zone.x, zone.y, zone.width, zone.height);
        }
    
        // Draw Resources
        for (let resource of this.resources) {
            context.fillStyle = resource.color;
            context.fillRect(resource.x, resource.y, resource.size, resource.size);
        }
    
        // Draw NPCs
        for (let npc of this.npcs) {
            npc.draw(context);
        }
    
        // Draw Player
        this.player.draw(context);
    
        // Draw Debug Text
        context.font = "10px monospace";
        context.fillStyle = '#fff';
        context.fillText(`Frames: ${this.frames}`, 5, 10);
        context.fillText(`Height: ${this.canvas.height}`, 5, 25);
        context.fillText(`Width: ${this.canvas.width}`, 5, 40);
        this.frames++;
    }
    spawnNPC() {
        let npc = new NPC(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
        this.npcs.push(npc);
    }
    spawnResource() {
        let resource = {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: 10,
            color: '#00ffff'
        };
        this.resources.push(resource);
    }
    update() {
        this.movePlayer();
        this.applyZoneEffects();
        this.npcs.forEach(npc => {
            npc.update();
            npc.interactWithOtherNPCs(this.npcs);
        });
        this.checkInteractions();
    }
}