import DataObject from "../Abstract/DataObject";
import * as mysql from 'mysql';

export default class Playlist extends DataObject {
    Table: string = "Playlists";
    Schema: Object = {
        partyId: "string",
        videoId: "string",
        guestId: "string",
        status: "string"
    }

    getPlaylist(partyId: string, cb: {(error, res): void}) {
        let sql = `
            SELECT P.id, P.videoId, V.title, V.description, V.videoKey, 
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
        `

        sql = mysql.format(sql, [partyId]);

        this.query(sql, (error, res) => {
            cb(error, res);
        })
    }
}