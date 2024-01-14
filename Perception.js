class Perception {
    constructor(npc, perceptionAngle = Math.PI / 1.25, perceptionRadius = 40, perceptionDistance = 500) {
        this.npc = npc;
        this.perceptionColor = "rgba(128, 128, 128, 0.2)";
        this.perceptionAngle = perceptionAngle;
        this.perceptionRadius = perceptionRadius;
        this.perceptionDistance = perceptionDistance;
    }
    isTargetPerceivable(target) {
        let directionAngle = Math.atan2(this.npc.velocity.y, this.npc.velocity.x);
        let angleToTarget = Math.atan2(target.y - this.npc.y, target.x - this.npc.x);
        let angleDifference = Math.abs(directionAngle - angleToTarget);
        return angleDifference < this.perceptionAngle / 2 && 
               VectorUtils.getDistance(this.npc, target) < this.perceptionDistance;
    }
    drawPerceptionCone(context) {
        context.beginPath();
        context.moveTo(this.npc.x + this.npc.size / 2, this.npc.y + this.npc.size / 2);
        const directionAngle = Math.atan2(this.npc.velocity.y, this.npc.velocity.x);
        const leftAngle = directionAngle - this.perceptionAngle / 2;
        const rightAngle = directionAngle + this.perceptionAngle / 2;
        context.arc(
            this.npc.x + this.npc.size / 2, 
            this.npc.y + this.npc.size / 2, 
            this.perceptionDistance, 
            leftAngle, 
            rightAngle
        );
        context.fillStyle = this.perceptionColor;
        context.fill();
        context.closePath();
    }
}
