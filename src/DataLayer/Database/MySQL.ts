import * as mysql from 'mysql';
import IDatabase from '../Interface/IDatabase';
import IDataCallback from '../Interface/IDataCallback';
import IQueryable from '../Interface/IQueryable';


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

        this.Connection = mysql.createConnection(this.ConnectionDetails);

        this.Connected = true;

        this.Connection.connect((err) => {
            if (err) {
                console.log(err)
                this.Connected = false;
            }
        })
    }

    connect(database: string, callback?: IDataCallback) {
        console.log("Connection handled in constructor. Don't worry about it");
    }

    getDbType(): String {
        return "MySQL";
    }

    isAlive(): boolean {
        return this.Connected;
    }

    query(querystring: string) {
        this.Connection.query(querystring, (err, row, fields) => {
            console.log(err, row, fields);
        });
    }

    get(table: string, index: string, callback: {(error: boolean, res: Object): void }): void {

    }
    getWhere(table: string, filter: Object, callback: {(error: boolean, res: Array<Object>)}) {

    }
    getAll(table: string, callback: {(error: boolean, res: Array<Object>): void }): void {

    }
    create(table: string, model: Object, callback: {(error: boolean, res: Object):void}): void {

    }
    update(table: string, index: string, changes: Object, callback: {(error: boolean, res: object):void}): void {

    }
    destroy(table: string, index: string, callback: {(success: boolean):void}): void {

    }
}