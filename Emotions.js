class Emotions {
    constructor() {
        this.happiness = 50;
        this.anxiety = 0;
        this.anger = 0;
        this.sadness = 0;
        this.surprise = 10;
        this.anticipation = 0;
        this.shame = 0;
        this.pride = 10;
        this.regret = 5;
        this.contentment = 50;
        this.boredom = 25;
    }
    changeEmotion(emotion, amount) {
        if (this[emotion] !== undefined) {
            this[emotion] = Math.max(0, Math.min(100, this[emotion] + amount));
        }
    }
}
