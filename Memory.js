class Memory {
    constructor() {
        this.rememberedResources = [];
    }
    observeAndRememberResources(agent, resources, perceptionDistance) {
        resources.forEach(resource => {
            if (VectorUtils.getDistance(agent, resource) < perceptionDistance) {
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
}
