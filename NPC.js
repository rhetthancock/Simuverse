class NPC {
    constructor(x, y) {
        this.isAlive = true;
        this.x = x;
        this.y = y;
        this.health = 100;
        this.color = '#' + Math.floor(Math.random()*16777215).toString(16); // Random color
        this.size = (Math.random() * 20) + 10;
        this.velocity = { 
            x: (Math.random() - 0.5) * 2, 
            y: (Math.random() - 0.5) * 2 
        };
        this.maxSpeed = 3;
        this.perceptionRadius = 40;
        this.stats = {
            health: 100,
            energy: 100,
            hunger: 100,
            thirst: 100
        };
        this.emotions = {
            happiness: 50,
            anxiety: 0
        };
        this.perceptionAngle = Math.PI / 2;
        this.perceptionDistance = 500;
        this.rememberedResources = [];
        this.patrolPoints = [];
        this.currentPatrolPoint = 0;
        
        this.fleeSpeed = 5;
        this.fleeAcceleration = 0.1;
        this.fleeMaxDuration = 400;

        this.walkSpeed = 1;
        this.runSpeed = 2.5;
        this.sprintSpeed = this.maxSpeed;
        this.energyUsage = {
            walk: 0.0001,
            run: 0.001,
            sprint: 0.05,
            stationary: -0.00001 // Negative for energy regeneration
        };
    }
    adjustEnergyUsage() {
        let currentSpeed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (currentSpeed > this.runSpeed) {
            this.stats.energy -= this.energyUsage.sprint;
        } else if (currentSpeed > this.walkSpeed) {
            this.stats.energy -= this.energyUsage.run;
        } else if (currentSpeed > 0) {
            this.stats.energy -= this.energyUsage.walk;
        } else {
            this.stats.energy += this.energyUsage.stationary;
        }

        // Ensure energy does not drop below 0
        this.stats.energy = Math.max(this.stats.energy, 0);

        // Check if energy is below the threshold
        if (this.stats.energy <= this.lowEnergyThreshold) {
            this.lowEnergyDuration++;
            if (this.lowEnergyDuration >= this.lowEnergyMaxDuration) {
                this.stats.health -= 0.1; // Health decreases when energy is low for too long
            }
        } else {
            this.lowEnergyDuration = 0; // Reset duration if energy is above the threshold
        }
    }
    applyFlockingBehaviors(npcs) {
        const separationWeight = 1.5;
        const alignmentWeight = 1.0;
        const cohesionWeight = 1.0;
        const maxForce = 0.05; // Lower maxForce for smoother movement

        let separation = this.calculateSeparation(npcs);
        let alignment = this.calculateAlignment(npcs);
        let cohesion = this.calculateCohesion(npcs);

        // Apply limits to forces
        separation = this.limit(separation, maxForce);
        alignment = this.limit(alignment, maxForce);
        cohesion = this.limit(cohesion, maxForce);

        // Combine flocking behaviors
        this.velocity.x += separation.x * separationWeight + alignment.x * alignmentWeight + cohesion.x * cohesionWeight;
        this.velocity.y += separation.y * separationWeight + alignment.y * alignmentWeight + cohesion.y * cohesionWeight;
        
        // Adjust the velocity if it's too fast
        this.velocity = this.limit(this.velocity, this.maxSpeed);
    }
    calculateAlignment(npcs) {
        let average = { x: 0, y: 0 };
        let total = 0;
        for (let other of npcs) {
            if (other !== this && other.isAlive && this.distance(this, other) < this.perceptionRadius) {
                average.x += other.velocity.x;
                average.y += other.velocity.y;
                total++;
            }
        }
        if (total > 0) {
            average.x /= total;
            average.y /= total;
            average = this.setMagnitude(average, this.maxSpeed);
            let steer = { x: average.x - this.velocity.x, y: average.y - this.velocity.y };
            return steer;
        } else {
            return { x: 0, y: 0 };
        }
    }
    calculateCohesion(npcs) {
        let average = { x: 0, y: 0 };
        let total = 0;
        for (let other of npcs) {
            if (other !== this && other.isAlive && this.distance(this, other) < this.perceptionRadius) {
                average.x += other.x;
                average.y += other.y;
                total++;
            }
        }
        if (total > 0) {
            average.x /= total;
            average.y /= total;
            return this.seek(average); // Steer towards the average position
        } else {
            return { x: 0, y: 0 };
        }
    }
    calculateSeparation(npcs) {
        let steering = { x: 0, y: 0 };
        let total = 0;
        for (let other of npcs) {
            let distance = this.distance(this, other);
            if (other !== this && other.isAlive && this.distance(this, other) < this.perceptionRadius) {
                let diff = { x: this.x - other.x, y: this.y - other.y };
                diff.x /= distance; // Weight by distance
                diff.y /= distance;
                steering.x += diff.x;
                steering.y += diff.y;
                total++;
            }
        }
        if (total > 0) {
            steering.x /= total;
            steering.y /= total;
            // Set magnitude to maxSpeed
            steering = this.setMagnitude(steering, this.maxSpeed);
            // Subtract current velocity
            steering.x -= this.velocity.x;
            steering.y -= this.velocity.y;
        }
        return steering;
    }
    collectResource(resources) {
        // Find the nearest resource of a specific type
        // Example: Find the nearest 'food' resource
        let nearestResource = null;
        let minDistance = Infinity;
        for (let resource of resources) {
            if (resource.type === 'food') { // Adjust type as needed
                let distance = this.distance(this, resource);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestResource = resource;
                }
            }
        }

        if (nearestResource && minDistance < 20) { // 20 is the collection range
            // Collect the resource
            nearestResource.quantity--;
            if (nearestResource.quantity <= 0) {
                // Remove the resource from the array
                const index = resources.indexOf(nearestResource);
                resources.splice(index, 1);
            }
        }
    }
    checkBehind() {
        let desiredAngle = Math.atan2(-this.velocity.y, -this.velocity.x);
        let currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
        let newAngle = this.lerp(currentAngle, desiredAngle, 0.01); // Smoother rotation

        this.velocity.x = Math.cos(newAngle) * this.maxSpeed;
        this.velocity.y = Math.sin(newAngle) * this.maxSpeed;



        // Calculate the direction opposite to the current one
        let oppositeDirection = {
            x: -this.velocity.x,
            y: -this.velocity.y
        };
    
        // Smoothly rotate to the opposite direction
        this.velocity = this.setMagnitude(oppositeDirection, this.maxSpeed);
    
        // If a threat is detected during this rotation, continue fleeing
        if (this.isPlayerInPerceptionCone(player)) {
            this.flee(player);
        }
    }
    checkBehind() {
        // Smoothly rotate to look behind
        let desiredAngle = Math.atan2(-this.velocity.y, -this.velocity.x);
        let currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
        let newAngle = this.lerp(currentAngle, desiredAngle, 0.01); // Adjust this value for rotation speed
    
        this.velocity.x = Math.cos(newAngle) * this.maxSpeed;
        this.velocity.y = Math.sin(newAngle) * this.maxSpeed;
    
        // If the NPC sees a threat while checking behind, it should continue fleeing
        if (this.isPlayerInPerceptionCone(sim.player)) {
            this.flee(sim.player);
        }
    }
    die() {
        this.isAlive = false;
        this.color = '#808080'; // Gray color for dead NPCs
        this.velocity = { x: 0, y: 0 }; // Stop movement
    }
    distance(boid1, boid2) {
        let dx = boid1.x - boid2.x;
        let dy = boid1.y - boid2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    draw(context) {
        // Draw NPC
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);

        // Calculate the center of the NPC
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;

        // Draw direction indicator from the center
        const directionAngle = Math.atan2(this.velocity.y, this.velocity.x);
        const arrowLength = 10; // Adjust as needed
        const endX = centerX + Math.cos(directionAngle) * arrowLength;
        const endY = centerY + Math.sin(directionAngle) * arrowLength;

        context.strokeStyle = '#fff'; // Arrow color
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.lineTo(endX, endY);
        context.stroke();

        this.drawPerceptionCone(context);

        // Draw outline if selected
        if (this === sim.selectedEntity) {
            context.strokeStyle = '#ff0'; // Highlight color
            context.strokeRect(this.x, this.y, this.size, this.size);
        }
    }
    drawPerceptionCone(context) {
        context.beginPath();
        context.moveTo(this.x + this.size / 2, this.y + this.size / 2); // Center of NPC

        // Calculate left and right boundaries of the cone
        const directionAngle = Math.atan2(this.velocity.y, this.velocity.x);
        const leftAngle = directionAngle - this.perceptionAngle / 2;
        const rightAngle = directionAngle + this.perceptionAngle / 2;

        context.arc(
            this.x + this.size / 2, 
            this.y + this.size / 2, 
            this.perceptionDistance, 
            leftAngle, 
            rightAngle
        );

        context.closePath();
        context.fillStyle = "rgba(255, 255, 0, 0.2)"; // Semi-transparent yellow
        context.fill();
    }
    faceTarget(target) {
        let angleToTarget = Math.atan2(target.y - this.y, target.x - this.x);
        let currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
        let newAngle = this.lerp(currentAngle, angleToTarget, 0.01); // Adjust for smoother rotation
    
        this.velocity.x = Math.cos(newAngle) * this.maxSpeed;
        this.velocity.y = Math.sin(newAngle) * this.maxSpeed;
    }    
    flee(player) {
        if (this.isPlayerInPerceptionCone(player)) {
            this.lastPlayerPosition = { x: player.x, y: player.y };
            this.fleeDuration = this.fleeMaxDuration;
        }
    
        if (this.fleeDuration > 0) {
            let fleeDirection = {
                x: this.x - this.lastPlayerPosition.x,
                y: this.y - this.lastPlayerPosition.y
            };
            fleeDirection = this.setMagnitude(fleeDirection, this.fleeSpeed);
    
            this.fleeAcceleration = 0.002;
            this.velocity.x = this.lerp(this.velocity.x, fleeDirection.x, this.fleeAcceleration);
            this.velocity.y = this.lerp(this.velocity.y, fleeDirection.y, this.fleeAcceleration);
    
            this.fleeDuration--;
        } else {
            this.lastPlayerPosition = null;
        }
        this.emotions.anxiety = Math.min(this.emotions.anxiety + 0.01, 100);
    }
    handleEnergyAndHealth() {
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.stats.energy -= 0.00001; // Adjust consumption rate as needed
        }

        if (this.stats.health <= 0) {
            this.die();
        }
    }
    interactWithOtherNPCs(npcs) {
        for (let other of npcs) {
            if (other !== this && other.isAlive && this.isNPCInPerceptionCone(other)) {
                // Increase happiness and decrease anxiety when interacting
                this.emotions.happiness = Math.min(this.emotions.happiness + 0.001, 100);
                this.emotions.anxiety = Math.max(this.emotions.anxiety - 0.001, 0);
                this.signalToInteract(other);
            }
        }
    }
    isNPCInPerceptionCone(other) {
        let directionAngle = Math.atan2(this.velocity.y, this.velocity.x);
        let angleToNPC = Math.atan2(other.y - this.y, other.x - this.x);
        let angleDifference = Math.abs(directionAngle - angleToNPC);
        return angleDifference < this.perceptionAngle / 2 && 
               this.distance(this, other) < this.perceptionDistance;
    }
    isPlayerInPerceptionCone(player) {
        let directionAngle = Math.atan2(this.velocity.y, this.velocity.x);
        let angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
        let angleDifference = Math.abs(directionAngle - angleToPlayer);
        return angleDifference < this.perceptionAngle / 2 && 
               this.distance(this, player) < this.perceptionDistance;
    }
    lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }
    limit(vector, max) {
        const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (magnitude > max) {
            return { x: vector.x / magnitude * max, y: vector.y / magnitude * max };
        }
        return vector;
    }
    lookAround() {
        this.isLookingAround = true;
        let currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
        let newAngle = currentAngle + 0.02; // Adjust for rotation speed
    
        this.velocity.x = Math.cos(newAngle) * this.maxSpeed;
        this.velocity.y = Math.sin(newAngle) * this.maxSpeed;
    }
    observeAndRememberResources(resources) {
        resources.forEach(resource => {
            if (this.distance(this, resource) < this.perceptionDistance) {
                // Check if the resource is already remembered
                const isAlreadyRemembered = this.rememberedResources.some(rememberedResource => 
                    rememberedResource.x === resource.x && 
                    rememberedResource.y === resource.y &&
                    rememberedResource.type === resource.type
                );

                if (!isAlreadyRemembered) {
                    this.rememberedResources.push({ 
                        x: resource.x, 
                        y: resource.y, 
                        type: resource.type 
                    });
                }
            }
        });
    }
    patrol() {
        let target = this.patrolPoints[this.currentPatrolPoint];
        if (this.distance(this, target) < 10) { // 10 is a threshold for reaching a point
            this.currentPatrolPoint = (this.currentPatrolPoint + 1) % this.patrolPoints.length;
        }
        this.seek(target);
    }
    receiveSignal(fromNPC) {
        this.isInteracting = true;
        this.interactionTimer = 0;
        this.stopMovement(); // Stop movement first
        this.faceTarget(fromNPC); // Then face the NPC who sent the signal
    
        // Interaction logic, e.g., share knowledge or trade
        // ...
    
        // Set a timer or condition to end the interaction
        this.interactionTimerLimit = 300; // Example: 300 frames
    }
    rest() {
        // Set velocity to zero to make NPC stationary
        this.velocity = { x: 0, y: 0 };

        // Recover energy
        this.stats.energy = Math.min(this.stats.energy + 1, 100); // Assuming max energy is 100

        // Optionally reduce perception radius
        // this.perceptionRadius = reducedRadius; // Set a reduced perception radius

        // Check if the NPC has rested enough
        if (this.stats.energy >= 100) { // Or another threshold
            this.isResting = false;
            // Restore original perception radius if reduced
            // this.perceptionRadius = originalRadius;
        }
    }
    seek(target) {
        let desired = { x: target.x - this.x, y: target.y - this.y };
        desired = this.setMagnitude(desired, this.maxSpeed);
        return { x: desired.x - this.velocity.x, y: desired.y - this.velocity.y };
    }
    setMagnitude(vector, magnitude) {
        let len = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        return { x: vector.x / len * magnitude, y: vector.y / len * magnitude };
    }
    shouldCheckBehind() {
        let anxietyFactor = this.emotions.anxiety / 100; // Converts anxiety to a value between 0 and 1
        let randomCheckChance = 0.01 + anxietyFactor * 0.05; // Increases chance with higher anxiety
        return Math.random() < randomCheckChance;
    }
    signalToInteract(otherNPC) {
        if (this.isNPCInPerceptionCone(otherNPC)) {
            // Send a signal to the other NPC
            otherNPC.receiveSignal(this);
        }
    }
    stopMovement() {
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.velocity.x = this.lerp(this.velocity.x, 0, 0.05);
            this.velocity.y = this.lerp(this.velocity.y, 0, 0.05);
        }
    }    
    update(npcs, resources, player) {
        if (!this.isAlive || isNaN(this.x) || isNaN(this.y)) return;
    
        // Handle energy depletion and health
        this.adjustEnergyUsage();
    
        if (this.stats.energy > 0) {

            // Movement and actions only occur if there's enough energy
            if (this.isInteracting) {
                this.interactionTimer++;
                if (this.interactionTimer >= this.interactionTimerLimit) {
                    this.isInteracting = false;
                    this.interactionTimer = 0;
                    this.wander(); // Resume wandering after interaction
                }
            } else if (this.isLookingAround) {
                this.lookAround();
            } else if (this.fleeDuration > 0) {
                this.flee(player);
            } else if (this.isPlayerInPerceptionCone(player)) {
                this.flee(player);
                this.fleeDuration = this.fleeMaxDuration;
            } else if (this.needsResource) {
                this.collectResource(resources);
            } else if (this.patrolPoints.length > 0) {
                this.patrol();
            } else {
                this.wander();
                this.applyFlockingBehaviors(npcs);
            }
            
            if (this.shouldCheckBehind()) {
                this.checkBehind();
            }
    
            this.updatePosition();
            this.interactWithOtherNPCs(npcs);
        } else {
            // If no energy, the NPC cannot move or perform actions
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
    
        // Always observe and remember resources
        this.observeAndRememberResources(resources);
    
        // Resting logic
        if (this.isResting) {
            this.rest();
        }
    }    
    updatePosition() {
        // Update the NPC's position
        let newX = this.x + this.velocity.x;
        let newY = this.y + this.velocity.y;

        // Check if new position is valid
        if (!isNaN(newX) && !isNaN(newY)) {
            this.x = newX;
            this.y = newY;
        } else {
            console.error("Invalid position calculated", this);
        }
    }
    wander() {
        const changeInterval = 300; // in frames, adjust for more frequent changes
        this.wanderCounter = (this.wanderCounter || 0) + 1;

        if (!this.target || this.wanderCounter >= changeInterval) {
            const wanderRadius = 300; // Radius for wandering area
            const directionAngle = Math.atan2(this.velocity.y, this.velocity.x);
            const angleVariance = Math.PI / 4; // 45 degrees variance on either side of current direction

            // Weighted random angle in front of the NPC
            const weightedAngle = directionAngle + (Math.random() * angleVariance - angleVariance / 2);

            this.target = {
                x: this.x + Math.cos(weightedAngle) * wanderRadius,
                y: this.y + Math.sin(weightedAngle) * wanderRadius
            };
            this.wanderCounter = 0;
        }

        let desired = this.seek(this.target);
        desired = this.limit(desired, this.maxSpeed / 10); // Limit speed for smoother wandering

        // Gradually adjust the current velocity towards the desired velocity
        this.velocity.x = this.lerp(this.velocity.x, desired.x, 0.05);
        this.velocity.y = this.lerp(this.velocity.y, desired.y, 0.05);
    }
}