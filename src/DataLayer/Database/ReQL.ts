import IDatabase from '../Interface/IDatabase';
import * as RethinkDB from 'rethinkdb';
import IDataCallback from '../Interface/IDataCallback';
import IQueryable from '../Interface/IQueryable';

export default class ReQL implements IDatabase, IQueryable {
    
    connection: RethinkDB.Connection;
    database: String;

    constructor() {
        this.connection = null;
        this.database = null;
    }

    connect(database: string, callback: IDataCallback) {
        let self = this;
        RethinkDB.connect({
            db: database
        }, (error: RethinkDB.ReqlDriverError, connection: RethinkDB.Connection) => {
            if (!error) {
                this.connection = connection;
                this.database = database;
                callback(false, true);
            } else {
                callback(error, false);
            }
        })
    }

    getDbType(): string {
        return "RethinkDB";
    }

    isAlive(): boolean {
        if (this.connection !== null) {
            return true;
        } else {
            return false;
        }
    }

    handleConnection(callback: IDataCallback): void {
        if (!this.isAlive()) {
            callback("Connection is not alive", false);
        }
    }

    get(table: string, index: string, callback:{(error: boolean, res: Object): void }): void {
        this.handleConnection(callback);

        RethinkDB.table(table).get(index).run(this.connection, (error, result) => {
            if (error) {
                callback(true, null);
            } else {
                callback(false, result);
            }
        })
    }

    getWhere(table: string, filter: Object, callback: {(error: boolean, res: Array<Object>): void}):  void {
        this.handleConnection(callback);

        RethinkDB.table(table).filter(filter).run(this.connection, (error, result) => {
            if (error) {
                callback(true, null);
            } else {
                result.toArray((error, results) => {
                    if (error) {
                        callback(true, null);
                    } else {
                        callback(false, results);
                    }
                })
            }
        })
    }

    getAll(table: string, callback:{(error: boolean, res: Array<Object>): void }): void {
        this.handleConnection(callback);

        RethinkDB.table(table).run(this.connection, (error, result) => {
            if (error) {
                callback(true, null);
            } else {
                result.toArray((error, results) => {
                    if (error) {
                        callback(true, null);
                    } else {
                        callback(false, results);
                    }
                })
            }
        })
    }

    create(table: string, model: Object, callback: {(error: boolean, response: object): void}): void {
        this.handleConnection(callback);

        RethinkDB.table(table).insert(model).run(this.connection, (error, result) => {
            if (error) {
                callback(true, null);
            } else {
                let key = result.generated_keys[0];
                this.get(table, key, (error, result) => {
                    if (error) {
                        callback(true, null);
                    } else {
                        callback(false, result);
                    }
                })                
            }
        })
    }

    update(table: string, index: string, changes: Object, callback: {(error: boolean, response: object): void}): void {
        this.handleConnection(callback);

        RethinkDB.table(table).get(index).update(changes).run(this.connection, (error, result) => {
            if (error) {
                callback(false, null);
            } else {
                this.get(table, index, (error, result) => {
                    if (error) {
                        callback(true, null);
                    } else {
                        callback(false, result);
                    }
                })  
            }
        })
    }

    destroy(table: string, index: string, callback: {(success: boolean): void}): void {
        this.handleConnection(callback);

        RethinkDB.table(table).get(index).delete().run(this.connection, (error, result) => {
            if (error) {
                callback(false);
            } else {
                callback(true);
            }
        })
    }
}