class Perception {
    constructor(perceptionAngle = Math.PI / 2, perceptionRadius = 40, perceptionDistance = 500) {
        this.perceptionColor = "rgba(128, 128, 128, 0.2)";
        this.perceptionAngle = perceptionAngle;
        this.perceptionRadius = perceptionRadius;
        this.perceptionDistance = perceptionDistance;
    }
    isTargetPerceivable(npc, target) {
        let directionAngle = Math.atan2(npc.velocity.y, npc.velocity.x);
        let angleToTarget = Math.atan2(target.y - npc.y, target.x - npc.x);
        let angleDifference = Math.abs(directionAngle - angleToTarget);
        return angleDifference < this.perceptionAngle / 2 && 
               VectorUtils.getDistance(npc, target) < this.perceptionDistance;
    }
    drawPerceptionCone(npc, context) {
        context.beginPath();
        context.moveTo(npc.x + npc.size / 2, npc.y + npc.size / 2);
        const directionAngle = Math.atan2(npc.velocity.y, npc.velocity.x);
        const leftAngle = directionAngle - this.perceptionAngle / 2;
        const rightAngle = directionAngle + this.perceptionAngle / 2;
        context.arc(
            npc.x + npc.size / 2, 
            npc.y + npc.size / 2, 
            this.perceptionDistance, 
            leftAngle, 
            rightAngle
        );
        context.closePath();
        context.fillStyle = this.perceptionColor;
        context.fill();
    }
}
