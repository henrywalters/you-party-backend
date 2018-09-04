"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const RankHelper_1 = require("../../Helpers/RankHelper");
const RankHelper_2 = require("../../Helpers/RankHelper");
class SubListExecutionFunction {
    constructor(func, parameters) {
        this.parameters = parameters;
        this.function = func;
    }
    execute() {
        return this.function;
    }
}
class ResourcePool {
    constructor(resourceTypes) {
        this.Pools = {};
        this.ResourceTypes = resourceTypes;
        for (let i = 0; i < this.ResourceTypes.length; i++) {
            if (!this.poolExists(this.ResourceTypes[i])) {
                this.Pools[this.ResourceTypes[i]] = {
                    Type: this.ResourceTypes[i],
                    Pool: [],
                    SubPools: {},
                    SubListPools: {}
                };
            }
        }
    }
    displayList(list) {
        let str = list.map(item => {
            return item.downvotes + " down - " + item.upvotes + " up - ID: " + item.id + " added at " + item.timeAdded;
        });
        let joined = str.join("\n");
        return joined;
    }
    poolExists(resourceType) {
        if (typeof this.Pools[resourceType] != 'undefined') {
            return true;
        }
        else {
            return false;
        }
    }
    subPoolExists(resourceType, subIndex) {
        if (this.poolExists(resourceType)) {
            if (typeof this.Pools[resourceType].SubPools[subIndex] !== 'undefined') {
                return true;
            }
        }
        return false;
    }
    subListPoolExists(resourceType, subIndex) {
        if (this.poolExists(resourceType)) {
            if (typeof this.Pools[resourceType].SubListPools[subIndex] !== 'undefined') {
                return true;
            }
        }
        return false;
    }
    getPool(resourceType) {
        return this.Pools[resourceType];
    }
    getSubPool(resourceType, subIndex) {
        return this.Pools[resourceType].SubPools[subIndex];
    }
    getSubListPool(resourceType, subIndex) {
        return this.Pools[resourceType].SubListPools[subIndex];
    }
    createPool(resourceType) {
        if (!this.poolExists(resourceType)) {
            this.Pools[resourceType] = {
                Type: resourceType,
                Pool: [],
                SubPools: {},
                SubListPools: {}
            };
            console.log("Creating Pool: " + resourceType);
        }
    }
    createSubPool(resourceType, subIndex) {
        if (!this.getSubPool(resourceType, subIndex)) {
            this.Pools[resourceType].SubPools[subIndex] = {
                SubIndex: subIndex,
                Pool: []
            };
            console.log("Created Pool: " + resourceType + " sub: " + subIndex);
        }
    }
    joinSubPool(resourceType, subIndex, socket) {
        if (this.subPoolExists(resourceType, subIndex)) {
            this.getSubPool(resourceType, subIndex).Pool.push(socket);
            console.log(this.Pools[resourceType].SubPools[subIndex].Pool.length + " Members in Sub Resource Pool: " + resourceType + " - " + subIndex);
        }
    }
    joinPool(resourceType, socket) {
        let pool = this.getPool(resourceType);
        pool.Pool.push(socket);
        console.log(this.Pools[resourceType].Pool.length + " Members in Resource Pool: " + resourceType);
    }
    createSubListPool(resourceType, subIndex, rankType, initialList = []) {
        if (!this.getSubListPool(resourceType, subIndex)) {
            this.Pools[resourceType].SubListPools[subIndex] = {
                SubIndex: subIndex,
                Pool: [],
                List: RankHelper_2.default.Sort(RankHelper_1.RankTypes["Wilson Lower Bound"], initialList),
                Queue: [],
                IsHandlingQueue: false
            };
            console.log("Created Pool: " + resourceType + " sub: " + subIndex);
            console.log(this.Pools[resourceType].SubListPools[subIndex]);
        }
    }
    joinSubListPool(resourceType, subIndex, socket) {
        let pool = this.getSubListPool(resourceType, subIndex);
        pool.Pool.push(socket);
        console.log(this.Pools[resourceType].Pool.length + " Members in Sub List Resource Pool: " + resourceType + " - " + subIndex);
    }
    resourceChange(resourceType, changeType, resource) {
        let pool = this.getPool(resourceType);
        if (typeof pool !== undefined) {
            for (let i = 0; i < pool.Pool.length; i++) {
                resource["changeType"] = changeType;
                console.log("Changing: " + resourceType + " by " + changeType);
                pool.Pool[i].emit(resourceType, resource);
            }
        }
        else {
            throw new Error("Resource Type: " + resourceType + " does not exist. Therefore resource can not change");
        }
    }
    subResourceChange(resourceType, subIndex, changeType, resource) {
        if (this.subPoolExists(resourceType, subIndex)) {
            let pool = this.getSubPool(resourceType, subIndex);
            console.log(pool);
            console.log("Changing: " + resourceType + "-" + subIndex + " by " + changeType);
            resource["changeType"] = changeType;
            resource['subIndex'] = subIndex;
            for (let i = 0; i < pool.Pool.length; i++) {
                pool.Pool[i].emit(resourceType, resource);
            }
        }
        else {
            throw new Error("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
        }
    }
    subListResourceChange(resourceType, subIndex, changeType, index, resource) {
        if (this.subListPoolExists(resourceType, subIndex)) {
            let pool = this.getSubListPool(resourceType, subIndex);
            resource["changeType"] = changeType;
            resource['subIndex'] = subIndex;
            resource['index'] = index;
            resource['changeTime'] = Date.now();
            console.log("SHOULD BE EMITTING: " + resourceType + " sub index: " + subIndex);
            console.log(pool.Pool.length + " members in channel");
            for (let i = 0; i < pool.Pool.length; i++) {
                console.log("Emitting: " + resourceType);
                pool.Pool[i].emit(resourceType, resource);
            }
            console.log(changeType + " " + resourceType + " : " + resource);
        }
        else {
            throw new Error("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
        }
    }
    createResource(resourceType, resource) {
        this.resourceChange(resourceType, "create", resource);
    }
    updateResource(resourceType, resource) {
        this.resourceChange(resourceType, "update", resource);
    }
    destroyResource(resourceType, resource) {
        this.resourceChange(resourceType, "destroy", resource);
    }
    createSubResource(resourceType, subIndex, resource) {
        this.subResourceChange(resourceType, subIndex, "create", resource);
    }
    updateSubResource(resourceType, subIndex, resource) {
        this.subResourceChange(resourceType, subIndex, "update", resource);
    }
    destroySubResource(resourceType, subIndex, resource) {
        this.subResourceChange(resourceType, subIndex, "destroy", resource);
    }
    addToQueue(resourceType, subIndex, queueItem) {
        if (this.subListPoolExists(resourceType, subIndex)) {
            let pool = this.getSubListPool(resourceType, subIndex);
            pool.Queue.push(queueItem);
            this.executeQueue(resourceType, subIndex);
        }
    }
    executeQueue(resourceType, subIndex, context = false) {
        let that = this;
        if (context) {
            that = context;
        }
        if (that.subListPoolExists(resourceType, subIndex)) {
            let pool = that.getSubListPool(resourceType, subIndex);
            console.log("Got pool");
            if (!pool.IsHandlingQueue) {
                console.log("Handling Queue");
                pool.IsHandlingQueue = true;
                console.log("Queue Length: " + pool.Queue.length);
                if (pool.Queue.length === 0) {
                    pool.IsHandlingQueue = false;
                }
                else {
                    let queueItem = pool.Queue.shift();
                    if (pool.Queue.length === 0) {
                        pool.IsHandlingQueue = false;
                    }
                    this.executeQueueItem(queueItem)
                        .then(executionResults => {
                        console.log("Executing Queue Item");
                        queueItem.Callback(executionResults);
                        that = this;
                        if (pool.IsHandlingQueue) {
                            that.executeQueue(resourceType, subIndex, that);
                        }
                    });
                }
            }
            else {
                console.log("Pool is already being handled");
            }
        }
    }
    executeQueueItem(queueItem) {
        return new Promise(respond => {
            //Map the list of syncronous functions to a list of callback results.
            //Since these are being queued, the result will therefore be async.
            let callbackResults = [];
            queueItem.Executables.map(execution => {
                let ex = execution();
                callbackResults.push(ex);
            });
            respond(callbackResults);
        });
    }
    insertSubListResource(resourceType, subIndex, resource) {
        if (this.subListPoolExists(resourceType, subIndex)) {
            let pool = this.getSubListPool(resourceType, subIndex);
            let index = RankHelper_2.default.BinarySearch(RankHelper_1.RankTypes["Wilson Lower Bound"], pool.List, resource);
            pool.List.splice(index, 0, resource);
            this.subListResourceChange(resourceType, subIndex, "insert", index, resource);
            console.log(this.displayList(pool.List));
            return pool.List[index];
        }
        else {
            throw new Error("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
        }
    }
    removeSubListResource(resourceType, subIndex, resource) {
        if (this.subListPoolExists(resourceType, subIndex)) {
            let pool = this.getSubListPool(resourceType, subIndex);
            let index = RankHelper_2.default.BinarySearch(RankHelper_1.RankTypes["Wilson Lower Bound"], pool.List, resource);
            pool.List.splice(index, 1);
            this.subListResourceChange(resourceType, subIndex, "remove", index, resource);
        }
        else {
            console.log("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
            throw new Error("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
        }
    }
    swapSubListResource(resourceType, subIndex, oldResource, newResource) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(respond => {
                if (this.subListPoolExists(resourceType, subIndex)) {
                    let pool = this.getSubListPool(resourceType, subIndex);
                    let queue = {
                        Executables: [
                            () => {
                                return this.removeSubListResource(resourceType, subIndex, oldResource);
                            },
                            () => {
                                return this.insertSubListResource(resourceType, subIndex, newResource);
                            }
                        ],
                        Callback: executionResults => {
                            //the first result corresponds to the insert sub list resource function in the queue
                            let newResource = executionResults[1];
                            respond(newResource);
                        }
                    };
                    this.addToQueue(resourceType, subIndex, queue);
                }
            });
        });
    }
}
exports.default = ResourcePool;
//# sourceMappingURL=ResourcePool.js.map