import IExecutable from "../interface/IExecutable";


export default class ResourceQueue<T extends IExecutable> {
    private Queue: Array<Array<T>>;
    private running: boolean;
    
    constructor() {
        this.Queue = [];
        this.running = false;    
    }

    public addToQueue(item: Array<T>): void {
        this.Queue.push(item);
        console.log("QUEUE SIZE: " + this.Queue.length);
        if (!this.running) {
            this.handleQueue();
        }
    }

    private handleQueue():void {
        if (typeof this.Queue[0] === 'undefined') { //quick check instead of counting length each time
            this.running = false;
        } else {
            this.running = true;

            let itemArr = this.Queue.shift();

            itemArr.map(item => {
                item.execute();
            })
            console.log("QUEUE SIZE: " + this.Queue.length);
            this.handleQueue();
        }
    }
}