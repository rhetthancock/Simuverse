class Resource {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.quantity = 10;
    }
    draw(context) {
        const radius = this.quantity;
        switch (this.type) {
            case 'food':
                context.fillStyle = '#0a490e';
                break;
            case 'wood':
                context.fillStyle = '#47331b';
                break;
            case 'stone':
                context.fillStyle = '#454545';
                break;
            default:
                context.fillStyle = '#ff0000';
        }
        context.beginPath();
        context.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        context.fill();
    }
}
