class Agent {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        this.size = 20;
        this.handRadius = 5;
        this.handOffset = 3; // distance from the center of the agent to the center of the hand
        this.sway = 0; // for the swaying effect of the hands
        this.maxAcceleration = 0.1; // Adjust this value as needed for appropriate acceleration
        this.desiredDirection = { x: 0, y: 0 };
        this.velocity = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };
        this.perception = new Perception(this);
        this.locomotion = new Locomotion(this);
        this.metabolism = new Metabolism();
        this.emotions = new Emotions();
        this.memory = new Memory();
    }

    avoidCollisions(agents) {
        let avoidanceRadius = 30;
        let avoidanceVector = { x: 0, y: 0 };
    
        agents.forEach(otherAgent => {
            if (otherAgent !== this) {
                let relativeVelocity = {
                    x: this.velocity.x - otherAgent.velocity.x,
                    y: this.velocity.y - otherAgent.velocity.y
                };
                let predictedPosition = {
                    x: otherAgent.x + relativeVelocity.x,
                    y: otherAgent.y + relativeVelocity.y
                };
                let distance = VectorUtils.getDistance(this, predictedPosition);
                let dynamicRadius = avoidanceRadius + Math.hypot(this.velocity.x, this.velocity.y);
    
                if (distance < dynamicRadius) {
                    let awayVector = {
                        x: this.x - predictedPosition.x,
                        y: this.y - predictedPosition.y
                    };
                    awayVector = VectorUtils.normalize(awayVector);
                    let weight = 1 / distance;
                    avoidanceVector.x += awayVector.x * weight;
                    avoidanceVector.y += awayVector.y * weight;
                }
            }
        });
    
        return avoidanceVector;
    }

    draw(context) {
        if(this.metabolism.isAlive) {
            this.perception.drawPerceptionCone(context);
        }
        this.drawHands(context);

        // Draw agent
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
    
        // Calculate the center of the agent
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

    update(agents, resources, player) {
        if (!this.metabolism.isAlive || isNaN(this.x) || isNaN(this.y)) return;
    
        this.metabolism.adjustEnergyUsage(this.velocity, this.locomotion.walkSpeed, this.locomotion.runSpeed, this.locomotion.sprintSpeed);
        if (this.isResting) {
            this.locomotion.rest(this);
        }
    
        if (this.metabolism.energy > 0) {
            let seekVector = { x: 0, y: 0 };
            let avoidanceVector = this.locomotion.avoidCollisions(agents);
            let separationVector = this.locomotion.separate(agents); // New separation behavior
    
            if (this.perception.isTargetPerceivable(player)) {
                seekVector = this.locomotion.seek(player);
            } else {
                this.locomotion.wander();
            }
    
            // Adjust the weights for seek and avoidance
            let seekWeight = 0.5; // Adjust as needed
            let avoidanceWeight = 0.3; // Adjust as needed
            let separationWeight = 0.2; // Adjust as needed
    
            // Combine the steering forces
            this.velocity.x += seekVector.x * seekWeight + avoidanceVector.x * avoidanceWeight + separationVector.x * separationWeight;
            this.velocity.y += seekVector.y * seekWeight + avoidanceVector.y * avoidanceWeight + separationVector.y * separationWeight;
    
            this.velocity = VectorUtils.limit(this.velocity, this.locomotion.maxSpeed);
        }
    
        this.updatePosition();
        this.metabolism.handleHealth();
        this.memory.observeAndRememberResources(this, resources);
    
        if (this.metabolism.isAlive) {
            this.updateHands();
        }
    }
    
    updateHands() {
        // Calculate the speed of the agent for the sway factor
        const speed = Math.hypot(this.velocity.x, this.velocity.y);

        // Update sway only if the agent is moving
        if (speed > 0.1) { // Assuming speed is non-zero for moving agents
            this.sway += 0.05 * speed; // Sway speed is proportional to movement speed
        } else {
            this.sway = 0; // Reset sway when agent is stationary
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