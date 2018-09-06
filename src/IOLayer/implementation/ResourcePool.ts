import IResourcePool from '../interface/IResourcePool';
import * as SocketIO from 'socket.io';
import * as Events from 'events';
import { RankTypes, ISortable } from '../../Helpers/RankHelper';
import RankHelper from '../../Helpers/RankHelper';
import ResourceQueue from './ResourceQueue';
import IExecutable from '../interface/IExecutable';
import { exec } from 'child_process';

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
    List: Array<ISortable>,
    Queue: Array<IQueueItem>,
    IsHandlingQueue: boolean
}

interface IQueueItem {
    Executables: Array<any>
    Callback: any;
}

class SubListExecutionFunction implements IExecutable {
    parameters: Object;
    function: any;
    
    constructor(func: any, parameters: Object) {
        this.parameters = parameters;
        this.function = func;
    }

    execute() {
        return this.function;
    }
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

    displayList(list: Array<ISortable>): string {
        let str = list.map(item => {
            return item.downvotes + " down - " + item.upvotes + " up - ID: " + item.id + " added at " + item.timeAdded;
        })
        let joined = str.join("\n");
        
        return joined;
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
                List: RankHelper.Sort(RankTypes["Wilson Lower Bound"], initialList),
                Queue: [],
                IsHandlingQueue: false
            }

            console.log("Created Pool: " + resourceType + " sub: " + subIndex);
            console.log(this.Pools[resourceType].SubListPools[subIndex]);
        }
    }

    joinSubListPool<T extends ISortable>(resourceType: string, subIndex: string, socket: SocketIO.Socket): void {
        let pool = this.getSubListPool(resourceType, subIndex);
        pool.Pool.push(socket);
        console.log(this.Pools[resourceType].Pool.length + " Members in Sub List Resource Pool: " + resourceType + " - " + subIndex);
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
            resource['changeTime'] = Date.now();

            console.log("SHOULD BE EMITTING: " + resourceType + " sub index: " + subIndex);

            console.log(pool.Pool.length + " members in channel");

            for (let i = 0; i < pool.Pool.length; i++) {
                pool.Pool[i].emit(resourceType, resource);
            }
            
            console.log(changeType + " " + resourceType + " : " + resource);
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

    addToQueue(resourceType: string, subIndex: string, queueItem: IQueueItem) {
        if (this.subListPoolExists(resourceType, subIndex)) {
            let pool = this.getSubListPool(resourceType, subIndex);
            pool.Queue.push(queueItem);
            this.executeQueue(resourceType, subIndex);  
        }
    }

    executeQueue(resourceType: string, subIndex: string, context: any = false){

        let that = this;

        if (context) {
            that = context;
        }

        if (that.subListPoolExists(resourceType, subIndex)) {
            let pool = that.getSubListPool(resourceType, subIndex);

            console.log("Got pool")

            if (!pool.IsHandlingQueue) {
                console.log("Handling Queue");
                pool.IsHandlingQueue = true;
                console.log("Queue Length: " + pool.Queue.length);
                if (pool.Queue.length === 0) {
                    pool.IsHandlingQueue = false;
                } else {
                    let queueItem = pool.Queue.shift();
                    if (pool.Queue.length === 0) {
                        pool.IsHandlingQueue = false;
                    }
                    this.executeQueueItem(resourceType, subIndex, queueItem)
                        .then(executionResults => {
                            console.log("Executing Queue Item");
                            
                            queueItem.Callback(executionResults);
                            that = this;
                            if (pool.IsHandlingQueue) {
                                that.executeQueue(resourceType, subIndex, that);
                            }
                        });
                }
            } else {
                console.log("Pool is already being handled");
            }
        }
    }

    executeQueueItem(resourceType: string, subIndex: string, queueItem: IQueueItem): Promise<Array<any>> {
        return new Promise<Array<any>>(respond => {

            //Map the list of syncronous functions to a list of callback results.
            //Since these are being queued, the result will therefore be async.
            
            let callbackResults = [];

            queueItem.Executables.map(ex => {
                ex.execute = ex.execute.bind(this);
                let p = ex.parameters;
                console.log(ex.execute);
                callbackResults.push(ex.execute(p.resourceType, p.subIndex, p.resource));
            })

            respond(callbackResults);
        });
    }

    inList<T extends ISortable>(list: Array<T>, item: T): boolean {
        for (let i = 0; i < list.length; i++) {
            if (item.id === list[i].id) {
                console.log("Item: ", item, " in list already");
                return true;
            } 
        }

        return false;
    }

    
    insertSubListResource<T extends ISortable>(resourceType: string, subIndex: string, resource: T): ISortable {
        if (this.subListPoolExists(resourceType, subIndex)) {
            let pool = this.getSubListPool(resourceType, subIndex);
            let index = RankHelper.BinarySearch(RankTypes["Wilson Lower Bound"], pool.List, resource);

            if (this.inList(pool.List, resource)) {
                throw new Error("Item already in list");
            }
        
            pool.List.splice(index, 0, resource);

            this.subListResourceChange(resourceType, subIndex, "insert", index, resource);
            

            return pool.List[index];
        } else {
            throw new Error("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
        }
    }

    removeSubListResource<T extends ISortable>(resourceType: string, subIndex: string, resource: T): void {
        if (this.subListPoolExists(resourceType, subIndex)) {
            let pool = this.getSubListPool(resourceType, subIndex);
            let index = RankHelper.BinaryExactSearch(RankTypes["Wilson Lower Bound"], pool.List, resource);
            if (index >= pool.List.length) {
                throw new Error("INDEX OUT OF LIST BOUNDS");
            }

            if (index === -1) {
                throw new Error("List item was not in list - nothing happening");
            } else {
                pool.List.splice(index, 1);
                this.subListResourceChange(resourceType, subIndex, "remove", index, resource);
            }
        } else {
            console.log("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change")
            throw new Error("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
        }
    }

    async swapSubListResource<T extends ISortable>(resourceType: string, subIndex: string, oldResource: T, newResource: T): Promise<ISortable> {
        return new Promise<ISortable> (respond => {
            if (this.subListPoolExists(resourceType, subIndex)) {
                let pool = this.getSubListPool(resourceType, subIndex);
                let that = this;
                var queue: IQueueItem = {
                    Executables: [
                        {
                            execute: that.removeSubListResource,
                            parameters: {
                                resourceType: resourceType,
                                subIndex: subIndex,
                                resource: oldResource
                            }
                        },
                        {
                            execute: that.insertSubListResource,
                            parameters: {
                                resourceType: resourceType,
                                subIndex: subIndex,
                                resource: newResource
                            }
                        }
                    ],
                    Callback: executionResults => {

                        //the first result corresponds to the insert sub list resource function in the queue
                        let newResource = executionResults[1];

                        respond(newResource);
                    }
                }
                this.addToQueue(resourceType, subIndex, queue);
            }
        });
    }
}