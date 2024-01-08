class MovementBehavior {
    constructor() {
        this.wanderCounter = 0;
        this.wanderChangeInterval = 300; // frames
        this.wanderRadius = 300;
        this.wanderAngleVariance = Math.PI / 4; // 45 degrees
    }

    faceTarget(npc, target) {
        let angleToTarget = Math.atan2(target.y - npc.y, target.x - npc.x);
        let currentAngle = Math.atan2(npc.velocity.y, npc.velocity.x);
        let newAngle = VectorUtils.lerp(currentAngle, angleToTarget, 0.01);
        npc.velocity.x = Math.cos(newAngle) * npc.locomotion.maxSpeed;
        npc.velocity.y = Math.sin(newAngle) * npc.locomotion.maxSpeed;
    }

    lookAround(npc) {
        let currentAngle = Math.atan2(npc.velocity.y, npc.velocity.x);
        let newAngle = currentAngle + 0.02; // Adjust the value for rotation speed
        npc.velocity.x = Math.cos(newAngle) * npc.locomotion.maxSpeed;
        npc.velocity.y = Math.sin(newAngle) * npc.locomotion.maxSpeed;
    }

    patrol(npc) {
        let target = npc.patrolPoints[npc.currentPatrolPoint];
        if (VectorUtils.getDistance(npc, target) < 10) {
            npc.currentPatrolPoint = (npc.currentPatrolPoint + 1) % npc.patrolPoints.length;
        }
        this.seek(npc, target);
    }

    rest(npc) {
        npc.velocity = { x: 0, y: 0 };
        npc.metabolism.energy = Math.min(npc.metabolism.energy + 1, 100);
        if (npc.metabolism.energy >= 100) {
            npc.isResting = false;
        }
    }

    seek(npc, target) {
        let desired = { x: target.x - npc.x, y: target.y - npc.y };
        desired = VectorUtils.setMagnitude(desired, npc.locomotion.maxSpeed);
        return { x: desired.x - npc.velocity.x, y: desired.y - npc.velocity.y };
    }

    stopMovement(npc) {
        if (npc.velocity.x !== 0 || npc.velocity.y !== 0) {
            npc.velocity.x = VectorUtils.lerp(npc.velocity.x, 0, 0.05);
            npc.velocity.y = VectorUtils.lerp(npc.velocity.y, 0, 0.05);
        }
    }    

    wander(npc) {
        npc.wanderCounter = (npc.wanderCounter || 0) + 1;
        if (!npc.target || npc.wanderCounter >= this.wanderChangeInterval) {
            const directionAngle = Math.atan2(npc.velocity.y, npc.velocity.x);
            const weightedAngle = directionAngle + (Math.random() * this.wanderAngleVariance - this.wanderAngleVariance / 2);
            npc.target = {
                x: npc.x + Math.cos(weightedAngle) * this.wanderRadius,
                y: npc.y + Math.sin(weightedAngle) * this.wanderRadius
            };
            npc.wanderCounter = 0;
        }
        let desired = this.seek(npc, npc.target);
        desired = VectorUtils.limit(desired, npc.locomotion.maxSpeed / 10);
        npc.velocity.x = VectorUtils.lerp(npc.velocity.x, desired.x, 0.05);
        npc.velocity.y = VectorUtils.lerp(npc.velocity.y, desired.y, 0.05);
    }
}
