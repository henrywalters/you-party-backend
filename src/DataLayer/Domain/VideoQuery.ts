import DataObject from '../Abstract/DataObject';
import * as mysql from 'mysql';
export default class VideoQuery extends DataObject {
    Schema: Object = {
        query: "string",
        videoId: "string"
    };

    Table: string = "VideoQueries";

    getQueryVideos(query: string, cb: {(error, res: Array<Object>)}): void {
        let sql = `
            SELECT Video.id, Video.videoKey, Video.title, Video.description, Video.thumbnail FROM (
                (
                    SELECT * FROM VideoQueries WHERE ?? = ?
                ) Queries 
                LEFT JOIN
                (
                    SELECT * FROM Videos
                ) Video on Video.id = Queries.videoId
            )
        `;

        let inserts = ['query', query];
        sql = mysql.format(sql, inserts);
        this.query(sql, (error, res) => {
            if (res.length === 0) {
                cb(true, null);
            } else {
                cb( false, res);
            }
        })
    }
}