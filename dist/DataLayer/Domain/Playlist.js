"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataObject_1 = require("../Abstract/DataObject");
class Playlist extends DataObject_1.default {
    constructor() {
        super(...arguments);
        this.Table = "Playlists";
        this.Schema = {
            partyId: "string",
            videoId: "string",
            guestId: "string",
            status: "string"
        };
    }
}
exports.default = Playlist;
//# sourceMappingURL=Playlist.js.map