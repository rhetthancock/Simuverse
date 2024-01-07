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

        // Draw outline if selected
        if (this === sim.selectedEntity) {
            context.strokeStyle = '#ff0'; // Highlight color
            context.strokeRect(this.x, this.y, this.size, this.size);
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
    seek(target) {
        let desired = { x: target.x - this.x, y: target.y - this.y };
        desired = this.setMagnitude(desired, this.maxSpeed);
        return { x: desired.x - this.velocity.x, y: desired.y - this.velocity.y };
    }
    setMagnitude(vector, magnitude) {
        let len = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        return { x: vector.x / len * magnitude, y: vector.y / len * magnitude };
    }
    update(npcs) {
        if (!this.isAlive || isNaN(this.x) || isNaN(this.y)) return;

        const separationWeight = 1.5;
        const alignmentWeight = 1.0;
        const cohesionWeight = 1.0;
        const seekWeight = 1.0; // Adjust the weight for seeking behavior
        const maxForce = 0.05; // Lower maxForce for smoother movement
    
        let separation = this.calculateSeparation(npcs);
        let alignment = this.calculateAlignment(npcs);
        let cohesion = this.calculateCohesion(npcs);
        let seek = this.seek(sim.player); // Get the seek vector towards the player
    
        // Apply limits to forces
        separation = this.limit(separation, maxForce);
        alignment = this.limit(alignment, maxForce);
        cohesion = this.limit(cohesion, maxForce);
        seek = this.limit(seek, maxForce);
    
        // Combine flocking behaviors and seek behavior
        this.velocity.x += separation.x * separationWeight + alignment.x * alignmentWeight + cohesion.x * cohesionWeight + seek.x * seekWeight;
        this.velocity.y += separation.y * separationWeight + alignment.y * alignmentWeight + cohesion.y * cohesionWeight + seek.y * seekWeight;
    
        // Adjust the velocity if it's too fast
        this.velocity = this.limit(this.velocity, this.maxSpeed);
    
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

        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.stats.energy -= 0.00001; // Adjust consumption rate as needed
        }

        if (this.stats.health <= 0) {
            this.die();
        }
    }
}