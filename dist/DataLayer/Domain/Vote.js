"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataObject_1 = require("../Abstract/DataObject");
const mysql = require("mysql");
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
    getUserVotes(userId, partyId, cb) {
        let sql = `
        SELECT V.* FROM 
        (
            (
                SELECT * FROM Playlists WHERE partyId = ? AND STATUS = 'queued'
            ) P 
            INNER JOIN
            (
                SELECT * FROM Votes WHERE guestId = ?
            ) V ON V.playlistId = P.id
        )`;
        sql = mysql.format(sql, [partyId, userId]);
        this.query(sql, (error, res) => {
            cb(error, res);
        });
    }
}
exports.default = Vote;
//# sourceMappingURL=Vote.js.map