let canvas, context, frames = 0;

// Game loop
function gameLoop() {
    requestAnimationFrame(gameLoop);
    // Update game state
    update();
    // Render the game
    render(context);
}

function update() {
    // Update logic for NPCs, etc.
}

function render() {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.font = "10px monospace";
    context.fillStyle = '#fff';
    context.fillText(`Frames: ${frames}`, 5, 10);
    context.fillText(`Height: ${canvas.height}`, 5, 25);
    context.fillText(`Width: ${canvas.width}`, 5, 40);

    frames++;

    // Draw NPCs and other elements
}

function handleResize() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
}

function main() {
    canvas = document.getElementById('sv_canvas');
    context = canvas.getContext('2d');
    
    window.addEventListener('resize', handleResize);
    handleResize();

    gameLoop();
}

window.addEventListener('DOMContentLoaded', main);