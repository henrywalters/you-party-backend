import IQueryable from '../../DataLayer/Interface/IQueryable';
export default interface IResourceRouter {
    route(app: any, datasource: IQueryable);
}