class FleeBehavior {
    constructor(fleeAcceleration = 0.002, fleeMaxDuration = 300) {
        this.fleeAcceleration = fleeAcceleration;
        this.fleeMaxDuration = fleeMaxDuration;
    }
    flee(npc, threat) {
        if (npc.perception.isTargetPerceivable(npc, threat)) {
            npc.lastThreatPosition = { x: threat.x, y: threat.y };
            npc.fleeDuration = this.fleeMaxDuration;
        }
        if (npc.fleeDuration > 0) {
            let fleeDirection = {
                x: npc.x - npc.lastThreatPosition.x,
                y: npc.y - npc.lastThreatPosition.y
            };
            fleeDirection = VectorUtils.setMagnitude(fleeDirection, npc.locomotion.maxSpeed);
            npc.velocity.x = VectorUtils.lerp(npc.velocity.x, fleeDirection.x, this.fleeAcceleration);
            npc.velocity.y = VectorUtils.lerp(npc.velocity.y, fleeDirection.y, this.fleeAcceleration);
            npc.fleeDuration--;
        } else {
            npc.lastThreatPosition = null;
        }
        npc.emotions.anxiety = Math.min(npc.emotions.anxiety + 0.01, 100);
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
