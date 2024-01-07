class FleeBehavior {
    constructor(fleeAcceleration = 0.002, fleeMaxDuration = 500) {
        this.fleeAcceleration = fleeAcceleration;
        this.fleeMaxDuration = fleeMaxDuration;
    }
    flee(npc, threat) {
        if (npc.isTargetPerceivable(threat)) {
            this.lastThreatPosition = { x: threat.x, y: threat.y };
            this.fleeDuration = this.fleeMaxDuration;
        }
        if (this.fleeDuration > 0) {
            let fleeDirection = {
                x: npc.x - this.lastThreatPosition.x,
                y: npc.y - this.lastThreatPosition.y
            };
            fleeDirection = VectorUtils.setMagnitude(fleeDirection, npc.maxSpeed);
            npc.velocity.x = VectorUtils.lerp(npc.velocity.x, fleeDirection.x, this.fleeAcceleration);
            npc.velocity.y = VectorUtils.lerp(npc.velocity.y, fleeDirection.y, this.fleeAcceleration);
            this.fleeDuration--;
        } else {
            this.lastThreatPosition = null;
        }
        npc.emotions.anxiety = Math.min(this.emotions.anxiety + 0.01, 100);
    }
    hide(npc) {
        // TODO: Implement NPC hiding
    }
    checkBehind(npc) {
        const rotationSpeed = 0.01;
        let desiredAngle = Math.atan2(-npc.velocity.y, -npc.velocity.x);
        let currentAngle = Math.atan2(npc.velocity.y, npc.velocity.x);
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
