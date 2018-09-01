"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataObject {
    constructor() {
        this.ResourceType = null;
        this.ResourcePool = null;
    }
    setDataSource(database) {
        this.DataSource = database;
    }
    setResourcePool(resourcePool, resourceType) {
        this.ResourcePool = resourcePool;
        this.ResourceType = resourceType;
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
            if (typeof validate['id'] == 'undefined') { //so if there is no ID present, don't throw error.
                if (cols.length - 1 !== Object.keys(this.Schema).length) {
                    return false;
                }
            }
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
    query(query, cb) {
        this.DataSource.query(query, (error, res) => { cb(error, res); });
    }
    get(index, callback) {
        this.DataSource.get(this.Table, index, (error, res) => {
            callback(error, res);
        });
    }
    getAsync(index) {
        return new Promise(respond => {
            this.get(index, (error, res) => {
                if (error) {
                    throw new Error("Could not find index: " + index);
                }
                else {
                    respond(res);
                }
            });
        });
    }
    getWhere(filter, callback) {
        this.DataSource.getWhere(this.Table, filter, (error, res) => {
            callback(error, res);
        });
    }
    getWhereAsync(filter) {
        return new Promise(respond => {
            this.getWhere(filter, (error, res) => {
                if (error) {
                    throw new Error("Get Where Failed filter: " + filter);
                }
                else {
                    respond(res);
                }
            });
        });
    }
    getAll(callback) {
        this.DataSource.getAll(this.Table, (error, res) => { callback(error, res); });
    }
    getAllAsync() {
        return new Promise(respond => {
            this.getAll((error, res) => {
                if (error) {
                    throw new Error("Get All Failed");
                }
                else {
                    respond(res);
                }
            });
        });
    }
    create(model, callback) {
        if (this.isValidObject(model)) {
            this.DataSource.create(this.Table, model, (error, res) => {
                if (this.ResourcePool !== null) {
                    this.ResourcePool.createResource(this.ResourceType, res);
                }
                callback(error, res);
            });
        }
        else {
            let schema = {};
            Object.keys((key) => {
                schema[key] = typeof model[key];
            });
            console.log("Invalid Object expected:");
            console.log(this.Schema);
            console.log("Instead got:");
            console.log(schema);
            callback(false, null);
        }
    }
    createAsync(model) {
        return new Promise(respond => {
            this.create(model, (error, res) => {
                if (error) {
                    throw new Error("Create failed");
                }
                else {
                    respond(res);
                }
            });
        });
    }
    createArray(models, callback) {
        let valid = true;
        models.map((model) => {
            if (!this.isValidObject(model)) {
                valid = false;
            }
        });
        if (valid) {
            this.DataSource.createArray(this.Table, models, (error, res) => {
                callback(error, res);
            });
        }
        else {
            console.log("Invalid Object Detected");
            callback(false, null);
        }
    }
    createArrayAsync(models) {
        return new Promise(respond => {
            this.createArray(models, (error, res) => {
                if (error) {
                    throw new Error("Create Array Failed");
                }
                else {
                    respond(res);
                }
            });
        });
    }
    update(index, changes, callback) {
        if (this.isValidPartialObject(changes)) {
            this.DataSource.update(this.Table, index, changes, (error, res) => {
                if (this.ResourcePool !== null) {
                    this.ResourcePool.updateResource(this.ResourceType, res);
                }
                callback(error, res);
            });
        }
        else {
            console.log("Invalid Object expected:");
            console.log(this.Schema);
            callback(false, null);
        }
    }
    updateAsync(index, changes) {
        return new Promise(respond => {
            this.update(index, changes, (error, res) => {
                if (error) {
                    throw new Error("Update failed");
                }
                else {
                    respond(res);
                }
            });
        });
    }
    destroy(index, callback) {
        this.DataSource.destroy(this.Table, index, (success) => {
            if (this.ResourcePool !== null) {
                this.ResourcePool.destroyResource(this.ResourceType, {
                    id: index
                });
            }
            callback(success);
        });
    }
    destroyAsync(index) {
        return new Promise(respond => {
            this.destroy(index, (success) => {
                respond();
            });
        });
    }
}
exports.default = DataObject;
//# sourceMappingURL=DataObject.js.map