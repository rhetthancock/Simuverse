class Behavior {
    constructor() {
        this.actions = [];
    }
    addAction(action) {
        this.actions.push(action);
    }
    performAction(npc) {
        let totalWeight = this.actions.reduce((sum, action) => sum + action.weight, 0);
        let randomNum = Math.random() * totalWeight;
        for (const action of this.actions) {
            if (randomNum < action.weight) {
                action.perform(npc);
                break;
            }
            randomNum -= action.weight;
        }
    }
}
