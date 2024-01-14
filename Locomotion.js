class Locomotion {
    constructor(agent) {
        this.agent = agent;
        this.walkSpeed = 1;
        this.runSpeed = 2.5;
        this.sprintSpeed = 4;
        this.maxSpeed = 4.5;
        this.turnRate = 0.2;
        this.patrolPoints = [];
        this.currentPatrolPoint = 0;
        this.wanderCounter = 0;
        this.wanderChangeInterval = 200; // frames
        this.wanderRadius = 500;
        this.wanderAngleVariance = Math.PI / 4; // 45 degrees
        this.fleeBehavior = new FleeBehavior(agent);
        this.flockingBehavior = new FlockingBehavior(agent);
        this.interactionBehavior = new InteractionBehavior(agent);
    }

    avoidCollisions(agents) {
        let avoidanceRadius = 30;
        let avoidanceVector = { x: 0, y: 0 };

        agents.forEach(otheragent => {
            if (otheragent !== this.agent) {
                let distance = VectorUtils.getDistance(this.agent, otheragent);
                if (distance < avoidanceRadius) {
                    let awayVector = {
                        x: this.agent.x - otheragent.x,
                        y: this.agent.y - otheragent.y
                    };
                    awayVector = VectorUtils.normalize(awayVector);
                    avoidanceVector.x += awayVector.x / distance;
                    avoidanceVector.y += awayVector.y / distance;
                }
            }
        });

        return avoidanceVector;
    }

    faceTarget(target) {
        let targetAngle = Math.atan2(target.y - this.agent.y, target.x - this.agent.x);
        let currentAngle = Math.atan2(this.agent.velocity.y, this.agent.velocity.x);
        // Smoothly interpolate towards the target angle
        let newAngle = VectorUtils.lerpAngle(currentAngle, targetAngle, this.turnRate);
        this.agent.desiredDirection = {x: Math.cos(newAngle), y: Math.sin(newAngle)};  // Store desired direction
    }

    lookAround() {
        let currentAngle = Math.atan2(this.agent.velocity.y, this.agent.velocity.x);
        let newAngle = currentAngle + 0.02; // Adjust the value for rotation speed
        this.agent.velocity.x = Math.cos(newAngle) * this.maxSpeed;
        this.agent.velocity.y = Math.sin(newAngle) * this.maxSpeed;
    }

    patrol() {
        let target = this.patrolPoints[this.currentPatrolPoint];
        if (VectorUtils.getDistance(this.agent, target) < 10) {
            this.currentPatrolPoint = (this.currentPatrolPoint + 1) % this.patrolPoints.length;
        }
        this.seek(target);
    }

    rest() {
        this.stopMovement();
        this.agent.metabolism.energy = Math.min(this.agent.metabolism.energy + 1, 100);
        if (this.agent.metabolism.energy >= 100) {
            this.agent.isResting = false;
        }
    }

    seek(target, stopDistance = 200) {
        let desired = { x: target.x - this.agent.x, y: target.y - this.agent.y };
        let distance = Math.sqrt(desired.x ** 2 + desired.y ** 2);

        // Always face the target
        this.faceTarget(target);
    
        if (distance < stopDistance) {
            this.stopMovement();
            return { x: 0, y: 0 }; // Return zero vector when stopping
        }
    
        // Normalize the desired vector and then apply the maximum speed
        desired = VectorUtils.normalize(desired);
        desired.x *= this.maxSpeed;
        desired.y *= this.maxSpeed;
    
        // Calculate the steering force required
        let steer = {
            x: desired.x - this.agent.velocity.x,
            y: desired.y - this.agent.velocity.y
        };
    
        // Limit the steering force to a maximum acceleration rate
        steer = VectorUtils.limit(steer, this.maxAcceleration);
    
        return steer; // Return the steering vector
    }

    separate(agents) {
        let desiredSeparation = 50; // Adjust as needed
        let steer = { x: 0, y: 0 };
        let count = 0;
    
        // For every agent in the system, check if it's too close
        agents.forEach(otheragent => {
            let distance = VectorUtils.getDistance(this.agent, otheragent);
            if ((distance > 0) && (distance < desiredSeparation)) {
                // Calculate vector pointing away from neighbor
                let diff = VectorUtils.normalize({
                    x: this.agent.x - otheragent.x,
                    y: this.agent.y - otheragent.y
                });
                steer.x += diff.x;
                steer.y += diff.y;
                count++;
            }
        });
    
        // Average the steering
        if (count > 0) {
            steer.x /= count;
            steer.y /= count;
        }
    
        if (VectorUtils.magnitude(steer) > 0) {
            // Implement Reynolds: Steering = Desired - Velocity
            steer = VectorUtils.setMagnitude(steer, this.agent.locomotion.maxSpeed);
            steer.x -= this.agent.velocity.x;
            steer.y -= this.agent.velocity.y;
            steer = VectorUtils.limit(steer, this.agent.locomotion.maxAcceleration);
        }
        return steer;
    }

    stopMovement() {
        let velocity = this.agent.velocity;
        if (velocity.x !== 0 || velocity.y !== 0) {
            this.agent.velocity.x = VectorUtils.lerp(velocity.x, 0, 0.15);
            this.agent.velocity.y = VectorUtils.lerp(velocity.y, 0, 0.15);
        }
    }

    wander() {
        // Increment the wander counter with a small random component for irregularity
        this.wanderCounter += 1 + Math.random() * 0.2;

        if (!this.wanderTarget || this.wanderCounter >= this.wanderChangeInterval) {
            // Reset the wander counter and assign a new random change interval
            this.wanderCounter = 0;
            this.wanderChangeInterval = 150 + Math.floor(Math.random() * 100);

            // Calculate a new wander target as before
            const directionAngle = Math.atan2(this.agent.velocity.y, this.agent.velocity.x);
            const weightedAngle = directionAngle + (Math.random() * this.wanderAngleVariance - this.wanderAngleVariance / 2);
            this.wanderTarget = {
                x: this.agent.x + Math.cos(weightedAngle) * this.wanderRadius,
                y: this.agent.y + Math.sin(weightedAngle) * this.wanderRadius
            };
        }

        // Gradually adjust the direction towards the wander target using the lerpVector method
        // Ensure the lerpVector method is correctly implemented in the VectorUtils class
        let desiredDirection = { x: this.wanderTarget.x - this.agent.x, y: this.wanderTarget.y - this.agent.y };
        desiredDirection = VectorUtils.normalize(desiredDirection);
        let currentDirection = VectorUtils.normalize(this.agent.velocity);
        let turnRate = 0.05; // Adjust the turn rate for smoothness of the turn
        let newDirection = VectorUtils.lerpVector(currentDirection, desiredDirection, turnRate);

        // Update the agent's velocity with the new direction
        let speed = Math.sqrt(this.agent.velocity.x ** 2 + this.agent.velocity.y ** 2);
        // Set the new velocity if the new direction is valid
        if (newDirection) {
            this.agent.velocity.x = newDirection.x * speed;
            this.agent.velocity.y = newDirection.y * speed;
        }
    }
}