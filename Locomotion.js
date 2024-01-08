class Locomotion {
    constructor() {
        this.walkSpeed = 1;
        this.runSpeed = 2.5;
        this.sprintSpeed = 4;
        this.maxSpeed = 4.5;
        this.patrolPoints = [];
        this.currentPatrolPoint = 0;
    }
    patrol(npc) {
        let target = this.patrolPoints[this.currentPatrolPoint];
        if (VectorUtils.getDistance(npc, target) < 10) {
            this.currentPatrolPoint = (this.currentPatrolPoint + 1) % this.patrolPoints.length;
        }
        npc.movementBehavior.seek(npc, target);
    }
}