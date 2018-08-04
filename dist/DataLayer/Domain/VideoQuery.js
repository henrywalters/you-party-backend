"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataObject_1 = require("../Abstract/DataObject");
const mysql = require("mysql");
class VideoQuery extends DataObject_1.default {
    constructor() {
        super(...arguments);
        this.Schema = {
            query: "string",
            videoId: "string"
        };
        this.Table = "VideoQueries";
    }
    getQueryVideos(query, cb) {
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
            }
            else {
                cb(false, res);
            }
        });
    }
}
exports.default = VideoQuery;
//# sourceMappingURL=VideoQuery.js.map