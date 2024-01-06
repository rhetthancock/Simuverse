let canvas, context, frames = 0;
let keysPressed = {};

function gameLoop() {
    requestAnimationFrame(gameLoop);
    update();
    render();
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

function update() {
    movePlayer();
    npcs.forEach(npc => npc.update());
    checkInteractions();
}

function checkInteractions() {
    npcs.forEach(npc => {
        if (isColliding(player, npc)) {
            npc.color = '#ff0000';
        }
    });
}

function handleKeyDown(event) {
    keysPressed[event.key] = true;
}

function handleKeyUp(event) {
    delete keysPressed[event.key];
}

function handleResize() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
}

function isColliding(obj1, obj2) {
    return obj1.x < obj2.x + obj2.size &&
           obj1.x + obj1.size > obj2.x &&
           obj1.y < obj2.y + obj2.size &&
           obj1.y + obj1.size > obj2.y;
}

let player, npcs = [];
function main() {
    canvas = document.getElementById('sv_canvas');
    context = canvas.getContext('2d');
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    handleResize();

    player = new Player(50, 50);

    for (let i = 0; i < 10; i++) {
        let npc = new NPC(Math.random() * canvas.width, Math.random() * canvas.height);
        npcs.push(npc);
    }

    gameLoop();
}

function movePlayer() {
    const speed = 5; // Adjust the speed as needed
    if (keysPressed['ArrowUp']) player.move(0, -speed);
    if (keysPressed['ArrowDown']) player.move(0, speed);
    if (keysPressed['ArrowLeft']) player.move(-speed, 0);
    if (keysPressed['ArrowRight']) player.move(speed, 0);
}

window.addEventListener('DOMContentLoaded', main);