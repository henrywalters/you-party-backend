import IResourceRouter from "../interface/IResourceRouter";
import IQueryable from "../../DataLayer/Interface/IQueryable";
import IResourcePool from "../interface/IResourcePool";
import VideoSearchController from '../../BusinessLayer/Implementation/VideoSearchController';
import PlaylistController from '../../BusinessLayer/Implementation/PlaylistController';
import Auth from "../../AuthLayer/implementation/Auth";
import { RankTypes } from '../../Helpers/RankHelper';

export default class VideoRoutes implements IResourceRouter {
    route(app: any, socket: SocketIO.Socket, ds: IQueryable, pool: IResourcePool) {
        let videoSearch = new VideoSearchController(ds);
        let playlist = new PlaylistController(ds, pool);
        let auth = new Auth(ds);

        app.get("/video", (req, res) => {
            if (typeof req.query.q != 'undefined') {
                videoSearch.search(req.query.q, (videos) => {
                    res.json({
                        success: true,
                        videos: videos
                    })
                })
            } else {
                res.json({
                    success: false,
                    error: "Expected query"
                })
            }
        })

        app.post("/party/:partyId/playlist/:videoId", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            playlist.addToPlaylist(user['id'], req.params.partyId, req.params.videoId, (error, video) => {
                if (error !== null) {
                    res.json({
                        success: false,
                        error: error
                    })
                } else {
                    res.json({
                        success: true,
                        video: video
                    })
                }
            })
        });

        app.get("/party/:partyId/playlist", (req, res) => {
            playlist.getSortedPlaylist(req.params.partyId, RankTypes["Wilson Lower Bound"], (error, playlist) => {
                if (error) {
                    res.json({
                        success: false
                    })
                } else {
                    res.json({
                        success: true,
                        playlist: playlist
                    })
                }
            })
        })
    }
}