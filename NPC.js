class NPC {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        this.size = 20; //(Math.random() * 20) + 10;
        this.handRadius = 5; // radius of the hand circles
        this.handOffset = 3; // distance from the center of the NPC to the center of the hand
        this.sway = 0; // for the swaying effect of the hands
        this.velocity = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };
        this.perception = new Perception(this);
        this.locomotion = new Locomotion(this);
        this.metabolism = new Metabolism();
        this.emotions = new Emotions();
        this.memory = new Memory();
    }

    draw(context) {
        if(this.metabolism.isAlive) {
            this.perception.drawPerceptionCone(context);
        }
        this.drawHands(context);

        // Draw NPC
        context.beginPath();
        context.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, 2 * Math.PI);
        context.fillStyle = this.color;
        context.fill();

        // Draw outline if selected
        if (this === sim.selectedEntity) {
            context.strokeStyle = '#fff';
            context.stroke();
            this.drawHealthBar(context);
            this.drawEnergyBar(context);
        }
    }

    drawHands(context) {
        // Get the direction of movement
        const directionAngle = Math.atan2(this.velocity.y, this.velocity.x);
    
        // Calculate the center of the NPC
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
    
        // Adjust the hand sway to be perpendicular to the direction of movement
        const swayX = Math.cos(directionAngle) * Math.sin(this.handSway) * 10;
        const swayY = Math.sin(directionAngle) * Math.sin(this.handSway) * 10;
    
        // Calculate the hand positions with swaying effect
        const leftHandX = centerX + Math.cos(directionAngle - Math.PI / 2) * (this.size / 2 + this.handOffset) + swayX;
        const leftHandY = centerY + Math.sin(directionAngle - Math.PI / 2) * (this.size / 2 + this.handOffset) + swayY;
        const rightHandX = centerX + Math.cos(directionAngle + Math.PI / 2) * (this.size / 2 + this.handOffset) - swayX;
        const rightHandY = centerY + Math.sin(directionAngle + Math.PI / 2) * (this.size / 2 + this.handOffset) - swayY;
    
        // Draw left hand
        context.beginPath();
        context.arc(leftHandX, leftHandY, this.handRadius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
    
        // Draw right hand
        context.beginPath();
        context.arc(rightHandX, rightHandY, this.handRadius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
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
            this.locomotion.stopMovement();
        }
        this.memory.observeAndRememberResources(this, resources);
        if (this.isResting) {
            this.locomotion.rest(this);
        }
        this.updatePosition();
        this.metabolism.handleHealth();

        if (this.metabolism.isAlive) {
            this.updateHands();
        }
    }

    updateHands() {
        // Calculate the speed of the NPC for the sway factor
        const speed = Math.hypot(this.velocity.x, this.velocity.y);

        // Update sway only if the NPC is moving
        if (speed > 0.1) { // Assuming speed is non-zero for moving NPCs
            this.sway += 0.05 * speed; // Sway speed is proportional to movement speed
        } else {
            this.sway = 0; // Reset sway when NPC is stationary
        }

        // Sway angle is determined by a sine wave for smooth back and forth motion
        this.handSway = Math.sin(this.sway) * (Math.PI / 16); // Sway angle
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