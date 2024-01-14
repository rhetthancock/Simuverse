class InteractionBehavior {
    constructor(agent, interactionTimerLimit = 500) {
        this.agent = agent;
        this.interactionTimer = 0;
        this.interactionTimerLimit = interactionTimerLimit;
    }
    interactWithOtheragents(agents) {
        for (let other of agents) {
            if (other !== this.agent && other.isAlive && this.agent.isTargetPerceivable(other)) {
                // Increase happiness and decrease anxiety when interacting
                this.agent.emotions.happiness = Math.min(this.agent.emotions.happiness + 0.001, 100);
                this.agent.emotions.anxiety = Math.max(this.agent.emotions.anxiety - 0.001, 0);
                this.agent.signalToInteract(other);
            }
        }
    }
    receiveSignal(sender) {
        this.agent.isInteracting = true;
        this.interactionTimer = 0;
        this.agent.stopMovement();
        this.agent.faceTarget(sender);
    }
    signalToInteract(target) {
        if (this.agent.isTargetPerceivable(target)) {
            target.interactionBehavior.receiveSignal(this.agent);
        }
    }
    updateInteraction() {
        if (this.agent.isInteracting) {
            this.interactionTimer++;
            if (this.interactionTimer >= this.interactionTimerLimit) {
                this.agent.isInteracting = false;
                this.interactionTimer = 0;
                this.agent.wanderBehavior.wander(this.agent);
            }
        }
    }
}

