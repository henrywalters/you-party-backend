"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataObject_1 = require("../Abstract/DataObject");
const mysql = require("mysql");
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
    getPlaylist(partyId, cb) {
        let sql = `
            SELECT P.id, P.videoId, V.title, V.description, V.videoKey FROM (
                (
                    SELECT * FROM Playlists WHERE partyId = ? AND STATUS = 'queued'
                ) P
                INNER JOIN
                (
                    SELECT * FROM Videos
                ) V ON V.id = P.videoId
            )
        `;
        sql = mysql.format(sql, [partyId]);
        this.query(sql, (error, res) => {
            cb(error, res);
        });
    }
}
exports.default = Playlist;
//# sourceMappingURL=Playlist.js.map