class Perception {
    constructor(agent, perceptionAngle = Math.PI / 1.25, perceptionRadius = 40, perceptionDistance = 500) {
        this.agent = agent;
        this.perceptionColor = "rgba(128, 128, 128, 0.2)";
        this.perceptionAngle = perceptionAngle;
        this.perceptionRadius = perceptionRadius;
        this.perceptionDistance = perceptionDistance;
    }
    isTargetPerceivable(target) {
        let directionAngle = Math.atan2(this.agent.velocity.y, this.agent.velocity.x);
        let angleToTarget = Math.atan2(target.y - this.agent.y, target.x - this.agent.x);
        let angleDifference = Math.abs(directionAngle - angleToTarget);
        let distance = VectorUtils.getDistance(this.agent, target) - (this.agent.size / 2 + target.size / 2);
        return angleDifference < this.perceptionAngle / 2 && distance < this.perceptionDistance;
    }
    drawPerceptionCone(context) {
        context.beginPath();
        context.moveTo(this.agent.x + this.agent.size / 2, this.agent.y + this.agent.size / 2);
        const directionAngle = Math.atan2(this.agent.velocity.y, this.agent.velocity.x);
        const leftAngle = directionAngle - this.perceptionAngle / 2;
        const rightAngle = directionAngle + this.perceptionAngle / 2;
        context.arc(
            this.agent.x + this.agent.size / 2, 
            this.agent.y + this.agent.size / 2, 
            this.perceptionDistance, 
            leftAngle, 
            rightAngle
        );
        context.fillStyle = this.perceptionColor;
        context.fill();
        context.closePath();
    }
}
