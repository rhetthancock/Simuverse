class InteractionBehavior {
    constructor() {
        this.interactionTimer = 0;
        this.interactionTimerLimit = 500;
    }
    // interactWithOtherNPCs(npcs) {
    //     for (let other of npcs) {
    //         if (other !== this && other.isAlive && this.isTargetPerceivable(other)) {
    //             // Increase happiness and decrease anxiety when interacting
    //             this.emotions.happiness = Math.min(this.emotions.happiness + 0.001, 100);
    //             this.emotions.anxiety = Math.max(this.emotions.anxiety - 0.001, 0);
    //             this.signalToInteract(other);
    //         }
    //     }
    // }
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

