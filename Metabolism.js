class Metabolism {
    constructor() {
        this.isAlive = true;
        this.health = 100;
        this.energy = 100;
        this.hunger = 100;
        this.thirst = 100;
        this.strength = 20;
        this.energyUsage = {
            walk: 0.0001,
            run: 0.001,
            sprint: 0.05,
            stationary: -0.00001
        };
        this.lowEnergyThreshold = 20; // Example value
        this.lowEnergyMaxDuration = 1000; // Example value
        this.lowEnergyDuration = 0;
    }

    adjustEnergyUsage(velocity, walkSpeed, runSpeed, sprintSpeed) {
        let currentSpeed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
        if (currentSpeed > runSpeed) {
            this.energy -= this.energyUsage.sprint;
        } else if (currentSpeed > walkSpeed) {
            this.energy -= this.energyUsage.run;
        } else if (currentSpeed > 0) {
            this.energy -= this.energyUsage.walk;
        } else {
            this.energy += this.energyUsage.stationary;
        }
        this.energy = Math.max(this.energy, 0);
        if (this.energy <= this.lowEnergyThreshold) {
            this.lowEnergyDuration++;
            if (this.lowEnergyDuration >= this.lowEnergyMaxDuration) {
                this.health -= 0.1;
            }
        } else {
            this.lowEnergyDuration = 0;
        }
    }

    handleHealth() {
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isAlive = false;
        this.health = 0;
        this.energy = 0;
    }
}