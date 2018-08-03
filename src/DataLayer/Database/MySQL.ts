import * as mysql from 'mysql';
import IDatabase from '../Interface/IDatabase';
import IDataCallback from '../Interface/IDataCallback';
import IQueryable from '../Interface/IQueryable';
import * as UUID from 'uuid/v4';


interface IConnection {
    host: string;
    user: string;
    password: string;
    database: string;
}

export default class MySQL implements IDatabase, IQueryable {
    
    ConnectionDetails: IConnection;
    Connection: mysql.Connection;
    Connected: boolean;
    
    constructor() {
        this.ConnectionDetails = {
            host: "us-cdbr-iron-east-04.cleardb.net",
            user: "b8d1c717cbeae9",
            password: "50538b85",
            database: "heroku_f49b8ff223a1846"
        }
        this.connect("MySQL");
    }

    connect(database: string, callback?: IDataCallback) {
        this.Connection = mysql.createConnection(this.ConnectionDetails);

        this.Connected = true;

        this.Connection.connect((err) => {
            if (err) {
                console.log(err)
                this.Connected = false;
                setTimeout(this.connect("MySQL"), 2000);
            }
        })

        this.Connection.on('error', (err) => {
            console.log('db error', err);
            if (err.code === "PROTOCOL_CONNECTION_LOST") {
                this.connect("MySQL");
            }
        })
    }

    getDbType(): String {
        return "MySQL";
    }

    isAlive(): boolean {
        return this.Connected;
    }
    
    query(querystring: string, cb: {(error: boolean, result: any): void}) {
        this.Connection.query(querystring, (err, row, fields) => {
            console.log(err, row, fields);
            if (err) {
                cb(true, null);
            } else {
                cb(row, fields);
            }
        });
    }

    get(table: string, index: string, callback: {(error: boolean, res: Object): void }): void {
        let sql = "SELECT * FROM ?? WHERE ?? = ?";
        let inserts = [table, 'id', index];
        sql = mysql.format(sql, inserts);
        this.Connection.query(sql, (error, row, fields) => {
            if (error) {
                callback(true, null);
            } else {
                if (row.length === 0) {
                    callback(true, null);
                } else {
                    callback(false, row[0]);
                }
            }
        })
    }

    

    getWhere(table: string, filter: Object, callback: {(error: boolean, res: Array<Object>)}) {
        let sql = "SELECT * FROM ?? WHERE ";
        let inserts = [table];
        
        let sqlQs = Object.keys(filter).map((col) => {
            inserts.push(col);
            inserts.push(filter[col]);
            return "?? = ?";    
        })

        sql += sqlQs.join(" AND ");

        sql = mysql.format(sql, inserts);

        this.Connection.query(sql, (error, rows, fields) => {
            if (error) {
                callback(true, null);
            } else {
                callback(false, rows);
            }
        })
    }

    getAll(table: string, callback: {(error: boolean, res: Array<Object>): void }): void {
        let sql = "SELECT * FROM ??";
        let inserts = [table];
        sql = mysql.format(sql, inserts);
        this.Connection.query(sql, (error, row, fields) => {
            if (error) {
                callback(true, null);
            } else {
                callback(false, row);
            }
        })
    }

    create(table: string, model: Object, callback: {(error: boolean, res: Object):void}): void {
        let id = UUID();
        model["id"] = id;

        let keys = Object.keys(model);
        
        let inserts = [table];

        let colQs = keys.map((x) => {
            inserts.push(x);
            return "??"
        });
        let valQs = keys.map((x) => {
            inserts.push(model[x]);
            return "?"
        });

        let sql = "INSERT INTO ?? (" + colQs.join(", ") + ") VALUES (" + valQs.join(", ") + ")";
        sql = mysql.format(sql, inserts);

        console.log(sql);

        this.Connection.query(sql, (error, rows, fields) => {
            if (error) {
                console.log(error);
                callback(true, null);
            } else {
                callback(false, model);
            }
        })
    }

    update(table: string, index: string, changes: Object, callback: {(error: boolean, res: object):void}): void {
        let sql = "UPDATE ?? SET ";
        let inserts = [table];
        sql += Object.keys(changes).map((col) => {
            inserts.push(col, changes[col]);
            return " ?? = ? "
        }).join(", ");

        sql += " WHERE ?? = ?";

        inserts.push('id', index);

        sql = mysql.format(sql, inserts);

        this.Connection.query(sql, (error, row, fields) => {
            if (error) {
                callback(true, null);
            } else {
                callback(false, row);
            }
        })
    }

    destroy(table: string, index: string, callback: {(error: boolean):void}): void {
        let sql = "DELETE FROM ?? WHERE ?? = ?";
        let inserts = [table, 'id', index];

        sql = mysql.format(sql, inserts);

        this.Connection.query(sql, (error, rows, fields) => {
            if (error) {
                callback(false);
            } else {
                callback(true);
            }
        })
    }
}