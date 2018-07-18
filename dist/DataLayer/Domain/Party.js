"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataObject_1 = require("../Abstract/DataObject");
class Party extends DataObject_1.default {
    constructor() {
        super(...arguments);
        this.Schema = {
            name: 'string',
            key: 'string'
        };
        this.Table = "Parties";
    }
}
exports.default = Party;
//# sourceMappingURL=Party.js.map