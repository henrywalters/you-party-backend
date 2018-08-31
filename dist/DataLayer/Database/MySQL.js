"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
const UUID = require("uuid/v4");
const ConfigHelper_1 = require("../../Helpers/ConfigHelper");
class MySQL {
    constructor() {
        /*this.ConnectionDetails = {
            host: "us-cdbr-iron-east-04.cleardb.net",
            user: "b8d1c717cbeae9",
            password: "50538b85",
            database: "heroku_f49b8ff223a1846"
        }
        */
        let config = ConfigHelper_1.default.get("database-production");
        this.ConnectionDetails = {
            host: config['host'],
            user: config['user'],
            password: config['password'],
            database: config['database']
        };
        this.connect("MySQL");
    }
    connect(database, callback) {
        this.Connection = mysql.createConnection(this.ConnectionDetails);
        this.Connected = true;
        this.Connection.connect((err) => {
            if (err) {
                console.log(err);
                this.Connected = false;
                setTimeout(this.connect("MySQL"), 2000);
            }
        });
        this.Connection.on('error', (err) => {
            console.log('db error', err);
            if (err.code === "PROTOCOL_CONNECTION_LOST") {
                this.connect("MySQL");
            }
        });
    }
    getDbType() {
        return "MySQL";
    }
    isAlive() {
        return this.Connected;
    }
    query(querystring, cb) {
        this.Connection.query(querystring, (err, row, fields) => {
            if (err) {
                throw new Error(err.toString());
                cb(true, null);
            }
            else {
                cb(false, row);
            }
        });
    }
    get(table, index, callback) {
        let sql = "SELECT * FROM ?? WHERE ?? = ?";
        let inserts = [table, 'id', index];
        sql = mysql.format(sql, inserts);
        this.Connection.query(sql, (error, row, fields) => {
            if (error) {
                callback(true, null);
            }
            else {
                if (row.length === 0) {
                    callback(true, null);
                }
                else {
                    callback(false, row[0]);
                }
            }
        });
    }
    getWhere(table, filter, callback) {
        let sql = "SELECT * FROM ?? WHERE ";
        let inserts = [table];
        let sqlQs = Object.keys(filter).map((col) => {
            inserts.push(col);
            inserts.push(filter[col]);
            return "?? = ?";
        });
        sql += sqlQs.join(" AND ");
        sql = mysql.format(sql, inserts);
        this.Connection.query(sql, (error, rows, fields) => {
            if (error) {
                callback(true, null);
            }
            else {
                callback(false, rows);
            }
        });
    }
    getAll(table, callback) {
        let sql = "SELECT * FROM ??";
        let inserts = [table];
        sql = mysql.format(sql, inserts);
        this.Connection.query(sql, (error, row, fields) => {
            if (error) {
                throw new Error(error.toString());
                callback(true, null);
            }
            else {
                callback(false, row);
            }
        });
    }
    create(table, model, callback) {
        let id = UUID();
        model["id"] = id;
        let keys = Object.keys(model);
        let inserts = [table];
        let colQs = keys.map((x) => {
            inserts.push(x);
            return "??";
        });
        let valQs = keys.map((x) => {
            inserts.push(model[x]);
            return "?";
        });
        let sql = "INSERT INTO ?? (" + colQs.join(", ") + ") VALUES (" + valQs.join(", ") + ")";
        sql = mysql.format(sql, inserts);
        this.Connection.query(sql, (error, rows, fields) => {
            if (error) {
                throw new Error(error.toString());
                callback(true, null);
            }
            else {
                callback(false, model);
            }
        });
    }
    createArray(table, models, cb) {
        if (models.length === 0) {
            cb(false, null);
        }
        else {
            models = models.map((model) => {
                model['id'] = UUID();
                return model;
            });
            let keys = Object.keys(models[0]);
            let inserts = [table];
            let colQs = keys.map((x) => {
                inserts.push(x);
                return "??";
            });
            let valQs = models.map((model) => {
                let subValQs = keys.map((x) => {
                    inserts.push(model[x]);
                    return "?";
                }).join(", ");
                return " ( " + subValQs + " ) ";
            });
            let sql = "INSERT INTO ?? (" + colQs.join(", ") + ") VALUES " + valQs.join(", ");
            sql = mysql.format(sql, inserts);
            this.Connection.query(sql, (error, rows, fields) => {
                if (error !== null) {
                    cb(true, models);
                }
                else {
                    cb(false, null);
                }
            });
        }
    }
    update(table, index, changes, callback) {
        let sql = "UPDATE ?? SET ";
        let inserts = [table];
        sql += Object.keys(changes).map((col) => {
            inserts.push(col, changes[col]);
            return " ?? = ? ";
        }).join(", ");
        sql += " WHERE ?? = ?";
        inserts.push('id', index);
        sql = mysql.format(sql, inserts);
        this.Connection.query(sql, (error, row, fields) => {
            if (error) {
                callback(true, null);
            }
            else {
                callback(false, row);
            }
        });
    }
    destroy(table, index, callback) {
        let sql = "DELETE FROM ?? WHERE ?? = ?";
        let inserts = [table, 'id', index];
        sql = mysql.format(sql, inserts);
        this.Connection.query(sql, (error, rows, fields) => {
            if (error) {
                callback(false);
            }
            else {
                callback(true);
            }
        });
    }
}
exports.default = MySQL;
//# sourceMappingURL=MySQL.js.map