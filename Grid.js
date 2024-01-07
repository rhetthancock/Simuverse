class GridCell {
    constructor(x, y, walkable) {
        this.x = x;
        this.y = y;
        this.walkable = walkable;
    }
}

class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                row.push(new GridCell(x, y, true)); // Assuming all cells are walkable initially
            }
            this.cells.push(row);
        }
    }
    getCell(x, y) {
        return this.cells[y][x];
    }
}