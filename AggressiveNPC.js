class AggressiveNPC extends NPC {
    constructor(x, y) {
        super(x, y);
        this.color = '#ff0000'; // Different color for aggressive NPCs
        // Other unique properties for AggressiveNPC
    }

    // Override the update method for specific behavior
    update() {
        // Add specific logic for aggressive behavior
        // For example, moving faster towards the player or other NPCs
    }
}