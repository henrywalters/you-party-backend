import IDataObject from "../Interface/IDataObject";
import IDatabase from "../Interface/IDatabase";
import IQueryable from "../Interface/IQueryable";
import IResourcePool from '../../IOLayer/interface/IResourcePool';

export default abstract class DataObject implements IDataObject {
    
    abstract Schema: Object;
    abstract Table: string;
    DataSource: IQueryable;
    ResourceType: string = null;
    ResourcePool: IResourcePool = null;

    setDataSource(database: IQueryable) {
        this.DataSource = database;
    }

    setResourcePool(resourcePool: IResourcePool, resourceType: string) {
        this.ResourcePool = resourcePool;
        this.ResourceType = resourceType;
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
            } else {
                if (typeof validate[cols[i]] !== this.Schema[cols[i]]) {
                    valid = false;
                    console.log("Column: " + cols[i] + " expected " + this.Schema[cols[i]] + " but got " + validate[cols[i]]);
                }
            }
        }

        return valid;
    }

    query(query: string, cb: {(error: boolean, res: any): void}) {
        this.DataSource.query(query, (error, res) => {cb(error, res)});
    }

    get(index: string, callback: {(error: boolean, res: Object): void }): void {
        this.DataSource.get(this.Table, index, (error, res) => {
            callback(error, res);
        })
    }

    getAsync(index: string): Promise<Object> {
        return new Promise<Object>(respond => {
            this.get(index, (error, res) => {
                if (error) {
                    throw new Error("Could not find index: " + index);
                } else {
                    respond(res);
                }
            })
        })
    }
    
    getWhere(filter: Object, callback: {(error: boolean, res: Array<Object>): void}): void {
        this.DataSource.getWhere(this.Table, filter, (error, res) => {
            callback(error, res);
        })
    }

    getWhereAsync(filter: Object): Promise<Array<Object>> {
        return new Promise<Array<Object>> (respond => {
            this.getWhere(filter, (error, res) => {
                if (error) {
                    throw new Error("Get Where Failed filter: " + filter);
                } else {
                    respond(res);
                }
            })
        });
    }

    getAll(callback: {(error: boolean, res: Array<Object>): void }): void {
        this.DataSource.getAll(this.Table, (error, res) => {callback(error,res)});
    }

    getAllAsync(): Promise<Array<Object>> {
        return new Promise<Array<Object>> (respond => {
            this.getAll((error, res) => {
                if (error) {
                    throw new Error("Get All Failed");
                } else {
                    respond(res);
                }
            })
        })
    }

    create(model: Object, callback: {(error: boolean, res: Object):void}): void {
        if (this.isValidObject(model)) {
            this.DataSource.create(this.Table, model, (error, res) => {
                if (this.ResourcePool !== null) {
                    this.ResourcePool.createResource(this.ResourceType, res);
                }
                callback(error, res)
            });
            
        } else {
            let schema = {

            };

            Object.keys((key) => {
                schema[key] = typeof model[key]
            })

            console.log("Invalid Object expected:");
            console.log(this.Schema);
            console.log("Instead got:");
            console.log(schema);
            callback(false, null);
        }
    }

    createAsync(model: Object): Promise<Object> {
        return new Promise<Object> (respond => {
            this.create(model, (error, res) => {
                if (error) {
                    throw new Error("Create failed");
                } else {
                    respond(res);
                }
            })
        })
    }

    createArray(models: Array<Object>, callback: {(error: boolean, res: Array<Object>): void}): void {
        let valid = true;
        models.map((model) => {
            if (!this.isValidObject(model)) {
                valid = false;
            }
        })

        if (valid) {
            this.DataSource.createArray(this.Table, models, (error, res) => {
                callback(error, res);
            })
        } else {
            console.log("Invalid Object Detected");
            callback(false, null);
        }
    }

    createArrayAsync(models: Array<Object>): Promise<Array<Object>> {
        return new Promise<Array<Object>> (respond => {
            this.createArray(models, (error, res) => {
                if (error) {
                    throw new Error("Create Array Failed");
                } else {
                    respond(res);
                }
            })
        })
    }

    update(index: string, changes: Object, callback: {(error: boolean, res: object):void}): void {
        if (this.isValidPartialObject(changes)) {
            this.DataSource.update(this.Table, index, changes, (error, res) => {
                if (this.ResourcePool !== null) {
                    this.ResourcePool.updateResource(this.ResourceType, res);
                }
                callback(error, res)
            });
        } else {
            console.log("Invalid Object expected:");
            console.log(this.Schema);
            callback(false, null);
        }
    }

    updateAsync(index: string, changes: Object): Promise<Object> {
        return new Promise<Object> (respond => {
            this.update(index, changes, (error, res) => {
                if (error) {
                    throw new Error("Update failed");
                } else {
                    respond(res);
                }
            })
        })
    }

    destroy(index: string, callback: {(success: boolean):void}): void {
        this.DataSource.destroy(this.Table, index, (success) => {
            if (this.ResourcePool !== null) {
                this.ResourcePool.destroyResource(this.ResourceType, {
                    id: index
                });
            }
            callback(success)
        });
    }

    destroyAsync(index: string): Promise<void> {
        return new Promise<void> (respond => {
            this.destroy(index, (success) => {
                respond();
            })
        })
    }
}