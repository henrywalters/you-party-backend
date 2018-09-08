import * as SocketIO from 'socket.io';
import { RankTypes, ISortable } from '../../Helpers/RankHelper';
import { ISubPool } from '../implementation/ResourcePool';

export default interface IResourcePool {
    joinPool(resourceType: string, socket: SocketIO.Socket): void;
    createResource(resourceType: string, resource: Object): void;
    updateResource(resourceType: string, resource: Object): void;
    destroyResource(resourceType: string, resource: Object): void;
    joinSubPool(resourceType: string, subIndex: string, socket: SocketIO.Socket) : void;
    getSubPool(resourceType: string, subIndex: string): ISubPool;
    createPool(resourceType: string): void;
    createSubPool(resourceType: string, subIndex: string): void;
    createSubResource(resourceType: string, subIndex: string, resource: Object) : void;
    updateSubResource(resourceType: string, subIndex: string, resource: Object) : void;
    destroySubResource(resourceType: string, subIndex: string, resource: Object) : void;
    createSubListPool<T extends ISortable>(resourceType: string, subIndex: string, rankType: RankTypes, initialList: Array<T>): void;
    joinSubListPool<T extends ISortable>(resourceType: string, subIndex: string, socket: SocketIO.Socket): void;
    insertSubListResource<T extends ISortable>(resourceType: string, subIndex: string, resource: T): ISortable;
    removeSubListResource<T extends ISortable>(resourceType: string, subIndex: string, resource: T): void;
    swapSubListResource<T extends ISortable>(resourceType: string, subIndex: string, oldResource: T, newResource: T): Promise<ISortable>
    getSubListResource(resourceType: string, subIndex: string, index: number): ISortable;
}