"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataObject_1 = require("../Abstract/DataObject");
class Video extends DataObject_1.default {
    constructor() {
        super(...arguments);
        this.Schema = {
            videoKey: "string",
            title: "string",
            description: "string",
            thumbnail: "string",
            duration: "number",
            licensedContent: "boolean"
        };
        this.Table = "Videos";
    }
}
exports.default = Video;
//# sourceMappingURL=Video.js.map