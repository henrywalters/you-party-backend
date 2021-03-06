"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Playlist_1 = require("../../DataLayer/Domain/Playlist");
const Party_1 = require("../../DataLayer/Domain/Party");
const PartyGuest_1 = require("../../DataLayer/Domain/PartyGuest");
const Vote_1 = require("../../DataLayer/Domain/Vote");
const RankHelper_1 = require("../../Helpers/RankHelper");
const VideoController_1 = require("./VideoController");
class PlaylistController {
    constructor(ds, resourcePool) {
        this.DataSource = ds;
        this._Playlist = new Playlist_1.default();
        this._Playlist.setDataSource(ds);
        this._Party = new Party_1.default();
        this._Party.setDataSource(ds);
        this._Guest = new PartyGuest_1.default();
        this._Guest.setDataSource(ds);
        this._Vote = new Vote_1.default();
        this._Vote.setDataSource(ds);
        this.ResourcePool = resourcePool;
        this._VideoController = new VideoController_1.default(this.DataSource, this.ResourcePool);
    }
    addToPlaylist(guestId, partyId, videoId, cb) {
        this._Guest.getWhere({ guestId: guestId }, (error, guests) => {
            console.log(guests[0], partyId, guests[0]);
            if (guests.length === 0 || guests[0]['partyId'] !== partyId) {
                cb("User not in party", null);
            }
            else {
                this._Playlist.getWhere({ videoId: videoId, partyId: partyId, status: "queued" }, (error, videos) => {
                    if (videos.length > 0) {
                        console.log(videos);
                        cb("Video already in playlist", null);
                    }
                    else {
                        this._Playlist.create({
                            partyId: partyId,
                            videoId: videoId,
                            guestId: guestId,
                            status: "queued"
                        }, (error, video) => {
                            if (!error) {
                                console.log(video);
                                console.log("Successfully added, searching video in palylist");
                                this._Playlist.getPlaylistVideo(video['id'], (error, video) => {
                                    video = this.ResourcePool.insertSubListResource("Party-" + partyId, "Playlist", video);
                                    this._VideoController.playNextVideo(partyId, (error, video) => {
                                    });
                                    cb(null, video);
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    getPlaylist(partyId, cb) {
        this._Playlist.getPlaylist(partyId, (error, res) => {
            cb(error, res);
        });
    }
    getMySortedPlaylist(userId, partyId, rankType, cb) {
        this._Playlist.getMyPlaylist(userId, partyId, (error, playlist) => {
            playlist = RankHelper_1.default.Sort(rankType, playlist);
            cb(error, playlist);
        });
    }
    getSortedPlaylist(partyId, rankType, cb) {
        this._Playlist.getPlaylist(partyId, (error, playlist) => {
            playlist = RankHelper_1.default.Sort(rankType, playlist);
            cb(error, playlist);
        });
    }
    getNextPlaylistVideo(partyId) {
        let video = this.ResourcePool.getSubListResource("Party-" + partyId, "Playlist", 0);
        return video;
    }
    voteAsync(guestId, playlistId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const freeVoteTest = false;
            let video = yield this._Playlist.getPlaylistVideoAsync(playlistId);
            let guests = yield this._Guest.getWhereAsync({ guestId: guestId });
            if (guests.length === 0 || guests[0]['partyId'] !== video['partyId']) {
                console.log("Guest not in party");
                throw new Error("Guest does not exist/is not in party");
            }
            let votes = yield this._Vote.getWhereAsync({ guestId: guestId, playlistId: playlistId });
            let addVote = true;
            if (votes.length > 1 && !freeVoteTest) {
                console.log("Already voted on video");
                for (let i = 0; i < votes.length; i++) {
                    yield this._Vote.destroyAsync(votes[i]['id']);
                }
                return new Promise(res => {
                    throw new Error("Video already has a vote but freeVoteTest is false. This should never happen");
                    res("Vote failure");
                });
            }
            if (votes.length === 1) {
                let oldType = votes[0]['type'];
                yield this._Vote.destroyAsync(votes[0]['id']).catch((error) => { console.log(error); });
                if (oldType === type) {
                    addVote = false;
                }
            }
            if (addVote) {
                let vote = yield this._Vote.createAsync({
                    guestId: guestId,
                    playlistId: playlistId,
                    type: type
                });
            }
            let modifiedVideo = yield this._Playlist.getPlaylistVideoAsync(playlistId);
            let rankedVideo = yield this.ResourcePool.swapSubListResource("Party-" + video['partyId'], "Playlist", video, modifiedVideo);
            return new Promise(respond => {
                respond(rankedVideo);
            });
        });
    }
    vote(guestId, playlistId, type, cb) {
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
    upvote(guestId, playlistId, cb) {
        console.log("Upvoting");
        this.vote(guestId, playlistId, "up", cb);
    }
    upvoteAsync(guestId, playlistId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.voteAsync(guestId, playlistId, "up");
        });
    }
    downvote(guestId, playlistId, cb) {
        console.log("Downvoting");
        this.vote(guestId, playlistId, "down", cb);
    }
    downvoteAsync(guestId, playlistId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.voteAsync(guestId, playlistId, "down");
        });
    }
}
exports.default = PlaylistController;
//# sourceMappingURL=PlaylistController.js.map