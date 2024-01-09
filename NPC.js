class NPC {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        this.size = (Math.random() * 20) + 10;
        this.velocity = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };
        this.perception = new Perception(this);
        this.locomotion = new Locomotion(this);
        this.metabolism = new Metabolism();
        this.emotions = new Emotions();
        this.memory = new Memory();
    }

    draw(context) {
        this.perception.drawPerceptionCone(context);

        // Draw NPC
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);

        // Draw outline if selected
        if (this === sim.selectedEntity) {
            context.strokeStyle = '#fff'; // Highlight color
            context.strokeRect(this.x, this.y, this.size, this.size);
            this.drawHealthBar(context);
            this.drawEnergyBar(context);
        }
    }

    drawHealthBar(context) {
        const barWidth = this.size;
        const barHeight = 5;
        const healthPercentage = this.metabolism.health / 100;
        // Draw background of the health bar
        context.fillStyle = '#555';
        context.fillRect(this.x, this.y - 2 * barHeight - 12, barWidth, barHeight);
        // Draw the health bar
        context.fillStyle = '#f00';
        context.fillRect(this.x, this.y - 2 * barHeight - 12, barWidth * healthPercentage, barHeight);

    }

    drawEnergyBar(context) {
        const barWidth = this.size;
        const barHeight = 5;
        const energyPercentage = this.metabolism.energy / 100;
        // Draw background of the energy bar
        context.fillStyle = '#555';
        context.fillRect(this.x, this.y - barHeight - 10, barWidth, barHeight);
        // Draw the energy bar
        context.fillStyle = '#ff0';
        context.fillRect(this.x, this.y - barHeight - 10, barWidth * energyPercentage, barHeight);

    }

    update(npcs, resources, player) {
        if (!this.metabolism.isAlive || isNaN(this.x) || isNaN(this.y)) return;
        this.metabolism.adjustEnergyUsage(this.velocity, this.locomotion.walkSpeed, this.locomotion.runSpeed, this.locomotion.sprintSpeed);
        if (this.metabolism.energy > 0) {
            if(this.perception.isTargetPerceivable(player)) {
                this.locomotion.seek(player);
            } else {
                this.locomotion.wander();
            }
        } else {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
        this.memory.observeAndRememberResources(this, resources);
        if (this.isResting) {
            this.locomotion.rest(this);
        }
        this.updatePosition();
        this.metabolism.handleHealth();
    }

    updatePosition() {
        let newX = this.x + this.velocity.x;
        let newY = this.y + this.velocity.y;
        if (!isNaN(newX) && !isNaN(newY)) {
            this.x = newX;
            this.y = newY;
        } else {
            console.error("Invalid position calculated", this);
        }
    }
}