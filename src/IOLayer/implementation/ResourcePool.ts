import IResourcePool from '../interface/IResourcePool';
import * as SocketIO from 'socket.io';
import * as Events from 'events';

interface IPool {
    Type: string;
    Pool: Array<SocketIO.Socket>
    SubPools: {
        [key: string] : ISubPool
    }
}

interface ISubPool {
    SubIndex: string,
    Pool: Array<SocketIO.Socket>
}

export default class ResourcePool implements IResourcePool {

    //a nice hash table of resources

    private Pools: {
        [resourceType:string]: IPool
    };

    private ResourceTypes: Array<string>;
    
    constructor(resourceTypes: Array<string>) {
        this.Pools = {};
        this.ResourceTypes = resourceTypes;
        for (let i = 0; i < this.ResourceTypes.length; i++) {
            if (this.poolExists(this.ResourceTypes[i])) {
                this.Pools[this.ResourceTypes[i]] = {
                    Type: this.ResourceTypes[i],
                    Pool: [],
                    SubPools: {

                    }
                }
            }
        }
    }

    private poolExists(resourceType: string): boolean {
        if (typeof this.Pools[resourceType] != undefined ) {
            return true;
        } else {
            return false;
        }
    }

    private subPoolExists(resourceType: string, subIndex: string) : boolean {
        if (this.poolExists(resourceType)) {
            if (typeof this.Pools[resourceType].SubPools[subIndex] !== undefined) {
                return true;
            }
        }
        return false;
    }

    private getPool(resourceType: string) {
        return this.Pools[resourceType];
    }

    private getSubPool(resourceType: string, subIndex: string) {
        return this.Pools[resourceType].SubPools[subIndex];
    }

    public createSubPool(resourceType: string, subIndex: string) {
        if (!this.getSubPool(resourceType, subIndex)) {
            this.Pools[resourceType].SubPools[subIndex] = {
                SubIndex: subIndex,
                Pool: []
            }
        }
    }

    public joinSubPool(resourceType: string, subIndex: string, socket: SocketIO.Socket) {
        if (this.subPoolExists(resourceType, subIndex)) {
            this.getSubPool(resourceType, subIndex).Pool.push(socket);
            console.log(this.Pools[resourceType].SubPools[subIndex].Pool.length + " Members in Sub Resource Pool: " + resourceType + " - " + subIndex);
        }
    }

    public joinPool(resourceType: string, socket: SocketIO.Socket): void {
        let pool = this.getPool(resourceType);
        pool.Pool.push(socket);
        console.log(this.Pools[resourceType].Pool.length + " Members in Resource Pool: " + resourceType);
    }

    private resourceChange(resourceType: string, changeType: string, resource: Object) {
        let pool = this.getPool(resourceType);
        if (typeof pool !== undefined) {
            for (let i = 0; i < pool.Pool.length; i++) {
                resource["changeType"] = changeType;
                console.log("Changing: " + resourceType + " by " + changeType);
                pool.Pool[i].emit(resourceType, resource);
            }
        }
    }

    private subResourceChange(resourceType: string, subIndex: string, changeType: string, resource: Object) {
        if (this.subPoolExists(resourceType, subIndex)) {
            let pool = this.getSubPool(resourceType, subIndex);
            for (let i = 0; i < pool.Pool.length; i++) {
                resource["changeType"] = changeType;
                console.log("Changing: " + resourceType + "-" + subIndex + " by " + changeType);
                pool.Pool[i].emit(resourceType, resource);
            }
        }
    }

    public createResource(resourceType: string, resource: Object) {
        this.resourceChange(resourceType, "create", resource);
    }

    public updateResource(resourceType: string, resource: Object) {
        this.resourceChange(resourceType, "update", resource);
    }

    public destroyResource(resourceType: string, resource: Object) {
        this.resourceChange(resourceType, "destroy", resource);
    }

    public createSubResource(resourceType: string, subIndex: string, resource: Object) {
        this.subResourceChange(resourceType, subIndex, "create", resource);
    }

    public updateSubResource(resourceType: string, subIndex: string, resource: Object) {
        this.subResourceChange(resourceType, subIndex, "update", resource);
    }

    public destroySubResource(resourceType: string, subIndex: string, resource: Object) {
        this.subResourceChange(resourceType, subIndex, "destroy", resource);
    }
}