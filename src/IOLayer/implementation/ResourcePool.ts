import IResourcePool from '../interface/IResourcePool';
import * as SocketIO from 'socket.io';
import * as Events from 'events';
import { RankTypes, ISortable } from '../../Helpers/RankHelper';
import RankHelper from '../../Helpers/RankHelper';

interface IPool {
    Type: string;
    Pool: Array<SocketIO.Socket>
    SubPools: {
        [key: string] : ISubPool
    },
    SubListPools: {
        [key: string]: ISubListPool
    }
}

interface ISubPool {
    SubIndex: string,
    Pool: Array<SocketIO.Socket>
}

interface ISubListPool {
    SubIndex: string,
    Pool: Array<SocketIO.Socket>,
    List: Array<ISortable>
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
            if (!this.poolExists(this.ResourceTypes[i])) {
                this.Pools[this.ResourceTypes[i]] = {
                    Type: this.ResourceTypes[i],
                    Pool: [],
                    SubPools: {

                    },
                    SubListPools: {

                    }
                }
            }
        }
    }

    private poolExists(resourceType: string): boolean {
        if (typeof this.Pools[resourceType] != 'undefined' ) {
            return true;
        } else {
            return false;
        }
    }

    private subPoolExists(resourceType: string, subIndex: string) : boolean {
        if (this.poolExists(resourceType)) {
            if (typeof this.Pools[resourceType].SubPools[subIndex] !== 'undefined') {
                return true;
            }
        }
        return false;
    }

    private subListPoolExists(resourceType: string, subIndex: string) : boolean {
        if (this.poolExists(resourceType)) {
            if (typeof this.Pools[resourceType].SubListPools[subIndex] !== 'undefined') {
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

    private getSubListPool(resourceType: string, subIndex: string) {
        return this.Pools[resourceType].SubListPools[subIndex];
    }

    public createPool(resourceType: string): void {
        if (!this.poolExists(resourceType)) { 
            this.Pools[resourceType] = {
                Type: resourceType,
                Pool: [],
                SubPools: {},
                SubListPools: {}
            }

            console.log("Creating Pool: " + resourceType);
        }
    }

    public createSubPool(resourceType: string, subIndex: string) {
        if (!this.getSubPool(resourceType, subIndex)) {
            this.Pools[resourceType].SubPools[subIndex] = {
                SubIndex: subIndex,
                Pool: []
            }

            console.log("Created Pool: " + resourceType + " sub: " + subIndex);
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

    createSubListPool<T extends ISortable>(resourceType: string, subIndex: string, rankType: RankTypes, initialList: Array<T> = []): void {
        if (!this.getSubListPool(resourceType, subIndex)) {
            this.Pools[resourceType].SubListPools[subIndex] = {
                SubIndex: subIndex,
                Pool: [],
                List: RankHelper.Sort(RankTypes["Wilson Lower Bound"], initialList)
            }

            console.log("Created Pool: " + resourceType + " sub: " + subIndex);
        }
    }

    joinSubListPool<T extends ISortable>(resourceType: string, subIndex: string, socket: SocketIO.Socket): void {
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
        } else {
            throw new Error("Resource Type: " + resourceType + " does not exist. Therefore resource can not change");
        }
    }

    private subResourceChange(resourceType: string, subIndex: string, changeType: string, resource: Object) {
    
        if (this.subPoolExists(resourceType, subIndex)) {
            let pool = this.getSubPool(resourceType, subIndex);
            console.log(pool);
            console.log("Changing: " + resourceType + "-" + subIndex + " by " + changeType);
            resource["changeType"] = changeType;
            resource['subIndex'] = subIndex;
            for (let i = 0; i < pool.Pool.length; i++) { 
                pool.Pool[i].emit(resourceType, resource);
            }
        } else {
            throw new Error("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
        }
    }

    private subListResourceChange<T>(resourceType: string, subIndex: string, changeType: string, index: number, resource: Object): void {
        if (this.subListPoolExists(resourceType, subIndex)) {
            let pool = this.getSubListPool(resourceType, subIndex);
            resource["changeType"] = changeType;
            resource['subIndex'] = subIndex;
            resource['index'] = index;

            for (let i = 0; i < pool.Pool.length; i++) {
                pool.Pool[i].emit(resourceType, resource);
            }
            console.log("Added Resource: ", resource);
        } else {
            throw new Error("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
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

    
    insertSubListResource<T extends ISortable>(resourceType: string, subIndex: string, resource: T): void {
        if (this.subListPoolExists(resourceType, subIndex)) {
            let pool = this.getSubListPool(resourceType, subIndex);

            let index = RankHelper.BinarySearch(RankTypes["Wilson Lower Bound"], pool.List, resource);

            pool.List.splice(index, 0, resource);

            this.subListResourceChange(resourceType, subIndex, "insert", index, resource);
        } else {
            throw new Error("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
        }
    }

    removeSubListResource<T extends ISortable>(resourceType: string, subIndex: string, index: number): void {
        if (this.subListPoolExists(resourceType, subIndex)) {
            let pool = this.getSubListPool(resourceType, subIndex);
            pool.List.splice(index, 1);
        } else {
            throw new Error("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
        }
    }

    swapSubListResource<T extends ISortable>(resourceType: string, subIndex: string, index: number): void {
        if (this.subListPoolExists(resourceType, subIndex)) {
            let pool = this.getSubListPool(resourceType, subIndex);
            let resource = pool.List[index];
            this.removeSubListResource(resourceType, subIndex, index);
            this.insertSubListResource(resourceType, subIndex, resource);
        } else {
            throw new Error("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
        }
    }
}