"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VideoSearchController_1 = require("../../BusinessLayer/Implementation/VideoSearchController");
const PlaylistController_1 = require("../../BusinessLayer/Implementation/PlaylistController");
const Auth_1 = require("../../AuthLayer/implementation/Auth");
class UserRoutes {
    route(app, socket, ds, pool) {
        let videoSearch = new VideoSearchController_1.default(ds);
        let playlist = new PlaylistController_1.default(ds, pool);
        let auth = new Auth_1.default(ds);
        app.get("/video", (req, res) => {
            if (typeof req.query.q != 'undefined') {
                videoSearch.search(req.query.q, (videos) => {
                    res.json({
                        success: true,
                        videos: videos
                    });
                });
            }
            else {
                res.json({
                    success: false,
                    error: "Expected query"
                });
            }
        });
        app.post("/party/:partyId/playlist/:videoId", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            playlist.addToPlaylist(user['id'], req.params.partyId, req.params.videoId, (error, video) => {
                if (error !== null) {
                    res.json({
                        success: false,
                        error: error
                    });
                }
                else {
                    res.json({
                        success: true,
                        video: video
                    });
                }
            });
        });
        app.get("/party/:partyId/playlist", (req, res) => {
            playlist.getPlaylist(req.params.partyId, (error, playlist) => {
                if (error) {
                    res.json({
                        success: false
                    });
                }
                else {
                    res.json({
                        success: true,
                        playlist: playlist
                    });
                }
            });
        });
    }
}
exports.default = UserRoutes;
//# sourceMappingURL=VideoRoutes.js.map