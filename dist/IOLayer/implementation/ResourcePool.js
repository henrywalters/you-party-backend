"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResourcePool {
    constructor(resourceTypes) {
        this.Pools = {};
        this.ResourceTypes = resourceTypes;
        for (let i = 0; i < this.ResourceTypes.length; i++) {
            if (this.poolExists(this.ResourceTypes[i])) {
                this.Pools[this.ResourceTypes[i]] = {
                    Type: this.ResourceTypes[i],
                    Pool: [],
                    SubPools: {}
                };
            }
        }
    }
    poolExists(resourceType) {
        if (typeof this.Pools[resourceType] != undefined) {
            return true;
        }
        else {
            return false;
        }
    }
    subPoolExists(resourceType, subIndex) {
        if (this.poolExists(resourceType)) {
            if (typeof this.Pools[resourceType].SubPools[subIndex] !== undefined) {
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
    createSubPool(resourceType, subIndex) {
        if (!this.getSubPool(resourceType, subIndex)) {
            this.Pools[resourceType].SubPools[subIndex] = {
                SubIndex: subIndex,
                Pool: []
            };
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
                pool.Pool[i].emit(resourceType, resource);
            }
        }
    }
    subResourceChange(resourceType, subIndex, changeType, resource) {
        if (this.subPoolExists(resourceType, subIndex)) {
            let pool = this.getSubPool(resourceType, subIndex);
            for (let i = 0; i < pool.Pool.length; i++) {
                resource["changeType"] = changeType;
                pool.Pool[i].emit(resourceType, resource);
            }
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