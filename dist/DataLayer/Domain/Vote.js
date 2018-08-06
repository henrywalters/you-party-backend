"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataObject_1 = require("../Abstract/DataObject");
class Vote extends DataObject_1.default {
    constructor() {
        super(...arguments);
        this.Table = "Votes";
        this.Schema = {
            playlistId: "string",
            guestId: "string",
            type: "string"
        };
    }
}
exports.default = Vote;
//# sourceMappingURL=Vote.js.map