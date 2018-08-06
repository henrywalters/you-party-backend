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
            SELECT P.id, P.videoId, V.title, V.description, V.videoKey FROM (
                (
                    SELECT * FROM Playlists WHERE partyId = ? AND STATUS = 'queued'
                ) P
                INNER JOIN
                (
                    SELECT * FROM Videos
                ) V ON V.id = P.videoId
            )
        `

        sql = mysql.format(sql, [partyId]);

        this.query(sql, (error, res) => {
            cb(error, res);
        })
    }
}