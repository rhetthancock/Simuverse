class FleeBehavior {
    constructor(npc, fleeAcceleration = 0.005, fleeMaxDuration = 300) {
        this.npc = npc;
        this.fleeAcceleration = fleeAcceleration;
        this.fleeMaxDuration = fleeMaxDuration;
    }
    flee(threat) {
        if (this.npc.perception.isTargetPerceivable(threat)) {
            this.npc.lastThreatPosition = { x: threat.x, y: threat.y };
            this.npc.fleeDuration = this.fleeMaxDuration;
        }
        if (this.npc.fleeDuration > 0) {
            let fleeDirection = {
                x: this.npc.x - this.npc.lastThreatPosition.x,
                y: this.npc.y - this.npc.lastThreatPosition.y
            };
            fleeDirection = VectorUtils.setMagnitude(fleeDirection, this.npc.locomotion.maxSpeed);
            this.npc.velocity.x = VectorUtils.lerp(this.npc.velocity.x, fleeDirection.x, this.fleeAcceleration);
            this.npc.velocity.y = VectorUtils.lerp(this.npc.velocity.y, fleeDirection.y, this.fleeAcceleration);
            this.npc.fleeDuration--;
        } else {
            this.npc.lastThreatPosition = null;
        }
        this.npc.emotions.anxiety = Math.min(this.npc.emotions.anxiety + 0.01, 100);
    }
    checkBehind() {
        const rotationSpeed = 0.01;
        let desiredAngle = Math.atan2(-this.npc.velocity.y, -this.npc.velocity.x);
        let currentAngle = Math.atan2(this.npc.velocity.y, this.npc.velocity.x);
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
