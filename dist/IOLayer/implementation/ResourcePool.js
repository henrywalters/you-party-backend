"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RankHelper_1 = require("../../Helpers/RankHelper");
const RankHelper_2 = require("../../Helpers/RankHelper");
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
            console.log(this.Pools[resourceType]);
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
                List: RankHelper_2.default.Sort(RankHelper_1.RankTypes["Wilson Lower Bound"], initialList)
            };
            console.log("Created Pool: " + resourceType + " sub: " + subIndex);
            console.log(this.Pools[resourceType].SubListPools[subIndex]);
        }
    }
    joinSubListPool(resourceType, subIndex, socket) {
        let pool = this.getPool(resourceType);
        pool.Pool.push(socket);
        console.log(this.Pools[resourceType].Pool.length + " Members in Resource Pool: " + resourceType);
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
            for (let i = 0; i < pool.Pool.length; i++) {
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
    insertSubListResource(resourceType, subIndex, resource) {
        if (this.subListPoolExists(resourceType, subIndex)) {
            let pool = this.getSubListPool(resourceType, subIndex);
            let index = RankHelper_2.default.BinarySearch(RankHelper_1.RankTypes["Wilson Lower Bound"], pool.List, resource);
            pool.List.splice(index, 0, resource);
            this.subListResourceChange(resourceType, subIndex, "insert", index, resource);
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
        }
        else {
            throw new Error("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
        }
    }
    swapSubListResource(resourceType, subIndex, resource) {
        if (this.subListPoolExists(resourceType, subIndex)) {
            let pool = this.getSubListPool(resourceType, subIndex);
            this.removeSubListResource(resourceType, subIndex, resource);
            this.insertSubListResource(resourceType, subIndex, resource);
        }
        else {
            throw new Error("Resource Type: " + resourceType + " - " + subIndex + " does not exist. Therefore resource can not change");
        }
    }
}
exports.default = ResourcePool;
//# sourceMappingURL=ResourcePool.js.map