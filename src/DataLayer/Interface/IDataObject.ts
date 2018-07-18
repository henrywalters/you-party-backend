
import IQueryable from './IQueryable';

export default interface IData {
    setDataSource(database: IQueryable);
    Schema: Object;
}