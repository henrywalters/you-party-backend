"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VideoSearchController_1 = require("../../BusinessLayer/Implementation/VideoSearchController");
const PlaylistController_1 = require("../../BusinessLayer/Implementation/PlaylistController");
const Auth_1 = require("../../AuthLayer/implementation/Auth");
class PlaylistRoutes {
    route(app, socket, ds, pool) {
        let videoSearch = new VideoSearchController_1.default(ds);
        let playlist = new PlaylistController_1.default(ds, pool);
        let auth = new Auth_1.default(ds);
        app.post("/playlist/:playlistId/upvote", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            playlist.upvoteAsync(user['id'], req.params.playlistId)
                .then((video) => {
                res.json({
                    success: true,
                    video: video
                });
            })
                .catch(() => {
                res.json({
                    success: false,
                    video: null
                });
            });
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
        });
        app.post("/playlist/:playlistId/downvote", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            playlist.downvoteAsync(user['id'], req.params.playlistId)
                .then((video) => {
                res.json({
                    success: true,
                    video: video
                });
            })
                .catch((error) => {
                res.json({
                    success: false,
                    error: error
                });
            });
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
        });
    }
}
exports.default = PlaylistRoutes;
//# sourceMappingURL=PlaylistRoutes.js.map