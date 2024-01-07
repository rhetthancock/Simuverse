class VectorUtils {
    static lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }
    static setMagnitude(vector, magnitude) {
        let len = Math.sqrt(vector.x ** 2 + vector.y ** 2);
        return { x: vector.x / len * magnitude, y: vector.y / len * magnitude };
    }
    static getDistance(obj1, obj2) {
        let dx = obj1.x - obj2.x;
        let dy = obj1.y - obj2.y;
        return Math.sqrt(dx ** 2 + dy ** 2);
    }
}
