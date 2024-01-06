let canvas, context, frames = 0;

function gameLoop() {
    requestAnimationFrame(gameLoop);
    update();
    render();
}

function update() {
    // Update logic for NPCs, etc.
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    player.draw(context);
    for (let npc of npcs) {
        npc.draw(context);
    }

    context.font = "10px monospace";
    context.fillStyle = '#fff';
    context.fillText(`Frames: ${frames}`, 5, 10);
    context.fillText(`Height: ${canvas.height}`, 5, 25);
    context.fillText(`Width: ${canvas.width}`, 5, 40);
    frames++;
}

function handleResize() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
}

let player, npcs = [];
function main() {
    canvas = document.getElementById('sv_canvas');
    context = canvas.getContext('2d');
    window.addEventListener('resize', handleResize);
    handleResize();

    player = new Player(50, 50);

    for (let i = 0; i < 10; i++) {
        let npc = new NPC(Math.random() * canvas.width, Math.random() * canvas.height);
        npcs.push(npc);
    }

    gameLoop();
}

window.addEventListener('DOMContentLoaded', main);