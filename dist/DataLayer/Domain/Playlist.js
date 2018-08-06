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
            SELECT P.id, P.videoId, V.title, V.description, V.videoKey, UP.upvotes, DOWN.downvotes FROM (
                (
                    SELECT * FROM Playlists WHERE partyId = ? AND STATUS = 'queued'
                ) P
                INNER JOIN
                (
                    SELECT * FROM Videos
                ) V ON V.id = P.videoId
                LEFT JOIN
                (
                    SELECT COUNT(id) upvotes, playlistId FROM Votes WHERE type = 'up'
                ) UP ON UP.playlistId = P.id
                LEFT JOIN
                (
                    SELECT COUNT(id) downvotes, playlistId FROM Votes WHERE type = 'down'
                ) DOWN ON DOWN.playlistId = P.id
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