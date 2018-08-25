"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResourcePool {
    constructor(resourceTypes) {
        this.Pools = {};
        console.log(resourceTypes);
        this.ResourceTypes = resourceTypes;
        for (let i = 0; i < this.ResourceTypes.length; i++) {
            if (!this.poolExists(this.ResourceTypes[i])) {
                this.Pools[this.ResourceTypes[i]] = {
                    Type: this.ResourceTypes[i],
                    Pool: [],
                    SubPools: {}
                };
                console.log(this.ResourceTypes[i]);
                console.log(this.Pools[this.ResourceTypes[i]]);
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
            console.log("Pool Exists");
            if (typeof this.Pools[resourceType].SubPools[subIndex] !== 'undefined') {
                console.log("Sub Pool Exists");
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
    createPool(resourceType) {
        if (!this.poolExists(resourceType)) {
            this.Pools[resourceType] = {
                Type: resourceType,
                Pool: [],
                SubPools: {}
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
}
exports.default = ResourcePool;
//# sourceMappingURL=ResourcePool.js.map