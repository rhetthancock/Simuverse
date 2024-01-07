class NPCConfigurator {
    static getDefaultConfiguration() {
        return {
            fleeSpeed: 5,
            fleeAcceleration: 0.1,
            fleeMaxDuration: 400,
            // Other default configurations
        };
    }

    static getRandomConfiguration() {
        // Generate random configuration values
        return {
            fleeSpeed: Math.random() * 5 + 3,
            fleeAcceleration: Math.random() * 0.1,
            fleeMaxDuration: Math.floor(Math.random() * 400 + 200),
            // Other random configurations
        };
    }
}
