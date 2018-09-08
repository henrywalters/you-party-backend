import IQueryable from '../../DataLayer/Interface/IQueryable';
import ResourcePool from '../../IOLayer/implementation/ResourcePool';
import IResourcePool from '../../IOLayer/interface/IResourcePool';
import Playlist from '../../DataLayer/Domain/Playlist';


export default class VideoController {
    private DataSource: IQueryable;
    private ResourcePool: IResourcePool;
    private _Playlist: Playlist;
    public IsPlaying: boolean;

    constructor(ds: IQueryable, rp: IResourcePool) {
        this.DataSource = ds;
        this.ResourcePool = rp;
        this.IsPlaying = false;

        this._Playlist = new Playlist();
        this._Playlist.setDataSource(this.DataSource);
    }

    getPlayingVideo(partyId: string, cb: {(error: string, video: Object): void}): void {
        this._Playlist.getWhere({partyId: partyId, status: "playing"}, (error, video) => {
            if (!error) {
                if (video.length === 0) {
                    cb("No Video is Playing", null);
                } else {
                    let playing = video[0];
                    let pool = this.ResourcePool.getSubPool("Party-" + partyId, "Video");
                    if (pool !== null) {
                        let event = pool.EventTimer;

                        playing['timeElapsed'] = event.getElapsedTime();
                        playing['timeRemaining'] = event.getRemainingTime();

                        cb(null, playing);
                    } else {
                        cb("Can't get elapsed time", null);
                    }
                }
            }
        })
    }

    endPlayingVideo(partyId: string, cb: {(error: string): void}): void {
        this.getPlayingVideo(partyId, (error, video) => {
            if (!error) {
                this.setVideoStatus(video['id'], "played", (error) => {
                    if (!error) {
                        cb(null);
                    } else {
                        cb("Failed to end video");
                    }
                })
            } else {
                cb("No Video Playing");
            }
        })
    }

    playNextVideo(partyId: string, cb: {(error: string, video: Object): void}): void {
        this.getPlayingVideo(partyId, (error, video) => {
            console.log(video);
            if (video !== null) {
                cb("Video already playing", null);
            } else {
                console.log(this);
                
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
                                
                                event.newEvent(nextVideo['duration'] * 1000, 
                                    () => {
                                        nextVideo['eventType'] = 'end';
                                        this.ResourcePool.updateSubResource("Party-" + partyId, "Video", nextVideo);
                                        console.log("Finished Playing Video: " + nextVideo['title']);
                                        this.endPlayingVideo(partyId, (error) => {
                                            if (!error) {
                                                this.playNextVideo(partyId, (error, video) => {
                                                
                                                });
                                            }
                                        })
                                    },() => {
                                        nextVideo['eventType'] = 'start';
                                        this.ResourcePool.updateSubResource("Party-" + partyId, "Video", nextVideo);
                                        console.log("Playing Video: " + nextVideo['title']);
                                    }, () => {
                                        nextVideo['eventType'] = 'stop';
                                        this.ResourcePool.updateSubResource("Party-" + partyId, "Video", nextVideo);
                                        console.log("Finished Playing Video: " + nextVideo['title']);
                                    })

                                    console.log("Duration: " + nextVideo['duration']);

                                    event.startEvent();

                                    cb(null, nextVideo);
                            } else {
                                cb("Pool does not exist", null);
                            }
                            
                            
                        } else {
                            cb("Video failed to set to playing", null);
                        }
                    })
                } else {
                    cb("No video in queue", null);
                }
            }
        })
    }

    setVideoStatus(playlistId: string, status: string, cb: {(error: string): void}): void {
        this._Playlist.update(playlistId, {
            status: status
        }, (error, res) => {
            if (!error) {
                console.log(res);
                cb(null);
            }
        })
    }
}