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
        this.wanderChangeInterval = 300; // frames
        this.wanderRadius = 300;
        this.wanderAngleVariance = Math.PI / 4; // 45 degrees
        this.fleeBehavior = new FleeBehavior(npc);
        this.flockingBehavior = new FlockingBehavior(npc);
        this.interactionBehavior = new InteractionBehavior(npc);
    }

    faceTarget(target) {
        let angleToTarget = Math.atan2(target.y - this.npc.y, target.x - this.npc.x);
        this.npc.velocity.x = Math.cos(angleToTarget) * this.maxSpeed;
        this.npc.velocity.y = Math.sin(angleToTarget) * this.maxSpeed;
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

    seek(target, stopDistance = 80) {
        let desired = { x: target.x - this.npc.x, y: target.y - this.npc.y };
        let distance = Math.sqrt(desired.x ** 2 + desired.y ** 2);
        if (distance < stopDistance) {
            this.faceTarget(target);
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
        this.wanderCounter = (this.wanderCounter || 0) + 1;
        if (!this.wanderTarget || this.wanderCounter >= this.wanderChangeInterval) {
            const directionAngle = Math.atan2(this.npc.velocity.y, this.npc.velocity.x);
            const weightedAngle = directionAngle + (Math.random() * this.wanderAngleVariance - this.wanderAngleVariance / 2);
            this.wanderTarget = {
                x: this.npc.x + Math.cos(weightedAngle) * this.wanderRadius,
                y: this.npc.y + Math.sin(weightedAngle) * this.wanderRadius
            };
            this.wanderCounter = 0;
        }
        let desired = this.seek(this.wanderTarget);
        desired = VectorUtils.limit(desired, this.maxSpeed / 10);
        this.npc.velocity.x = VectorUtils.lerp(this.npc.velocity.x, desired.x, 0.05);
        this.npc.velocity.y = VectorUtils.lerp(this.npc.velocity.y, desired.y, 0.05);
    }
}