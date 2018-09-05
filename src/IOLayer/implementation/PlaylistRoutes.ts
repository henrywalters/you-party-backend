import IResourceRouter from "../interface/IResourceRouter";
import IQueryable from "../../DataLayer/Interface/IQueryable";
import IResourcePool from "../interface/IResourcePool";
import VideoSearchController from "../../BusinessLayer/Implementation/VideoSearchController";
import PlaylistController from "../../BusinessLayer/Implementation/PlaylistController";
import Auth from "../../AuthLayer/implementation/Auth";

export default class PlaylistRoutes implements IResourceRouter {
    route(app: any, socket: SocketIO.Socket, ds: IQueryable, pool: IResourcePool) {
        let videoSearch = new VideoSearchController(ds);
        let playlist = new PlaylistController(ds, pool);
        let auth = new Auth(ds);

        app.post("/playlist/:playlistId/upvote", (req, res) => {
            auth.validateHeader(req,res);
            let user = auth.getSelf(req);

            playlist.upvoteAsync(user['id'], req.params.playlistId)
                .then((video) => {
                    res.json({
                        success: true,
                        video: video
                    })
                })
                .catch((err) => {
                    res.json({
                        success: false,
                        video: err
                    })
                })

            /*playlist.upvote(user['id'], req.params.playlistId, (error, vote) => {
                if (error) {
                    res.json({
                        success: false,
                        error: error
                    })
                } else {
                    res.json({
                        success: true,
                        vote: vote
                    })
                }
            })
            */
        })

        app.post("/playlist/:playlistId/downvote", (req, res) => {
            auth.validateHeader(req,res);
            let user = auth.getSelf(req);

            playlist.downvoteAsync(user['id'], req.params.playlistId)
                .then((video) => {
                    res.json({
                        success: true,
                        video: video
                    })
                })
                .catch((error) => {
                    res.json({
                        success: false,
                        error: error
                    })
                })

            /*playlist.downvote(user['id'], req.params.playlistId, (error, vote) => {
                if (error) {
                    res.json({
                        success: false,
                        error: error
                    })
                } else {
                    res.json({
                        success: true,
                        vote: vote
                    })
                }
            })
            */
        })
    }
}