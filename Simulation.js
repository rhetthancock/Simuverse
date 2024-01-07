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
        this.stats = {
            totalNPCs: 0,
            totalResources: 0
        }
        this.grid = new Grid(100, 100);
        for (let i = 0; i < 10; i++) {
            this.spawnResource();
            this.spawnNPC();
        }
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };
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
                //npc.color = '#ff0000';
            }
        });
    }
    drawFixedUI() {
        const context = this.context;

        // Draw Debug Text
        context.font = "10px monospace";
        context.fillStyle = '#fff';
        context.fillText(`Frames: ${this.frames}`, 10, 15);
        context.fillText(`Height: ${this.canvas.height}`, 10, 30);
        context.fillText(`Width: ${this.canvas.width}`, 10, 45);
        this.frames++;

        // Render stats
        context.font = "10px monospace";
        context.fillStyle = "#0c0";
        context.fillText(`Total NPCs: ${this.stats.totalNPCs}`, 10, this.canvas.height - 30);
        context.fillText(`Total Resources: ${this.stats.totalResources}`, 10, this.canvas.height - 15);

        if (this.selectedEntity instanceof NPC) {
            // Display NPC stats and inventory
            context.fillText(`Health: ${this.selectedEntity.stats.health}`, 10, 60);
            context.fillText(`Energy: ${this.selectedEntity.stats.energy}`, 10, 75);
            context.fillText(`Happiness: ${this.selectedEntity.emotions.happiness}`, 10, 90);
            context.fillText(`Fear: ${this.selectedEntity.emotions.fear}`, 10, 105);
        }
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
    loadState(stateString) {
        const state = JSON.parse(stateString);
        this.npcs = state.npcs;
        this.resources = state.resources;
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

        context.save();
        context.translate(this.offset.x, this.offset.y);
        context.scale(this.scale, this.scale);

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

        context.restore();

        this.drawFixedUI();
    }
    saveState() {
        const state = {
            npcs: this.npcs,
            resources: this.resources,
        };
        const stateString = JSON.stringify(state);
        alert(stateString);
    }
    selectEntityAt(screenX, screenY) {
        const x = (screenX - this.offset.x) / this.scale;
        const y = (screenY - this.offset.y) / this.scale;

        // Deselect previously selected entity
        this.selectedEntity = null;

        // Check if an NPC or resource was clicked
        for (let npc of this.npcs) {
            if (x >= npc.x && x <= npc.x + npc.size && y >= npc.y && y <= npc.y + npc.size) {
                this.selectedEntity = npc;
                break;
            }
        }

        if (!this.selectedEntity) {
            for (let resource of this.resources) {
                if (x >= resource.x && x <= resource.x + resource.size && y >= resource.y && y <= resource.y + resource.size) {
                    this.selectedEntity = resource;
                    break;
                }
            }
        }
    }
    setupEventListeners() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;
            this.selectEntityAt(clickX, clickY);
        });
        this.canvas.addEventListener('mousedown', (event) => {
            if (event.button === 2) { // Right mouse button
                this.isDragging = true;
                this.lastMouse.x = event.clientX;
                this.lastMouse.y = event.clientY;
            }
        });
        this.canvas.addEventListener('mousemove', (event) => {
            if (this.isDragging) {
                this.offset.x += (event.clientX - this.lastMouse.x) / this.scale;
                this.offset.y += (event.clientY - this.lastMouse.y) / this.scale;
                this.lastMouse.x = event.clientX;
                this.lastMouse.y = event.clientY;
            }
        });
        this.canvas.addEventListener('wheel', (event) => {
            const zoomIntensity = 0.001;
            const zoom = Math.exp(event.deltaY * -zoomIntensity);
            this.scale *= zoom;
            // Adjust offset to zoom into the mouse position
            this.offset.x -= (event.clientX - this.offset.x) * (zoom - 1);
            this.offset.y -= (event.clientY - this.offset.y) * (zoom - 1);
        });
        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        // Prevent context menu on right-click
        this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    }
    spawnNPC() {
        let npc = new NPC(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
        this.npcs.push(npc);
        this.stats.totalNPCs++;
    }
    spawnResource() {
        let resource = {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: 10,
            color: '#00ffff'
        };
        this.resources.push(resource);
        this.stats.totalResources++;
    }
    update() {
        this.movePlayer();
        this.applyZoneEffects();
        this.npcs.forEach(npc => {
            npc.update(this.npcs);
            npc.interactWithOtherNPCs(this.npcs);
        });
        this.checkInteractions();
    }
}