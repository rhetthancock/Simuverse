class VectorUtils {
    // Calculates the Euclidean distance between two points (objects with x and y properties)
    static getDistance(obj1, obj2) {
        let dx = obj1.x - obj2.x;
        let dy = obj1.y - obj2.y;
        return Math.sqrt(dx ** 2 + dy ** 2);
    }

    // Linearly interpolates between two values
    static lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    // Interpolates between two angles, taking the shortest path
    static lerpAngle(a, b, t) {
        let diff = b - a;
        if (diff > Math.PI) diff -= 2 * Math.PI;
        if (diff < -Math.PI) diff += 2 * Math.PI;
        return a + diff * t;
    }

    // Linearly interpolates between two vectors
    static lerpVector(v1, v2, t) {
        return {
            x: this.lerp(v1.x, v2.x, t),
            y: this.lerp(v1.y, v2.y, t)
        };
    }

    // Sets the magnitude (length) of a vector
    static setMagnitude(vector, magnitude) {
        let len = this.magnitude(vector); // Use the magnitude method
        return { x: vector.x / len * magnitude, y: vector.y / len * magnitude };
    }

    // Limits the magnitude of a vector to a maximum value
    static limit(vector, max) {
        const magnitude = this.magnitude(vector); // Use the magnitude method
        if (magnitude > max) {
            return { x: vector.x / magnitude * max, y: vector.y / magnitude * max };
        }
        return vector;
    }

    // Normalizes the vector to have a magnitude of 1 (unit vector)
    static normalize(vector) {
        let len = this.magnitude(vector); // Use the magnitude method
        if (len === 0) return { x: 0, y: 0 };
        return { x: vector.x / len, y: vector.y / len };
    }

    // Calculates the magnitude (length) of a vector
    static magnitude(vector) {
        return Math.sqrt(vector.x ** 2 + vector.y ** 2);
    }
}
