class InteractionBehavior {
    constructor() {
        this.interactionTimer = 0;
        this.interactionTimerLimit = 500;
    }
    interactWithOtherNPCs(npc, npcs) {
        for (let other of npcs) {
            if (other !== npc && other.isAlive && npc.isTargetPerceivable(other)) {
                // Increase happiness and decrease anxiety when interacting
                npc.emotions.happiness = Math.min(npc.emotions.happiness + 0.001, 100);
                npc.emotions.anxiety = Math.max(npc.emotions.anxiety - 0.001, 0);
                npc.signalToInteract(other);
            }
        }
    }
    receiveSignal(npc, fromNPC) {
        npc.isInteracting = true;
        this.interactionTimer = 0;
        npc.stopMovement();
        npc.faceTarget(fromNPC);
    }
    signalToInteract(npc, otherNPC) {
        if (npc.isTargetPerceivable(otherNPC)) {
            otherNPC.interactionBehavior.receiveSignal(otherNPC, npc);
        }
    }
    updateInteraction(npc) {
        if (npc.isInteracting) {
            this.interactionTimer++;
            if (this.interactionTimer >= this.interactionTimerLimit) {
                npc.isInteracting = false;
                this.interactionTimer = 0;
                npc.wanderBehavior.wander(npc);
            }
        }
    }
}

