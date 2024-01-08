class NPC {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        this.size = (Math.random() * 20) + 10;
        this.velocity = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };

        this.perception = new Perception();
        this.metabolism = new Metabolism();
        this.emotions = new Emotions();
        this.memory = new Memory();
        this.locomotion = new Locomotion(this);

        this.fleeBehavior = new FleeBehavior();
        this.flockingBehavior = new FlockingBehavior();
        this.interactionBehavior = new InteractionBehavior();
    }

    determineBehavior(npcs, resources, player) {
        this.locomotion.wander();
        //this.fleeBehavior.flee(this, player);

        // if (this.metabolism.energy > 50) {
        //     this.flockingBehavior.applyFlockingBehaviors(this, npcs);
        //     this.locomotion.wander(this);
        // } else {
        //     this.locomotion.rest(this);
        // }
        // if (this.locomotion.patrolPoints.length > 0) {
        //     this.locomotion.patrol(this);
        // }
    }

    draw(context) {
        // Draw NPC
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);

        // Calculate the center of the NPC
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;

        // Draw direction indicator from the center
        const directionAngle = Math.atan2(this.velocity.y, this.velocity.x);
        const arrowLength = 10; // Adjust as needed
        const endX = centerX + Math.cos(directionAngle) * arrowLength;
        const endY = centerY + Math.sin(directionAngle) * arrowLength;

        context.strokeStyle = '#fff'; // Arrow color
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.lineTo(endX, endY);
        context.stroke();

        this.perception.drawPerceptionCone(this, context);

        // Draw outline if selected
        if (this === sim.selectedEntity) {
            context.strokeStyle = '#ff0'; // Highlight color
            context.strokeRect(this.x, this.y, this.size, this.size);
        }
    }

    update(npcs, resources, player) {
        if (!this.metabolism.isAlive || isNaN(this.x) || isNaN(this.y)) return;
        this.metabolism.adjustEnergyUsage(this.velocity, this.locomotion.walkSpeed, this.locomotion.runSpeed, this.locomotion.sprintSpeed);
        if (this.metabolism.energy > 0) {
            this.determineBehavior(npcs, resources, player);
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