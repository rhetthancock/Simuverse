class Locomotion {
    constructor(npc) {
        this.npc = npc;
        this.walkSpeed = 1;
        this.runSpeed = 2.5;
        this.sprintSpeed = 4;
        this.maxSpeed = 4.5;
        this.patrolPoints = [];
        this.currentPatrolPoint = 0;
        this.wanderCounter = 0;
        this.wanderChangeInterval = 200; // frames
        this.wanderRadius = 500;
        this.wanderAngleVariance = Math.PI / 4; // 45 degrees
        this.fleeBehavior = new FleeBehavior(npc);
        this.flockingBehavior = new FlockingBehavior(npc);
        this.interactionBehavior = new InteractionBehavior(npc);
    }

    faceTarget(target) {
        let angleToTarget = Math.atan2(target.y - this.npc.y, target.x - this.npc.x);
        let speed = Math.sqrt(this.npc.velocity.x ** 2 + this.npc.velocity.y ** 2);
        this.npc.velocity.x = Math.cos(angleToTarget) * speed;
        this.npc.velocity.y = Math.sin(angleToTarget) * speed;
    }

    lookAround() {
        let currentAngle = Math.atan2(this.npc.velocity.y, this.npc.velocity.x);
        let newAngle = currentAngle + 0.02; // Adjust the value for rotation speed
        this.npc.velocity.x = Math.cos(newAngle) * this.maxSpeed;
        this.npc.velocity.y = Math.sin(newAngle) * this.maxSpeed;
    }

    patrol() {
        let target = this.patrolPoints[this.currentPatrolPoint];
        if (VectorUtils.getDistance(this.npc, target) < 10) {
            this.currentPatrolPoint = (this.currentPatrolPoint + 1) % this.patrolPoints.length;
        }
        this.seek(target);
    }

    rest() {
        this.stopMovement();
        this.npc.metabolism.energy = Math.min(this.npc.metabolism.energy + 1, 100);
        if (this.npc.metabolism.energy >= 100) {
            this.npc.isResting = false;
        }
    }

    seek(target, stopDistance = 200) {
        this.faceTarget(target);
        let desired = { x: target.x - this.npc.x, y: target.y - this.npc.y };
        let distance = Math.sqrt(desired.x ** 2 + desired.y ** 2);
        if (distance < stopDistance) {
            this.stopMovement();
            return;
        }
        desired = VectorUtils.setMagnitude(desired, this.maxSpeed);
        this.npc.velocity.x += (desired.x - this.npc.velocity.x) * 0.1;
        this.npc.velocity.y += (desired.y - this.npc.velocity.y) * 0.1;
    }

    stopMovement() {
        let velocity = this.npc.velocity;
        if (velocity.x !== 0 || velocity.y !== 0) {
            this.npc.velocity.x = VectorUtils.lerp(velocity.x, 0, 0.15);
            this.npc.velocity.y = VectorUtils.lerp(velocity.y, 0, 0.15);
        }
    }

    wander() {
        // Increment the wander counter with a small random component for irregularity
        this.wanderCounter += 1 + Math.random() * 0.2;

        if (!this.wanderTarget || this.wanderCounter >= this.wanderChangeInterval) {
            // Reset the wander counter and assign a new random change interval
            this.wanderCounter = 0;
            this.wanderChangeInterval = 150 + Math.floor(Math.random() * 100);

            // Calculate a new wander target as before
            const directionAngle = Math.atan2(this.npc.velocity.y, this.npc.velocity.x);
            const weightedAngle = directionAngle + (Math.random() * this.wanderAngleVariance - this.wanderAngleVariance / 2);
            this.wanderTarget = {
                x: this.npc.x + Math.cos(weightedAngle) * this.wanderRadius,
                y: this.npc.y + Math.sin(weightedAngle) * this.wanderRadius
            };
        }

        // Gradually adjust the direction towards the wander target using the lerpVector method
        // Ensure the lerpVector method is correctly implemented in the VectorUtils class
        let desiredDirection = { x: this.wanderTarget.x - this.npc.x, y: this.wanderTarget.y - this.npc.y };
        desiredDirection = VectorUtils.normalize(desiredDirection);
        let currentDirection = VectorUtils.normalize(this.npc.velocity);
        let turnRate = 0.05; // Adjust the turn rate for smoothness of the turn
        let newDirection = VectorUtils.lerpVector(currentDirection, desiredDirection, turnRate);

        // Update the NPC's velocity with the new direction
        let speed = Math.sqrt(this.npc.velocity.x ** 2 + this.npc.velocity.y ** 2);
        // Set the new velocity if the new direction is valid
        if (newDirection) {
            this.npc.velocity.x = newDirection.x * speed;
            this.npc.velocity.y = newDirection.y * speed;
        }
    }
}