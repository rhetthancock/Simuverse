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
    document.getElementById('sv_button_spawnAgent').addEventListener('click', () => { sim.spawnAgent(); });
    document.getElementById('sv_button_spawnResource').addEventListener('click', () => { sim.spawnResource(); });
    document.getElementById('sv_button_save').addEventListener('click', () => { sim.saveState(); });
    document.getElementById('sv_button_load').addEventListener('click', () => { 
        const stateString = prompt('What is your state string?');
        sim.loadState(stateString);
    });
    sim.setupEventListeners();
}

window.addEventListener('DOMContentLoaded', main);