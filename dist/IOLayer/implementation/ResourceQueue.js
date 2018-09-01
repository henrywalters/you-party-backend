"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResourceQueue {
    constructor() {
        this.Queue = [];
        this.running = false;
    }
    addToQueue(item) {
        this.Queue.push(item);
        console.log("QUEUE SIZE: " + this.Queue.length);
        if (!this.running) {
            this.handleQueue();
        }
    }
    handleQueue() {
        if (typeof this.Queue[0] === 'undefined') { //quick check instead of counting length each time
            this.running = false;
        }
        else {
            this.running = true;
            let itemArr = this.Queue.shift();
            itemArr.map(item => {
                item.execute();
            });
            console.log("QUEUE SIZE: " + this.Queue.length);
            this.handleQueue();
        }
    }
}
exports.default = ResourceQueue;
//# sourceMappingURL=ResourceQueue.js.map