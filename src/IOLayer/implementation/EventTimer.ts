export class EventTimer {
    private _EventTimer;
    private ExecutionFunction;
    private StartFunction;
    private StopFunction;
    private InitialDuration; 
    private CurrentDuration; 
    private TimeElapsed: number;
    private TimeStarted: number;
    private Status: string;

    constructor() {
        this._EventTimer = null;
        this.ExecutionFunction = null;
        this.StartFunction = null;
        this.StopFunction = null;
        this.InitialDuration = 0;
        this.CurrentDuration = 0;
        this.TimeElapsed = 0;
        this.TimeStarted = 0;
        this.Status = "end";
    }

    /**
     * @description Initializes an event. Does not start the event.
     * @param duration in seconds until the execution function will be ran.
     * @param executionFunction the function to be called upon the timer hitting 0.
     * @param startFunction function called upon a starting
     * @param stopFunction function to be called when event stops
     */
    public newEvent(duration: number, executionFunction: any, startFunction: any = null, stopFunction: any = null): void {
        this.InitialDuration = duration;
        this.ExecutionFunction = executionFunction;
        this.StartFunction = startFunction;
        this.StopFunction = stopFunction;
        this.CurrentDuration = this.InitialDuration;
        this.TimeElapsed = 0;
        this.Status = "new";
    }


    /**
     * @description Starts the timer and stages the execution function.
     */
    public startEvent(): void {
        if (this.Status === "new" || this.Status === "stop"){
            this.Status = "start";
            if (this.StartFunction !== null) {
                this.StartFunction();
            }

            this.TimeStarted = Date.now();
            this._EventTimer = setTimeout(this.ExecutionFunction, this.CurrentDuration);
        }
    }

    /**
     * @description Ends the event timer and tracks the elapsed time since the last start and updates the current duration.
     */
    public stopEvent(): void {
        if (this.Status === "start") {
            this.Status = "stop";
            clearTimeout(this._EventTimer);

            if (this.StopFunction !== null) {
                this.StopFunction();
            }

            this._EventTimer = null;
            let delta = Date.now() - this.TimeStarted;
            this.TimeElapsed += delta;
            this.CurrentDuration -= delta;
        }
    }

    /**
     * @description destructs the entire event timer object.
     */
    public endEvent(): void {
        if (this.Status === "stop" || this.Status === "start" || this.Status === "new") {
            this._EventTimer = null;
            this.ExecutionFunction = null;
            this.StartFunction = null;
            this.StopFunction = null;
            this.InitialDuration = 0;
            this.CurrentDuration = 0;
            this.TimeStarted = 0;
            this.Status = null;
        }
    }

    /**
     * @return Returns the time the event has been waiting. Does not include stopped time.
     */
    public getElapsedTime(): number {
        let delta = Date.now() - this.TimeStarted;
        return this.TimeElapsed + delta;
    }

    public getRemainingTime(): number {
        return this.InitialDuration - this.getElapsedTime();
    }
}