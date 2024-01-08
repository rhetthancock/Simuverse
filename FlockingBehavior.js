class FlockingBehavior {
    constructor(npc, separationWeight = 1.5, alignmentWeight = 1.0, cohesionWeight = 1.0, maxForce = 0.05) {
        this.npc = npc;
        this.separationWeight = separationWeight;
        this.alignmentWeight = alignmentWeight;
        this.cohesionWeight = cohesionWeight;
        this.maxForce = maxForce;
    }

    applyFlockingBehaviors(npcs) {
        let separation = this.calculateSeparation(npcs);
        let alignment = this.calculateAlignment(npcs);
        let cohesion = this.calculateCohesion(npcs);
        // Apply limits to forces
        separation = VectorUtils.limit(separation, this.maxForce);
        alignment = VectorUtils.limit(alignment, this.maxForce);
        cohesion = VectorUtils.limit(cohesion, this.maxForce);
        // Combine flocking behaviors
        this.npc.velocity.x += separation.x * this.separationWeight + alignment.x * this.alignmentWeight + cohesion.x * this.cohesionWeight;
        this.npc.velocity.y += separation.y * this.separationWeight + alignment.y * this.alignmentWeight + cohesion.y * this.cohesionWeight;
        // Adjust the velocity if it's too fast
        this.npc.velocity = VectorUtils.limit(this.npc.velocity, this.npc.locomotion.maxSpeed);
    }

    calculateAlignment(npcs) {
        let average = { x: 0, y: 0 };
        let total = 0;
        for (let other of npcs) {
            if (other !== this.npc && other.isAlive && VectorUtils.getDistance(this.npc, other) < this.npc.perceptionRadius) {
                average.x += other.velocity.x;
                average.y += other.velocity.y;
                total++;
            }
        }
        if (total > 0) {
            average.x /= total;
            average.y /= total;
            average = VectorUtils.setMagnitude(average, this.npc.locomotion.maxSpeed);
            let steer = { x: average.x - this.npc.velocity.x, y: average.y - this.npc.velocity.y };
            return steer;
        } else {
            return { x: 0, y: 0 };
        }
    }

    calculateCohesion(npcs) {
        let average = { x: 0, y: 0 };
        let total = 0;
        for (let other of npcs) {
            if (other !== this.npc && other.isAlive && VectorUtils.getDistance(this.npc, other) < this.npc.perceptionRadius) {
                average.x += other.x;
                average.y += other.y;
                total++;
            }
        }
        if (total > 0) {
            average.x /= total;
            average.y /= total;
            return this.seek(average);
        } else {
            return { x: 0, y: 0 };
        }
    }
    
    calculateSeparation(npcs) {
        let steering = { x: 0, y: 0 };
        let total = 0;
        for (let other of npcs) {
            let distance = VectorUtils.getDistance(this.npc, other);
            if (other !== this.npc && other.isAlive && distance < this.npc.perceptionRadius) {
                let diff = { x: this.npc.x - other.x, y: this.npc.y - other.y };
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
            steering = VectorUtils.setMagnitude(steering, this.npc.locomotion.maxSpeed);
            // Subtract current velocity
            steering.x -= this.npc.velocity.x;
            steering.y -= this.npc.velocity.y;
        }
        return steering;
    }
}
