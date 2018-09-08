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
            SELECT P.id, P.partyId, P.videoId, V.title, V.description, V.videoKey, P.timeAdded, V.duration, V.licensedContent,
            CASE WHEN UP.upvotes IS NULL THEN 0 ELSE UP.upvotes END AS upvotes,
            CASE WHEN DOWN.downvotes IS NULL THEN 0 ELSE DOWN.downvotes END AS downvotes
            FROM (
                (
                    SELECT * FROM Playlists WHERE partyId = ? AND STATUS = 'queued'
                ) P
                INNER JOIN
                (
                    SELECT * FROM Videos
                ) V ON V.id = P.videoId
                LEFT JOIN
                (
                    SELECT COUNT(id) upvotes, playlistId FROM Votes WHERE type = 'up' GROUP BY playlistId
                ) UP ON UP.playlistId = P.id
                LEFT JOIN
                (
                    SELECT COUNT(id) downvotes, playlistId FROM Votes WHERE type = 'down' GROUP BY playlistId
                ) DOWN ON DOWN.playlistId = P.id
            )
        `;
        sql = mysql.format(sql, [partyId]);
        this.query(sql, (error, res) => {
            cb(error, res);
        });
    }
    getMyPlaylist(userId, partyId, cb) {
        let sql = `
            SELECT P.id, P.partyId, P.videoId, V.title, V.description, V.videoKey, P.timeAdded, V.duration, V.licensedContent,
            CASE WHEN UP.upvotes IS NULL THEN 0 ELSE UP.upvotes END AS upvotes,
            CASE WHEN DOWN.downvotes IS NULL THEN 0 ELSE DOWN.downvotes END AS downvotes,
            CASE WHEN UP.guestId = ? THEN 'up' WHEN DOWN.guestId = ? THEN 'down' ELSE NULL END AS myVote
            FROM (
                (
                    SELECT * FROM Playlists WHERE partyId = ? AND STATUS = 'queued'
                ) P
                INNER JOIN
                (
                    SELECT * FROM Videos
                ) V ON V.id = P.videoId
                LEFT JOIN
                (
                    SELECT COUNT(id) upvotes, playlistId, guestId FROM Votes WHERE type = 'up' GROUP BY playlistId
                ) UP ON UP.playlistId = P.id
                LEFT JOIN
                (
                    SELECT COUNT(id) downvotes, playlistId, guestId FROM Votes WHERE type = 'down' GROUP BY playlistId
                ) DOWN ON DOWN.playlistId = P.id
            )
        `;
        sql = mysql.format(sql, [userId, userId, partyId]);
        this.query(sql, (error, res) => {
            cb(error, res);
        });
    }
    getPlaylistAsync(partyId) {
        return new Promise(res => {
            this.getPlaylist(partyId, (error, playlist) => {
                res(playlist);
            });
        });
    }
    getPlaylistVideoAsync(playlistId) {
        return new Promise(res => {
            this.getPlaylistVideo(playlistId, (error, video) => {
                res(video);
            });
        });
    }
    getPlaylistVideo(id, cb) {
        let sql = `
            SELECT P.id, P.partyId,  P.videoId,V.title, V.description, V.videoKey, P.timeAdded, V.duration, V.licensedContent,
            CASE WHEN UP.upvotes IS NULL THEN 0 ELSE UP.upvotes END AS upvotes,
            CASE WHEN DOWN.downvotes IS NULL THEN 0 ELSE DOWN.downvotes END AS downvotes
            FROM (
                (
                    SELECT * FROM Playlists WHERE id = ? AND STATUS = 'queued'
                ) P
                INNER JOIN
                (
                    SELECT * FROM Videos
                ) V ON V.id = P.videoId
                LEFT JOIN
                (
                    SELECT COUNT(id) upvotes, playlistId FROM Votes WHERE type = 'up' GROUP BY playlistId
                ) UP ON UP.playlistId = P.id
                LEFT JOIN
                (
                    SELECT COUNT(id) downvotes, playlistId FROM Votes WHERE type = 'down' GROUP BY playlistId
                ) DOWN ON DOWN.playlistId = P.id
            )
        `;
        sql = mysql.format(sql, [id]);
        this.query(sql, (error, res) => {
            if (res.length > 0) {
                cb(false, res[0]);
            }
            else {
                cb(true, []);
            }
        });
    }
}
exports.default = Playlist;
//# sourceMappingURL=Playlist.js.map