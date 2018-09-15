import IResourceRouter from "../interface/IResourceRouter";
import IQueryable from "../../DataLayer/Interface/IQueryable";
import IResourcePool from "../interface/IResourcePool";
import VideoSearchController from '../../BusinessLayer/Implementation/VideoSearchController';
import PlaylistController from '../../BusinessLayer/Implementation/PlaylistController';
import Auth from "../../AuthLayer/implementation/Auth";
import { RankTypes } from '../../Helpers/RankHelper';
import PartyController from '../../BusinessLayer/Implementation/PartyController';
import VideoController from '../../BusinessLayer/Implementation/VideoController';
import ISocketRouter from "../interface/ISocketRouter";
import * as SocketIO from 'socket.io';

export default class VideoRoutes implements IResourceRouter, ISocketRouter {

    routeSocket(socket: SocketIO.Socket, ds: IQueryable, pool: IResourcePool) {

        let videoController = new VideoController(ds, pool);
        let auth = new Auth(ds);

        socket.on('pause-video', (video) => {
            if (typeof (video.partyId) === 'undefined' || typeof (video.jwt) === 'undefined') {
                socket.emit('video-error', {
                    error: "pause-video requires partyId and jwt to be passed"
                });
            } else {
                let user = auth.validateToken(video.jwt);
                if (user) {
                    videoController.pauseVideo(video.partyId, user['id'], (error) => {
                        if (error !== null) {
                            socket.emit('video-error', {
                                error: error
                            })
                        }
                    });
                }
                
            }
        })

        socket.on('start-video', (video) => {
            if (typeof (video.partyId) === 'undefined' || typeof (video.jwt) === 'undefined') {
                socket.emit('video-error', {
                    error: "pause-video requires partyId and jwt to be passed"
                });
            } else {
                let user = auth.validateToken(video.jwt);
                if (user) {
                    videoController.startVideo(video.partyId, user['id'], (error) => {
                        if (error !== null) {
                            socket.emit('video-error', {
                                error: error
                            })
                        }
                    });
                }
                
            }
        })

        socket.on('stop-video', (video) => {
            if (typeof (video.partyId) === 'undefined' || typeof (video.jwt) === 'undefined') {
                socket.emit('video-error', {
                    error: "stop-video requires partyId and jwt to be passed"
                });
            } else {
                let user = auth.validateToken(video.jwt);
                if (user) {
                    videoController.endPlayingVideo(video.partyId, (error) => {
                        videoController.playNextVideo(video.partyId, (error, video) => {
                            if (!error) {
                                console.log("Playing Next Video: " + video['title']);
                            }
                        })
                    })
                }
            }
        })
    }

    route(app: any, socket: SocketIO.Socket, ds: IQueryable, pool: IResourcePool) {
        let videoSearch = new VideoSearchController(ds);
        let playlist = new PlaylistController(ds, pool);
        let party = new PartyController(ds, pool);
        let videoController = new VideoController(ds, pool);
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
                            })
                        } else {
                            res.json({
                                success: false,
                                error: error
                            })
                        }
                    })
                }
            })
        })

        app.get("/party/self/playlist", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            party.currentParty(user['id'], (error, party) => {
                if (!error) {
                    playlist.getMySortedPlaylist(user['id'], party['id'], RankTypes["Wilson Lower Bound"], (error, playlist) => {
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
                }
            })
        })

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