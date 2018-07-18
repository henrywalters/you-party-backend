import IDataCallback from './IDataCallback';
export default interface IDatabase {
    connect(database: string, callback?: IDataCallback);
    getDbType(): String;
    isAlive(): boolean;
}