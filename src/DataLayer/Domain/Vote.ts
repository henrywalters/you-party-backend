import DataObject from "../Abstract/DataObject";
import * as mysql from 'mysql';

export default class Vote extends DataObject {
    Table: string = "Votes";
    Schema: Object = {
        playlistId: "string",
        guestId: "string",
        type: "string"
    }

    getUserVotes(userId: string, partyId: string, cb: {(error: boolean, res: Array<Object>): void}) {
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
        })
    }
}