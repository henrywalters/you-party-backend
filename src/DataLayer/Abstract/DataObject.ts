import IDataObject from "../Interface/IDataObject";
import IDatabase from "../Interface/IDatabase";
import IQueryable from "../Interface/IQueryable";

export default abstract class DataObject implements IDataObject {
    
    abstract Schema: Object;
    abstract Table: string;
    DataSource: IQueryable;

    setDataSource(database: IQueryable) {
        this.DataSource = database;
    }

    isValidPartialObject(validate: Object): boolean {
        let valid = true;

        let cols = Object.keys(validate);

        for (let i = 0; i < cols.length; i++) {
            if (typeof this.Schema[cols[i]] == undefined) {
                valid = false;
                console.log(cols[i] + " is not in the Scema");
            } else {
                if (typeof validate[cols[i]] !== this.Schema[cols[i]]) {
                    valid = false;
                    console.log("Column: " + cols[i] + " expected " + this.Schema[cols[i]] + " but got " + validate[cols[i]]);
                }
            }
        }

        return valid;
    }

    isValidObject(validate: Object): boolean {
        let valid = true;

        let cols = Object.keys(validate);

        if (cols.length !== Object.keys(this.Schema).length) {
            console.log("Schema doesn't match object length");
            return false;
        }

        for (let i = 0; i < cols.length; i++) {
            if (typeof this.Schema[cols[i]] == undefined) {
                valid = false;
                console.log(cols[i] + " is not in the Scema");
            } else {
                if (typeof validate[cols[i]] !== this.Schema[cols[i]]) {
                    valid = false;
                    console.log("Column: " + cols[i] + " expected " + this.Schema[cols[i]] + " but got " + validate[cols[i]]);
                }
            }
        }

        return valid;
    }

    get(index: string, callback: {(error: boolean, res: Object): void }): void {
        this.DataSource.get(this.Table, index, (error, res) => {
            callback(error, res);
        })
    }
    
    getWhere(filter: Object, callback: {(error: boolean, res: Array<Object>): void}): void {
        this.DataSource.getWhere(this.Table, filter, (error, res) => {
            callback(error, res);
        })
    }

    getAll(callback: {(error: boolean, res: Array<Object>): void }): void {
        this.DataSource.getAll(this.Table, (error, res) => {callback(error,res)});
    }

    create(model: Object, callback: {(error: boolean, res: Object):void}): void {
        if (this.isValidObject(model)) {
            this.DataSource.create(this.Table, model, (error, res) => {callback(error, res)});
        } else {
            console.log("Invalid Object expected:");
            console.log(this.Schema);
            callback(false, null);
        }
    }

    update(index: string, changes: Object, callback: {(error: boolean, res: object):void}): void {
        if (this.isValidPartialObject(changes)) {
            this.DataSource.update(this.Table, index, changes, (error, res) => {callback(error, res)});
        } else {
            console.log("Invalid Object expected:");
            console.log(this.Schema);
            callback(false, null);
        }
    }

    destroy(index: string, callback: {(success: boolean):void}): void {
        this.DataSource.destroy(this.Table, index, (success) => {callback(success)});
    }
}