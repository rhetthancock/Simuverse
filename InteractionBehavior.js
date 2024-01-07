class InteractionBehavior {
    constructor() {
        this.interactionTimer = 0;
        this.interactionTimerLimit = 500;
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
