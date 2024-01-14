class FleeBehavior {
    constructor(agent, fleeAcceleration = 0.005, fleeMaxDuration = 300) {
        this.agent = agent;
        this.fleeAcceleration = fleeAcceleration;
        this.fleeMaxDuration = fleeMaxDuration;
    }
    flee(threat) {
        if (this.agent.perception.isTargetPerceivable(threat)) {
            this.agent.lastThreatPosition = { x: threat.x, y: threat.y };
            this.agent.fleeDuration = this.fleeMaxDuration;
        }
        if (this.agent.fleeDuration > 0) {
            let fleeDirection = {
                x: this.agent.x - this.agent.lastThreatPosition.x,
                y: this.agent.y - this.agent.lastThreatPosition.y
            };
            fleeDirection = VectorUtils.setMagnitude(fleeDirection, this.agent.locomotion.maxSpeed);
            this.agent.velocity.x = VectorUtils.lerp(this.agent.velocity.x, fleeDirection.x, this.fleeAcceleration);
            this.agent.velocity.y = VectorUtils.lerp(this.agent.velocity.y, fleeDirection.y, this.fleeAcceleration);
            this.agent.fleeDuration--;
        } else {
            this.agent.lastThreatPosition = null;
        }
        this.agent.emotions.anxiety = Math.min(this.agent.emotions.anxiety + 0.01, 100);
    }
    checkBehind() {
        const rotationSpeed = 0.01;
        let desiredAngle = Math.atan2(-this.agent.velocity.y, -this.agent.velocity.x);
        let currentAngle = Math.atan2(this.agent.velocity.y, this.agent.velocity.x);
        let newAngle = VectorUtils.lerp(currentAngle, desiredAngle, rotationSpeed);
        this.velocity.x = Math.cos(newAngle) * this.maxSpeed;
        this.velocity.y = Math.sin(newAngle) * this.maxSpeed;
        let oppositeDirection = {
            x: -this.velocity.x,
            y: -this.velocity.y
        };
        this.velocity = VectorUtils.setMagnitude(oppositeDirection, this.maxSpeed);
    }
}
