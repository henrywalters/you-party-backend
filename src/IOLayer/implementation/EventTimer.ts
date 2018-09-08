export class EventTimer {
    private _EventTimer;
    private InitialDuration; 
    private CurrentDuration;

    constructor() {
        this._EventTimer = null;
        this.InitialDuration = 0;
        this.CurrentDuration = 0;
    }
}