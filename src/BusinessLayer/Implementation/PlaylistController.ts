import IQueryable from '../../DataLayer/Interface/IQueryable';
import Playlist from '../../DataLayer/Domain/Playlist';
import Party from '../../DataLayer/Domain/Party';
import PartyGuest from '../../DataLayer/Domain/PartyGuest';
import IResourcePool from '../../IOLayer/interface/IResourcePool';
import Vote from '../../DataLayer/Domain/Vote';
import { RankTypes, ISortable } from '../../Helpers/RankHelper';
import RankHelper from '../../Helpers/RankHelper';
import { IPlaylistVideo } from '../../DataLayer/Domain/Playlist';
import VideoController from './VideoController';

export default class PlaylistController {
    private DataSource: IQueryable;
    private ResourcePool: IResourcePool;
    private _Playlist: Playlist;
    private _Party: Party;
    private _Guest: PartyGuest;
    private _Vote: Vote;

    private _VideoController: VideoController;
    
    constructor(ds: IQueryable, resourcePool: IResourcePool) {
        this.DataSource = ds;
        this._Playlist = new Playlist();
        this._Playlist.setDataSource(ds);
        this._Party = new Party();
        this._Party.setDataSource(ds);
        this._Guest = new PartyGuest();
        this._Guest.setDataSource(ds);
        this._Vote = new Vote();
        this._Vote.setDataSource(ds);
        
        this.ResourcePool = resourcePool;
        this._VideoController = new VideoController(this.DataSource, this.ResourcePool);

        
    }

    addToPlaylist(guestId: string, partyId: string, videoId: string, cb: {(error: string, video: Object): void}): void {
        this._Guest.getWhere({guestId: guestId}, (error, guests) => {
            console.log(guests[0], partyId, guests[0]);
            if (guests.length === 0 || guests[0]['partyId'] !== partyId) {
                cb("User not in party", null);
            } else {
                this._Playlist.getWhere({videoId: videoId, partyId: partyId, status: "queued"}, (error, videos) => {
                    if (videos.length > 0) {
                        console.log(videos);
                        cb("Video already in playlist", null);
                    } else {
                        this._Playlist.create({
                            partyId: partyId,
                            videoId: videoId,
                            guestId: guestId,
                            status: "queued"
                        },(error, video) => {
                            if (!error) {
                                console.log(video);
                                console.log("Successfully added, searching video in palylist");
                                this._Playlist.getPlaylistVideo(video['id'], (error, video) => {
                                    video = this.ResourcePool.insertSubListResource("Party-" + partyId, "Playlist", video);
                                    this._VideoController.playNextVideo(partyId, (error, video) => {
                                        
                                    })
                                    cb(null, video);
                                })
                            }
                        });
                    }
                })
            }
        })
    }

    

    getPlaylist(partyId: string, cb: {(error: string, playlist: Array<Object>): void}) {
        this._Playlist.getPlaylist(partyId, (error, res) => {
            cb(error, res);
        })
    }

    getMySortedPlaylist(userId: string, partyId: string, rankType: RankTypes, cb: {(error: string, playlist: Array<Object>): void}) {
        this._Playlist.getMyPlaylist(userId, partyId, (error, playlist) => {
            playlist = RankHelper.Sort(rankType, playlist);
            cb(error, playlist);
        })
    }

    getSortedPlaylist(partyId: string, rankType: RankTypes, cb: {(error: string, playlist: Array<Object>): void}) {
        this._Playlist.getPlaylist(partyId, (error, playlist) => {
            playlist = RankHelper.Sort(rankType, playlist);
            cb(error, playlist);
        })
    }

    getNextPlaylistVideo(partyId: string): ISortable {
        let video = this.ResourcePool.getSubListResource("Party-" + partyId, "Playlist", 0);
        return video;
    }

    async voteAsync(guestId: string, playlistId: string, type: string): Promise<Object> {

        const freeVoteTest = false;

        let video = await this._Playlist.getPlaylistVideoAsync(playlistId);

        let guests = await this._Guest.getWhereAsync({guestId: guestId});

        if (guests.length === 0 || guests[0]['partyId'] !== video['partyId']) {
            console.log("Guest not in party");
            throw new Error("Guest does not exist/is not in party");
        }

        let votes = await this._Vote.getWhereAsync({ guestId: guestId, playlistId: playlistId});

        let addVote = true;

        if (votes.length > 1 && !freeVoteTest) {
            console.log("Already voted on video");
            for (let i = 0; i < votes.length; i++) {
                await this._Vote.destroyAsync(votes[i]['id']);
            }
            return new Promise<Object> (res => {
                throw new Error("Video already has a vote but freeVoteTest is false. This should never happen");
                res("Vote failure");
            })
            
        }
        
        if (votes.length === 1) {
            let oldType = votes[0]['type'];

            await this._Vote.destroyAsync(votes[0]['id']).catch((error) => {console.log(error)});

            if (oldType === type) {
                addVote = false;
            }
        }

        if (addVote) {
            let vote = await this._Vote.createAsync({
                guestId: guestId,
                playlistId: playlistId,
                type: type
            });
        }
 
        let modifiedVideo = await this._Playlist.getPlaylistVideoAsync(playlistId);
        
        let rankedVideo = await this.ResourcePool.swapSubListResource<ISortable>("Party-" + video['partyId'], "Playlist", video, modifiedVideo);   

        return new Promise<Object> (respond => {
            respond(rankedVideo);
        })

    }

