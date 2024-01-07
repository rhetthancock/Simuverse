class FlockingBehavior {
    constructor(separationWeight = 1.5, alignmentWeight = 1.0, cohesionWeight = 1.0, maxForce = 0.05) {
        this.separationWeight = separationWeight;
        this.alignmentWeight = alignmentWeight;
        this.cohesionWeight = cohesionWeight;
        this.maxForce = maxForce;
    }
    applyFlockingBehaviors(npc, npcs) {
        let separation = this.calculateSeparation(npc, npcs);
        let alignment = this.calculateAlignment(npc, npcs);
        let cohesion = this.calculateCohesion(npc, npcs);
        // Apply limits to forces
        separation = this.limit(separation, this.maxForce);
        alignment = this.limit(alignment, this.maxForce);
        cohesion = this.limit(cohesion, this.maxForce);
        // Combine flocking behaviors
        npc.velocity.x += separation.x * this.separationWeight + alignment.x * this.alignmentWeight + cohesion.x * this.cohesionWeight;
        npc.velocity.y += separation.y * this.separationWeight + alignment.y * this.alignmentWeight + cohesion.y * this.cohesionWeight;
        // Adjust the velocity if it's too fast
        npc.velocity = VectorUtils.limit(npc.velocity, npc.stats.velocityMax);
    }
    calculateAlignment(npc, npcs) {
        let average = { x: 0, y: 0 };
        let total = 0;
        for (let other of npcs) {
            if (other !== npc && other.isAlive && VectorUtils.getDistance(npc, other) < npc.perceptionRadius) {
                average.x += other.velocity.x;
                average.y += other.velocity.y;
                total++;
            }
        }
        if (total > 0) {
            average.x /= total;
            average.y /= total;
            average = VectorUtils.setMagnitude(average, npc.stats.velocityMax);
            let steer = { x: average.x - npc.velocity.x, y: average.y - npc.velocity.y };
            return steer;
        } else {
            return { x: 0, y: 0 };
        }
    }
    calculateCohesion(npc, npcs) {
        let average = { x: 0, y: 0 };
        let total = 0;
        for (let other of npcs) {
            if (other !== npc && other.isAlive && VectorUtils.getDistance(npc, other) < npc.perceptionRadius) {
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
    calculateSeparation(npc, npcs) {
        let steering = { x: 0, y: 0 };
        let total = 0;
        for (let other of npcs) {
            let distance = VectorUtils.getDistance(npc, other);
            if (other !== npc && other.isAlive && distance < npc.perceptionRadius) {
                let diff = { x: npc.x - other.x, y: npc.y - other.y };
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
            steering = VectorUtils.setMagnitude(steering, npc.stats.velocityMax);
            // Subtract current velocity
            steering.x -= npc.velocity.x;
            steering.y -= npc.velocity.y;
        }
        return steering;
    }
    limit(vector, max) {
        return VectorUtils.limit(vector, max);
    }
}