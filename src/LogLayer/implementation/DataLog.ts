import ILog from "../interface/ILog";
import IQueryable from '../../DataLayer/Interface/IQueryable';
import Log from '../../DataLayer/Domain/Log';

export default class DataLog implements ILog {

    Log: Log;
    DataSource: IQueryable;

    constructor(datasource: IQueryable) {
        this.DataSource = datasource;
        this.Log = new Log();
        this.Log.setDataSource(this.DataSource);
    }

    log(sender: string, message: string): void {
        let time = new Date();
        this.Log.create({sender: sender, message: message, time: time.toString()}, (error, res) => {})
    }

    getLogs(cb: {(logs: Array<Object>): void}) {
        this.Log.getAll((error, logs) => {
            if (error) {
                cb([]);
            } else {
                cb(logs);
            }
        })
        return false;
    }
}