import IDataCallback from "./IDataCallback";

export default interface IQueryable {
    query(query: string, callback: {(error: boolean, res: any): void}): void
    get(table: string, index: string, callback: {(error: boolean, res: Object): void }): void;
    getWhere(table: string, filter: Object, callback: {(error: boolean, res: Array<Object>)})
    getAll(table: string, callback: {(error: boolean, res: Array<Object>): void }): void;
    create(table: string, model: Object, callback: {(error: boolean, res: Object):void}): void;
    createArray(table: string, models: Array<Object>, callback: {(error: boolean, res: Array<Object>): void}): void;
    update(table: string, index: string, changes: Object, callback: {(error: boolean, res: object):void}): void;
    destroy(table: string, index: string, callback: {(success: boolean):void}): void;
}