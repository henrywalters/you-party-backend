import IQueryable from "../../DataLayer/Interface/IQueryable";
import IResourcePool from "./IResourcePool";

export default interface ISocketRouter {
    routeSocket(socket: SocketIO.Socket, datasource: IQueryable, resourcepool: IResourcePool);
}