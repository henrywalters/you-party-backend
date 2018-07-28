"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
class MySQL {
    constructor() {
        this.ConnectionDetails = {
            host: "us-cdbr-iron-east-04.cleardb.net",
            user: "b8d1c717cbeae9",
            password: "50538b85",
            database: "heroku_f49b8ff223a1846"
        };
        this.Connection = mysql.createConnection(this.ConnectionDetails);
        this.Connected = true;
        this.Connection.connect((err) => {
            if (err) {
                console.log(err);
                this.Connected = false;
            }
        });
    }
    connect(database, callback) {
        console.log("Connection handled in constructor. Don't worry about it");
    }
    getDbType() {
        return "MySQL";
    }
    isAlive() {
        return this.Connected;
    }
    query(querystring) {
        this.Connection.query(querystring, (err, row, fields) => {
            console.log(err, row, fields);
        });
    }
    get(table, index, callback) {
    }
    getWhere(table, filter, callback) {
    }
    getAll(table, callback) {
    }
    create(table, model, callback) {
    }
    update(table, index, changes, callback) {
    }
    destroy(table, index, callback) {
    }
}
exports.default = MySQL;
//# sourceMappingURL=MySQL.js.map