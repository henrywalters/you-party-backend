"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = require("../../DataLayer/Domain/Log");
class DataLog {
    constructor(datasource) {
        this.DataSource = datasource;
        this.Log = new Log_1.default();
        this.Log.setDataSource(this.DataSource);
    }
    log(sender, message) {
        let time = new Date();
        this.Log.create({ sender: sender, message: message, time: time.toString() }, (error, res) => { });
    }
    getLogs(cb) {
        this.Log.getAll((error, logs) => {
            if (error) {
                cb([]);
            }
            else {
                cb(logs);
            }
        });
        return false;
    }
}
exports.default = DataLog;
//# sourceMappingURL=DataLog.js.map