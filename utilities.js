function isColliding(obj1, obj2) {
    return obj1.x < obj2.x + obj2.size &&
           obj1.x + obj1.size > obj2.x &&
           obj1.y < obj2.y + obj2.size &&
           obj1.y + obj1.size > obj2.y;
}

function isInZone(entity, zone) {
    return entity.x > zone.x && entity.x < zone.x + zone.width &&
           entity.y > zone.y && entity.y < zone.y + zone.height;
}