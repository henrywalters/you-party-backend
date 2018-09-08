"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Playlist_1 = require("../../DataLayer/Domain/Playlist");
class VideoController {
    constructor(ds, rp) {
        this.DataSource = ds;
        this.ResourcePool = rp;
        this.IsPlaying = false;
        this._Playlist = new Playlist_1.default();
        this._Playlist.setDataSource(this.DataSource);
    }
    getPlayingVideo(partyId, cb) {
        this._Playlist.getWhere({ partyId: partyId, status: "playing" }, (error, video) => {
            if (!error) {
                if (video.length === 0) {
                    cb("No Video is Playing", null);
                }
                else {
                    cb(null, video[0]);
                }
            }
        });
    }
    endPlayingVideo(partyId, cb) {
        this.getPlayingVideo(partyId, (error, video) => {
            if (!error) {
                this.setVideoStatus(video['id'], "played", (error) => {
                    if (!error) {
                        cb(null);
                    }
                    else {
                        cb("Failed to end video");
                    }
                });
            }
            else {
                cb("No Video Playing");
            }
        });
    }
    playNextVideo(partyId, cb) {
        this.getPlayingVideo(partyId, (error, video) => {
            console.log(video);
            if (video !== null) {
                cb("Video already playing", null);
            }
            else {
                let nextVideo = this.ResourcePool.getSubListResource("Party-" + partyId, "Playlist", 0);
                if (nextVideo !== null) {
                    nextVideo['eventType'] = 'new';
                    this.ResourcePool.updateSubResource("Party-" + partyId, "Video", nextVideo);
                    this.setVideoStatus(nextVideo['id'], 'playing', (error) => {
                        if (!error) {
                            this.ResourcePool.removeSubListResource("Party-" + partyId, "Playlist", nextVideo);
                            let pool = this.ResourcePool.getSubPool("Party-" + partyId, "Video");
                            if (pool !== null) {
                                let event = pool.EventTimer;
                                event.newEvent(nextVideo['duration'] * 1000, () => {
                                    nextVideo['eventType'] = 'end';
                                    this.ResourcePool.updateSubResource("Party-" + partyId, "Video", nextVideo);
                                    console.log("Finished Playing Video: " + nextVideo['title']);
                                    this.endPlayingVideo(partyId, (error) => {
                                        if (!error) {
                                            this.playNextVideo(partyId, (error, video) => {
                                            });
                                        }
                                    });
                                }, () => {
                                    nextVideo['eventType'] = 'start';
                                    this.ResourcePool.updateSubResource("Party-" + partyId, "Video", nextVideo);
                                    console.log("Playing Video: " + nextVideo['title']);
                                }, () => {
                                    nextVideo['eventType'] = 'stop';
                                    this.ResourcePool.updateSubResource("Party-" + partyId, "Video", nextVideo);
                                    console.log("Finished Playing Video: " + nextVideo['title']);
                                });
                                console.log("Duration: " + nextVideo['duration']);
                                event.startEvent();
                                cb(null, nextVideo);
                            }
                            else {
                                cb("Pool does not exist", null);
                            }
                        }
                        else {
                            cb("Video failed to set to playing", null);
                        }
                    });
                }
                else {
                    cb("No video in queue", null);
                }
            }
        });
    }
    setVideoStatus(playlistId, status, cb) {
        this._Playlist.update(playlistId, {
            status: status
        }, (error, res) => {
            if (!error) {
                console.log(res);
                cb(null);
            }
        });
    }
}
exports.default = VideoController;
//# sourceMappingURL=VideoController.js.map