class InteractionBehavior {
    constructor(npc, interactionTimerLimit = 500) {
        this.npc = npc;
        this.interactionTimer = 0;
        this.interactionTimerLimit = interactionTimerLimit;
    }
    interactWithOthernpcs(npcs) {
        for (let other of npcs) {
            if (other !== this.npc && other.isAlive && this.npc.isTargetPerceivable(other)) {
                // Increase happiness and decrease anxiety when interacting
                this.npc.emotions.happiness = Math.min(this.npc.emotions.happiness + 0.001, 100);
                this.npc.emotions.anxiety = Math.max(this.npc.emotions.anxiety - 0.001, 0);
                this.npc.signalToInteract(other);
            }
        }
    }
    receiveSignal(sender) {
        this.npc.isInteracting = true;
        this.interactionTimer = 0;
        this.npc.stopMovement();
        this.npc.faceTarget(sender);
    }
    signalToInteract(target) {
        if (this.npc.isTargetPerceivable(target)) {
            target.interactionBehavior.receiveSignal(this.npc);
        }
    }
    updateInteraction() {
        if (this.npc.isInteracting) {
            this.interactionTimer++;
            if (this.interactionTimer >= this.interactionTimerLimit) {
                this.npc.isInteracting = false;
                this.interactionTimer = 0;
                this.npc.wanderBehavior.wander(this.npc);
            }
        }
    }
}

