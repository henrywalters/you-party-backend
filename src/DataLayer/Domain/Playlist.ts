import DataObject from "../Abstract/DataObject";
import * as mysql from 'mysql';
import { ISortable } from '../../Helpers/RankHelper';

export interface IPlaylistVideo {
    id: string;
    partyId: string;
    videoId: string;
    title: string;
    description: string;
    videoKey: string;
    upvotes: number;
    downvotes: number;
    timeAdded: string;
}

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
            SELECT P.id, P.partyId, P.videoId, V.title, V.description, V.videoKey, P.timeAdded,
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

    getMyPlaylist(userId: string, partyId: string, cb: {(error, res): void}) {
        let sql = `
            SELECT P.id, P.partyId, P.videoId, V.title, V.description, V.videoKey, P.timeAdded,
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
        `

        sql = mysql.format(sql, [userId, userId, partyId]);

        this.query(sql, (error, res) => {
            cb(error, res);
        })
    }

    getPlaylistAsync(partyId: string) {
        return new Promise<Array<IPlaylistVideo>> (res => {
            this.getPlaylist(partyId, (error, playlist) => {
                res(playlist);
            })
        });
    }

    getPlaylistVideoAsync(playlistId: string) {
        return new Promise<IPlaylistVideo> (res => {
            this.getPlaylistVideo(playlistId, (error, video) => {
                res(video);
            })
        })
    }

    getPlaylistVideo(id: string, cb: {(error, res): void}) {
        let sql = `
            SELECT P.id, P.partyId,  P.videoId,V.title, V.description, V.videoKey, P.timeAdded,
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
        `

        sql = mysql.format(sql, [id]);

        this.query(sql, (error, res) => {
            if (res.length > 0) {
                cb(false, res[0]);
            } else {
                cb(true, []);
            }
        })
    }
}