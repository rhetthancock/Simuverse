class NPC {
    constructor(x, y) {
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
    }
    calculateAlignment(npcs) {
        let average = { x: 0, y: 0 };
        let total = 0;
        for (let other of npcs) {
            if (other !== this && this.distance(this, other) < this.perceptionRadius) {
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
            if (other !== this && this.distance(this, other) < this.perceptionRadius) {
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
            if (other !== this && distance < this.perceptionRadius) {
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
    distance(boid1, boid2) {
        let dx = boid1.x - boid2.x;
        let dy = boid1.y - boid2.y;
        return Math.sqrt(dx * dx + dy * dy);
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
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}