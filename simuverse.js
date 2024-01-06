let sim;
function main() {
    const canvas = document.getElementById('sv_canvas');
    sim = new Simulation(canvas);
    setupEventListeners(sim);
    sim.simLoop();
}

function setupEventListeners(sim) {
    window.addEventListener('resize', () => sim.handleResize());
    window.addEventListener('keydown', (event) => sim.handleKeyDown(event));
    window.addEventListener('keyup', (event) => sim.handleKeyUp(event));
    document.getElementById('sv_button_addNPC').addEventListener('click', () => {
        sim.spawnNPC();
    });
}

window.addEventListener('DOMContentLoaded', main);