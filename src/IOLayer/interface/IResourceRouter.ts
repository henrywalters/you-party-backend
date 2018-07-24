import IQueryable from '../../DataLayer/Interface/IQueryable';
import IResourcePool from './IResourcePool';
export default interface IResourceRouter {
    route(app: any, socket: SocketIO.Socket, datasource: IQueryable, resourcepool: IResourcePool);
}