    private vote(guestId: string, playlistId: string, type: string, cb: {(error: string, vote: Object): void}) {
        /*this._Playlist.get(playlistId, (error, playlist) => {
            if (error || typeof playlist === 'undefined') {
                cb("Playlist does not exist", null);
            } else {
                this._Guest.getWhere({guestId: guestId}, (error, guests) => {
                    if (guests.length === 0 || guests[0]['partyId'] !== playlist['partyId']) {
                        cb("User not in party", null);
                    } else {
                        this._Vote.getWhere({guestId: guestId, playlistId: playlistId}, (error, votes) => {

                            let freeVoteTest = true;

                            if (error || votes.length === 0 || freeVoteTest) { // add a new vote - no logic required 
                                console.log("Sending: ");
                                console.log({
                                    guestId: guestId,
                                    playlistId: playlistId,
                                    type: type
                                });

                                this._Vote.create({
                                    guestId: guestId,
                                    playlistId: playlistId,
                                    type: type
                                }, (error, vote) => {
                                    if (error) {
                                        cb("Vote failed to create", null);
                                    } else {
                                        this.ResourcePool.createSubResource("Party-" + playlist['partyId'], "Votes", {
                                            guestId: guestId,
                                            playlistId: playlistId,
                                            type: type
                                        })
                                        console.log(playlistId);
                                        this._Playlist.getPlaylistVideo(playlistId, (error, video) => {
                                            console.log(error, video);
                                            if (!error) {
                                                video = this.ResourcePool.swapSubListResource("Party-" + playlist['partyId'], "Playlist", video);
                                                cb(null, video);
                                            } else {
                                                cb("Video not found", null);
                                            }
                                        })
                                    }
                                })
                            } else { 
                                //Vote truth table:
                                /*
                                        up  down
                                    up  delete   update to up
                                    down update to down delete
                                */
/*
                                let vote = votes[0];

                                if (vote['type'] === type) {
                                    this._Vote.destroy(vote['id'], (success) => {
                                        
                                        this.ResourcePool.destroySubResource("Party-" + playlist['partyId'], "Votes", {
                                            id: vote['id'], 
                                            guestId: guestId,
                                            playlistId: playlistId,
                                            type: type
                                        })

                                        this._Playlist.getPlaylistVideo(playlistId, (error, video) => {
                                            console.log(video);
                                            if (!error) {
                                                video = this.ResourcePool.swapSubListResource("Party-" + playlist['partyId'], "Playlist", video);
                                                cb(null, video);
                                            } else {
                                                cb("Video not found", null);
                                            }
                                        })
                                    })
                                } else {
                                    let newType = type === "up" ? "down" : "up"; //swap the type
                                    this._Vote.update(vote['id'], {
                                        type: newType
                                    }, (error, vote) => {
                                        if (error) {
                                            cb("Vote failed to update", null);
                                        } else {
                                            this.ResourcePool.updateSubResource("Party-" + playlist['partyId'], "Votes", {
                                                guestId: guestId,
                                                playlistId: playlistId,
                                                type: newType
                                            })

                                            this._Playlist.getPlaylistVideo(playlistId, (error, video) => {
                                                console.log(error, video);
                                                if (!error) {
                                                    video = this.ResourcePool.swapSubListResource("Party-" + playlist['partyId'], "Playlist", video);
                                                    cb(null, video);
                                                } else {
                                                    cb("Video not found", null);
                                                }
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
        })
        */
    }

    public upvote(guestId: string, playlistId: string, cb: {(error: string, vote: Object): void}) {
        console.log("Upvoting");
        this.vote(guestId, playlistId, "up", cb);
    }

    public async upvoteAsync(guestId: string, playlistId: string): Promise<Object> {
        return await this.voteAsync(guestId, playlistId, "up");
    }

    public downvote(guestId: string, playlistId: string, cb: {(error: string, vote: Object): void}) {
        console.log("Downvoting");
        this.vote(guestId, playlistId, "down", cb);
    }

    public async downvoteAsync(guestId: string, playlistId: string): Promise<Object> {
        return await this.voteAsync(guestId, playlistId, "down");
    }
}