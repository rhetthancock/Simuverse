let canvas, context, frames = 0;
let resources = [];
let keysPressed = {};

function gameLoop() {
    requestAnimationFrame(gameLoop);
    update();
    render();
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for(let zone of zones) {
        context.fillStyle = zone.color;
        context.fillRect(zone.x, zone.y, zone.width, zone.height);
    }

    for (let resource of resources) {
        context.fillStyle = resource.color;
        context.fillRect(resource.x, resource.y, resource.size, resource.size);
    }

    for (let npc of npcs) {
        npc.draw(context);
    }

    player.draw(context);

    context.font = "10px monospace";
    context.fillStyle = '#fff';
    context.fillText(`Frames: ${frames}`, 5, 10);
    context.fillText(`Height: ${canvas.height}`, 5, 25);
    context.fillText(`Width: ${canvas.width}`, 5, 40);
    frames++;
}

function update() {
    movePlayer();
    applyZoneEffects();
    npcs.forEach(npc => {
        npc.update();
        npc.interactWithOtherNPCs(npcs);
    });
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

    document.getElementById('sv_button_addNPC').addEventListener('click', () => {
        let npc = new NPC(Math.random() * canvas.width, Math.random() * canvas.height);
        npcs.push(npc);
    });

    player = new Player(50, 50);

    for (let i = 0; i < 10; i++) {
        let npc = new NPC(Math.random() * canvas.width, Math.random() * canvas.height);
        spawnResource();
        npcs.push(npc);
    }

    gameLoop();
}

function movePlayer() {
    const speed = player.speed;
    if (keysPressed['ArrowUp']) player.move(0, -speed);
    if (keysPressed['ArrowDown']) player.move(0, speed);
    if (keysPressed['ArrowLeft']) player.move(-speed, 0);
    if (keysPressed['ArrowRight']) player.move(speed, 0);
}

function spawnResource() {
    let resource = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 10,
        color: '#00ffff'
    };
    resources.push(resource);
}

let zones = [
    { x: 100, y: 100, width: 200, height: 200, effect: 'slow', color: '#222222' }
    // Add more zones as needed
];

function applyZoneEffects() {
    for (let zone of zones) {
        npcs.forEach(npc => {
            if (isInZone(npc, zone)) {
                // Apply the effect based on the zone type
                if (zone.effect === 'slow') {
                    npc.speed = 0.5; // Slow down the NPC
                }
            }
        });
    }
}

function isInZone(entity, zone) {
    return entity.x > zone.x && entity.x < zone.x + zone.width &&
           entity.y > zone.y && entity.y < zone.y + zone.height;
}

window.addEventListener('DOMContentLoaded', main);