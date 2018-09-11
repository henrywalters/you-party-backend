"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VideoSearchController_1 = require("../../BusinessLayer/Implementation/VideoSearchController");
const PlaylistController_1 = require("../../BusinessLayer/Implementation/PlaylistController");
const Auth_1 = require("../../AuthLayer/implementation/Auth");
const RankHelper_1 = require("../../Helpers/RankHelper");
const PartyController_1 = require("../../BusinessLayer/Implementation/PartyController");
const VideoController_1 = require("../../BusinessLayer/Implementation/VideoController");
class VideoRoutes {
    routeSocket(socket, ds, pool) {
        let videoController = new VideoController_1.default(ds, pool);
        let auth = new Auth_1.default(ds);
        socket.on('pause-video', (video) => {
            if (typeof (video.partyId) === 'undefined' || typeof (video.jwt) === 'undefined') {
                socket.emit('video-error', {
                    error: "pause-video requires partyId and jwt to be passed"
                });
            }
            else {
                let user = auth.validateToken(video.jwt);
                if (user) {
                    videoController.pauseVideo(video.partyId, user['id'], (error) => {
                        if (error !== null) {
                            socket.emit('video-error', {
                                error: error
                            });
                        }
                    });
                }
            }
        });
        socket.on('start-video', (video) => {
            if (typeof (video.partyId) === 'undefined' || typeof (video.jwt) === 'undefined') {
                socket.emit('video-error', {
                    error: "pause-video requires partyId and jwt to be passed"
                });
            }
            else {
                let user = auth.validateToken(video.jwt);
                if (user) {
                    videoController.startVideo(video.partyId, user['id'], (error) => {
                        if (error !== null) {
                            socket.emit('video-error', {
                                error: error
                            });
                        }
                    });
                }
            }
        });
    }
    route(app, socket, ds, pool) {
        let videoSearch = new VideoSearchController_1.default(ds);
        let playlist = new PlaylistController_1.default(ds, pool);
        let party = new PartyController_1.default(ds, pool);
        let videoController = new VideoController_1.default(ds, pool);
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
        app.get("/party/self/playing", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            party.currentParty(user['id'], (error, party) => {
                if (!error) {
                    videoController.getPlayingVideo(party['id'], (error, video) => {
                        if (!error) {
                            res.json({
                                success: true,
                                video: video
                            });
                        }
                        else {
                            res.json({
                                success: false,
                                error: error
                            });
                        }
                    });
                }
            });
        });
        app.get("/party/self/playlist", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            party.currentParty(user['id'], (error, party) => {
                if (!error) {
                    playlist.getMySortedPlaylist(user['id'], party['id'], RankHelper_1.RankTypes["Wilson Lower Bound"], (error, playlist) => {
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
                }
            });
        });
        app.get("/party/:partyId/playlist", (req, res) => {
            playlist.getSortedPlaylist(req.params.partyId, RankHelper_1.RankTypes["Wilson Lower Bound"], (error, playlist) => {
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
exports.default = VideoRoutes;
//# sourceMappingURL=VideoRoutes.js.map