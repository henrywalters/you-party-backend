import * as SocketIO from 'socket.io';

export default interface IResourcePool {
    joinPool(resourceType: string, socket: SocketIO.Socket): void;
    createResource(resourceType: string, resource: Object): void;
    updateResource(resourceType: string, resource: Object): void;
    destroyResource(resourceType: string, resource: Object): void;
    joinSubPool(resourceType: string, subIndex: string, socket: SocketIO.Socket) : void;
    createPool(resourceType: string): void;
    createSubPool(resourceType: string, subIndex: string): void;
    createSubResource(resourceType: string, subIndex: string, resource: Object) : void;
    updateSubResource(resourceType: string, subIndex: string, resource: Object) : void;
    destroySubResource(resourceType: string, subIndex: string, resource: Object) : void;
}