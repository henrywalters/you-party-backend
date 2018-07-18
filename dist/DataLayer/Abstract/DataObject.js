"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataObject {
    setDataSource(database) {
        this.DataSource = database;
    }
    isValidPartialObject(validate) {
        let valid = true;
        let cols = Object.keys(validate);
        for (let i = 0; i < cols.length; i++) {
            if (typeof this.Schema[cols[i]] == undefined) {
                valid = false;
                console.log(cols[i] + " is not in the Scema");
            }
            else {
                if (typeof validate[cols[i]] !== this.Schema[cols[i]]) {
                    valid = false;
                    console.log("Column: " + cols[i] + " expected " + this.Schema[cols[i]] + " but got " + validate[cols[i]]);
                }
            }
        }
        return valid;
    }
    isValidObject(validate) {
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
            }
            else {
                if (typeof validate[cols[i]] !== this.Schema[cols[i]]) {
                    valid = false;
                    console.log("Column: " + cols[i] + " expected " + this.Schema[cols[i]] + " but got " + validate[cols[i]]);
                }
            }
        }
        return valid;
    }
    get(index, callback) {
        this.DataSource.get(this.Table, index, (error, res) => {
            callback(error, res);
        });
    }
    getWhere(filter, callback) {
        this.DataSource.getWhere(this.Table, filter, (error, res) => {
            callback(error, res);
        });
    }
    getAll(callback) {
        this.DataSource.getAll(this.Table, (error, res) => { callback(error, res); });
    }
    create(model, callback) {
        if (this.isValidObject(model)) {
            this.DataSource.create(this.Table, model, (error, res) => { callback(error, res); });
        }
        else {
            console.log("Invalid Object expected:");
            console.log(this.Schema);
            callback(false, null);
        }
    }
    update(index, changes, callback) {
        if (this.isValidPartialObject(changes)) {
            this.DataSource.update(this.Table, index, changes, (error, res) => { callback(error, res); });
        }
        else {
            console.log("Invalid Object expected:");
            console.log(this.Schema);
            callback(false, null);
        }
    }
    destroy(index, callback) {
        this.DataSource.destroy(this.Table, index, (success) => { callback(success); });
    }
}
exports.default = DataObject;
//# sourceMappingURL=DataObject.js.map