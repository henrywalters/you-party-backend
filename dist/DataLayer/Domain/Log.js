"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataObject_1 = require("../Abstract/DataObject");
class Log extends DataObject_1.default {
    constructor() {
        super(...arguments);
        this.Schema = {
            time: "string",
            message: "string",
            sender: "string"
        };
        this.Table = "Logs";
    }
}
exports.default = Log;
//# sourceMappingURL=Log.js.map