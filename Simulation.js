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
        this.dayLength = 60000; // Length of a day in milliseconds (e.g., 60 seconds)
        this.currentTime = 0;
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.npcs = [];
        this.stats = {
            totalNPCs: 0,
            totalResources: 0
        }
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };
        this.grid = new Grid(100, 100);
        for (let i = 0; i < 5; i++) {
            this.spawnResource();
            this.spawnNPC();
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
        // Convert currentTime to 24H format
        const totalMinutes = (this.currentTime / this.dayLength) * 24 * 60;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        context.fillText(`Time: ${timeString} (${this.currentTime}/${this.dayLength})`, 10, 60);

        // Render stats
        context.font = "10px monospace";
        context.fillStyle = "#0c0";
        context.fillText(`Total NPCs: ${this.stats.totalNPCs}`, 10, this.canvas.height - 30);
        context.fillText(`Total Resources: ${this.stats.totalResources}`, 10, this.canvas.height - 15);

        if (this.selectedEntity instanceof NPC) {
            // Display NPC stats and inventory
            context.fillText(`Health: ${this.selectedEntity.stats.health}`, 10, 75);
            context.fillText(`Energy: ${this.selectedEntity.stats.energy}`, 10, 90);
            context.fillText(`Happiness: ${this.selectedEntity.emotions.happiness}`, 10, 105);
            context.fillText(`Anxiety: ${this.selectedEntity.emotions.anxiety}`, 10, 120);
        }
    }
    simLoop() {
        requestAnimationFrame(() => this.simLoop());
        this.update();
        this.render();
    }
    getBackgroundColor() {
        const progress = this.currentTime / this.dayLength;
        const intensity = Math.cos(progress * Math.PI * 2) * 0.5 + 0.5;
    
        const dayColor = { r: 51, g: 126, b: 187 };
        const nightColor = { r: 1, g: 14, b: 24 };
    
        // Interpolate between day and night colors based on intensity
        const r = nightColor.r * intensity + dayColor.r * (1 - intensity);
        const g = nightColor.g * intensity + dayColor.g * (1 - intensity);
        const b = nightColor.b * intensity + dayColor.b * (1 - intensity);
    
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
    
    getVisibleArea() {
        const visibleWidth = this.canvas.width / this.scale;
        const visibleHeight = this.canvas.height / this.scale;
        const visibleX = -this.offset.x / this.scale;
        const visibleY = -this.offset.y / this.scale;
        return {
            x: visibleX,
            y: visibleY,
            width: visibleWidth,
            height: visibleHeight
        };
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

        // Draw background
        context.fillStyle = this.getBackgroundColor();
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
            resource.draw(context);
        }
    
        // Draw NPCs
        for (let npc of this.npcs) {
            npc.draw(context);
        }
    
        // Draw Player
        this.player.draw(context);

        context.restore();

        this.drawFixedUI();
        this.frames++;
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
        const area = this.getVisibleArea();
        const x = Math.random() * area.width + area.x;
        const y = Math.random() * area.height + area.y;
        let npc = new NPC(x, y);
        this.npcs.push(npc);
        this.stats.totalNPCs++;
    }
    spawnResource() {
        const area = this.getVisibleArea();
        const x = Math.random() * area.width + area.x;
        const y = Math.random() * area.height + area.y;
        const types = ['food', 'wood', 'stone'];
        const type = types[Math.floor(Math.random() * types.length)];
        let resource = new Resource(x, y, type);
        this.resources.push(resource);
    }
    update() {
        this.movePlayer();
        this.applyZoneEffects();
        this.npcs.forEach(npc => {
            npc.update(this.npcs , this.resources, this.player);
            npc.interactWithOtherNPCs(this.npcs);
        });
        this.checkInteractions();
        this.currentTime = (this.currentTime + 1) % this.dayLength;
    }
}