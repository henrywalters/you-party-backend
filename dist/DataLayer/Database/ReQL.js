"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RethinkDB = require("rethinkdb");
class ReQL {
    constructor() {
        this.connection = null;
        this.database = null;
    }
    connect(database, callback) {
        let self = this;
        RethinkDB.connect({
            db: database
        }, (error, connection) => {
            if (!error) {
                this.connection = connection;
                this.database = database;
                callback(false, true);
            }
            else {
                callback(error, false);
            }
        });
    }
    getDbType() {
        return "RethinkDB";
    }
    query(query, callback) {
        console.log("ERROR: REQL DOES NOT HAVE RAW QUERY.");
        callback(false, null);
    }
    isAlive() {
        if (this.connection !== null) {
            return true;
        }
        else {
            return false;
        }
    }
    handleConnection(callback) {
        if (!this.isAlive()) {
            callback("Connection is not alive", false);
        }
    }
    get(table, index, callback) {
        this.handleConnection(callback);
        RethinkDB.table(table).get(index).run(this.connection, (error, result) => {
            if (error) {
                callback(true, null);
            }
            else {
                callback(false, result);
            }
        });
    }
    getWhere(table, filter, callback) {
        this.handleConnection(callback);
        RethinkDB.table(table).filter(filter).run(this.connection, (error, result) => {
            if (error) {
                callback(true, null);
            }
            else {
                result.toArray((error, results) => {
                    if (error) {
                        callback(true, null);
                    }
                    else {
                        callback(false, results);
                    }
                });
            }
        });
    }
    getAll(table, callback) {
        this.handleConnection(callback);
        RethinkDB.table(table).run(this.connection, (error, result) => {
            if (error) {
                callback(true, null);
            }
            else {
                result.toArray((error, results) => {
                    if (error) {
                        callback(true, null);
                    }
                    else {
                        callback(false, results);
                    }
                });
            }
        });
    }
    create(table, model, callback) {
        this.handleConnection(callback);
        RethinkDB.table(table).insert(model).run(this.connection, (error, result) => {
            if (error) {
                callback(true, null);
            }
            else {
                let key = result.generated_keys[0];
                this.get(table, key, (error, result) => {
                    if (error) {
                        callback(true, null);
                    }
                    else {
                        callback(false, result);
                    }
                });
            }
        });
    }
    update(table, index, changes, callback) {
        this.handleConnection(callback);
        RethinkDB.table(table).get(index).update(changes).run(this.connection, (error, result) => {
            if (error) {
                callback(false, null);
            }
            else {
                this.get(table, index, (error, result) => {
                    if (error) {
                        callback(true, null);
                    }
                    else {
                        callback(false, result);
                    }
                });
            }
        });
    }
    destroy(table, index, callback) {
        this.handleConnection(callback);
        RethinkDB.table(table).get(index).delete().run(this.connection, (error, result) => {
            if (error) {
                callback(false);
            }
            else {
                callback(true);
            }
        });
    }
}
exports.default = ReQL;
//# sourceMappingURL=ReQL.js.map