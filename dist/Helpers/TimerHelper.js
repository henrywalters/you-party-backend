"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TimerHelper {
    constructor() {
        this._start = new Date();
    }
    start() {
        this._start = new Date();
        this._delta = 0;
    }
    stop() {
        this._stop = new Date();
        this._delta = this._stop.getMilliseconds() - this._start.getMilliseconds();
    }
    delta() {
        return this._delta;
    }
    toString() {
        return "Start: " + this._start + " End: " + this._stop + " Delta: " + this._delta;
    }
}
exports.default = TimerHelper;
//# sourceMappingURL=TimerHelper.js.map