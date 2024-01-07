class NPC {
    constructor(x, y) {
        this.isAlive = true;
        this.x = x;
        this.y = y;
        this.health = 100;
        this.color = '#' + Math.floor(Math.random()*16777215).toString(16); // Random color
        this.size = (Math.random() * 20) + 10;
        this.velocity = { 
            x: (Math.random() - 0.5) * 2, 
            y: (Math.random() - 0.5) * 2 
        };
        this.maxSpeed = 3;
        this.perceptionRadius = 40;
        this.stats = {
            health: 100,
            energy: 100
        };
        this.emotions = {
            happiness: 50,
            fear: 0,
        };
        this.perceptionAngle = Math.PI / 2;
        this.perceptionDistance = 250;
    }
    applyFlockingBehaviors(npcs) {
        const separationWeight = 1.5;
        const alignmentWeight = 1.0;
        const cohesionWeight = 1.0;
        const maxForce = 0.05; // Lower maxForce for smoother movement

        let separation = this.calculateSeparation(npcs);
        let alignment = this.calculateAlignment(npcs);
        let cohesion = this.calculateCohesion(npcs);

        // Apply limits to forces
        separation = this.limit(separation, maxForce);
        alignment = this.limit(alignment, maxForce);
        cohesion = this.limit(cohesion, maxForce);

        // Combine flocking behaviors
        this.velocity.x += separation.x * separationWeight + alignment.x * alignmentWeight + cohesion.x * cohesionWeight;
        this.velocity.y += separation.y * separationWeight + alignment.y * alignmentWeight + cohesion.y * cohesionWeight;
        
        // Adjust the velocity if it's too fast
        this.velocity = this.limit(this.velocity, this.maxSpeed);
    }
    calculateAlignment(npcs) {
        let average = { x: 0, y: 0 };
        let total = 0;
        for (let other of npcs) {
            if (other !== this && other.isAlive && this.distance(this, other) < this.perceptionRadius) {
                average.x += other.velocity.x;
                average.y += other.velocity.y;
                total++;
            }
        }
        if (total > 0) {
            average.x /= total;
            average.y /= total;
            average = this.setMagnitude(average, this.maxSpeed);
            let steer = { x: average.x - this.velocity.x, y: average.y - this.velocity.y };
            return steer;
        } else {
            return { x: 0, y: 0 };
        }
    }
    calculateCohesion(npcs) {
        let average = { x: 0, y: 0 };
        let total = 0;
        for (let other of npcs) {
            if (other !== this && other.isAlive && this.distance(this, other) < this.perceptionRadius) {
                average.x += other.x;
                average.y += other.y;
                total++;
            }
        }
        if (total > 0) {
            average.x /= total;
            average.y /= total;
            return this.seek(average); // Steer towards the average position
        } else {
            return { x: 0, y: 0 };
        }
    }
    calculateSeparation(npcs) {
        let steering = { x: 0, y: 0 };
        let total = 0;
        for (let other of npcs) {
            let distance = this.distance(this, other);
            if (other !== this && other.isAlive && this.distance(this, other) < this.perceptionRadius) {
                let diff = { x: this.x - other.x, y: this.y - other.y };
                diff.x /= distance; // Weight by distance
                diff.y /= distance;
                steering.x += diff.x;
                steering.y += diff.y;
                total++;
            }
        }
        if (total > 0) {
            steering.x /= total;
            steering.y /= total;
            // Set magnitude to maxSpeed
            steering = this.setMagnitude(steering, this.maxSpeed);
            // Subtract current velocity
            steering.x -= this.velocity.x;
            steering.y -= this.velocity.y;
        }
        return steering;
    }
    collectResource(resources) {
        // Find the nearest resource of a specific type
        // Example: Find the nearest 'food' resource
        let nearestResource = null;
        let minDistance = Infinity;
        for (let resource of resources) {
            if (resource.type === 'food') { // Adjust type as needed
                let distance = this.distance(this, resource);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestResource = resource;
                }
            }
        }

        if (nearestResource && minDistance < 20) { // 20 is the collection range
            // Collect the resource
            nearestResource.quantity--;
            if (nearestResource.quantity <= 0) {
                // Remove the resource from the array
                const index = resources.indexOf(nearestResource);
                resources.splice(index, 1);
            }
        }
    }
    die() {
        this.isAlive = false;
        this.color = '#808080'; // Gray color for dead NPCs
        this.velocity = { x: 0, y: 0 }; // Stop movement
    }
    distance(boid1, boid2) {
        let dx = boid1.x - boid2.x;
        let dy = boid1.y - boid2.y;
        return Math.sqrt(dx * dx + dy * dy);
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

        this.drawPerceptionCone(context);

        // Draw outline if selected
        if (this === sim.selectedEntity) {
            context.strokeStyle = '#ff0'; // Highlight color
            context.strokeRect(this.x, this.y, this.size, this.size);
        }
    }
    drawPerceptionCone(context) {
        context.beginPath();
        context.moveTo(this.x + this.size / 2, this.y + this.size / 2); // Center of NPC

        // Calculate left and right boundaries of the cone
        const directionAngle = Math.atan2(this.velocity.y, this.velocity.x);
        const leftAngle = directionAngle - this.perceptionAngle / 2;
        const rightAngle = directionAngle + this.perceptionAngle / 2;

        context.arc(
            this.x + this.size / 2, 
            this.y + this.size / 2, 
            this.perceptionDistance, 
            leftAngle, 
            rightAngle
        );

        context.closePath();
        context.fillStyle = "rgba(255, 255, 0, 0.2)"; // Semi-transparent yellow
        context.fill();
    }
    flee(target) {
        if (!target) return;

        // Calculate the vector pointing away from the target
        let desired = {
            x: this.x - target.x,
            y: this.y - target.y
        };
        desired = this.setMagnitude(desired, this.maxSpeed);

        // Update velocity in the opposite direction of the target
        this.velocity.x += desired.x;
        this.velocity.y += desired.y;
    }
    handleEnergyAndHealth() {
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.stats.energy -= 0.00001; // Adjust consumption rate as needed
        }

        if (this.stats.health <= 0) {
            this.die();
        }
    }
    interactWithOtherNPCs(npcs) {
        for (let other of npcs) {
            if (other !== this && other.isAlive && isColliding(this, other)) {
                // Interaction logic here
            }
        }
    }
    limit(vector, max) {
        const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (magnitude > max) {
            return { x: vector.x / magnitude * max, y: vector.y / magnitude * max };
        }
        return vector;
    }
    rest() {
        // Set velocity to zero to make NPC stationary
        this.velocity = { x: 0, y: 0 };

        // Recover energy
        this.stats.energy = Math.min(this.stats.energy + 1, 100); // Assuming max energy is 100

        // Optionally reduce perception radius
        // this.perceptionRadius = reducedRadius; // Set a reduced perception radius

        // Check if the NPC has rested enough
        if (this.stats.energy >= 100) { // Or another threshold
            this.isResting = false;
            // Restore original perception radius if reduced
            // this.perceptionRadius = originalRadius;
        }
    }
    seek(target) {
        let desired = { x: target.x - this.x, y: target.y - this.y };
        desired = this.setMagnitude(desired, this.maxSpeed);
        return { x: desired.x - this.velocity.x, y: desired.y - this.velocity.y };
    }
    setMagnitude(vector, magnitude) {
        let len = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        return { x: vector.x / len * magnitude, y: vector.y / len * magnitude };
    }
    update(npcs, resources, player) {
        if (!this.isAlive || isNaN(this.x) || isNaN(this.y)) return;

        // Example state checks - these would need to be set based on your game logic
        if (this.isFleeing) {
            // Flee from a perceived threat (player, another NPC, etc.)
            const threat = sim.player;
            this.flee(threat); // 'threat' should be defined in your game logic
        } else if (this.isResting) {
            // Rest to recover energy
            this.rest();
        } else if (this.needsResource) {
            // Seek out and collect resources
            this.collectResource(resources);
        } else {
            // Default behavior: wandering around
            this.wander();
        }

        // Combine flocking behaviors (separation, alignment, cohesion)
        this.applyFlockingBehaviors(npcs);

        // Update position based on velocity
        this.updatePosition();

        // Handle energy consumption and check for death
        this.handleEnergyAndHealth();
    }
    updatePosition() {
        // Update the NPC's position
        let newX = this.x + this.velocity.x;
        let newY = this.y + this.velocity.y;

        // Check if new position is valid
        if (!isNaN(newX) && !isNaN(newY)) {
            this.x = newX;
            this.y = newY;
        } else {
            console.error("Invalid position calculated", this);
        }
    }
    wander() {
        const wanderRadius = 50;
        const change = Math.random() * 0.5 - 0.25; // Random change in direction
        if (!this.target) {
            this.target = {
                x: this.x + Math.random() * wanderRadius - wanderRadius / 2,
                y: this.y + Math.random() * wanderRadius - wanderRadius / 2
            };
        }
        let desired = this.seek(this.target);
    
        // Update velocity towards the target
        this.velocity.x += desired.x * change;
        this.velocity.y += desired.y * change;
    
        // If the NPC reaches the target, choose a new wandering point
        if (this.distance(this, this.target) < 10) {
            this.target = null;
        }
    }
}