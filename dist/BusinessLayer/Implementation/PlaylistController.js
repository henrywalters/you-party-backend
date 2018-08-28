"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Playlist_1 = require("../../DataLayer/Domain/Playlist");
const Party_1 = require("../../DataLayer/Domain/Party");
const PartyGuest_1 = require("../../DataLayer/Domain/PartyGuest");
const Vote_1 = require("../../DataLayer/Domain/Vote");
const RankHelper_1 = require("../../Helpers/RankHelper");
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
                                console.log("Successfully added, searching video in palylist");
                                this._Playlist.getPlaylistVideo(partyId, videoId, (error, video) => {
                                    console.log(video);
                                    this.ResourcePool.insertSubListResource("Party-" + partyId, "Playlist", video);
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
    getSortedPlaylist(partyId, rankType, cb) {
        this._Playlist.getPlaylist(partyId, (error, playlist) => {
            playlist = RankHelper_1.default.Sort(rankType, playlist);
            cb(error, playlist);
        });
    }
    vote(guestId, playlistId, type, cb) {
        this._Playlist.get(playlistId, (error, playlist) => {
            if (error || typeof playlist === 'undefined') {
                cb("Playlist does not exist", null);
            }
            else {
                this._Guest.getWhere({ guestId: guestId }, (error, guests) => {
                    if (guests.length === 0 || guests[0]['partyId'] !== playlist['partyId']) {
                        cb("User not in party", null);
                    }
                    else {
                        this._Vote.getWhere({ guestId: guestId, playlistId: playlistId }, (error, votes) => {
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
                                    }
                                    else {
                                        this.ResourcePool.createSubResource("Party-" + playlist['partyId'], "Votes", {
                                            guestId: guestId,
                                            playlistId: playlistId,
                                            type: type
                                        });
                                        cb(null, vote);
                                    }
                                });
                            }
                            else {
                                //Vote truth table:
                                /*
                                        up  down
                                    up  delete   update to up
                                    down update to down delete
                                */
                                let vote = votes[0];
                                if (vote['type'] === type) {
                                    this._Vote.destroy(vote['id'], (success) => {
                                        cb(null, null);
                                        this.ResourcePool.destroySubResource("Party-" + playlist['partyId'], "Votes", {
                                            id: vote['id'],
                                            guestId: guestId,
                                            playlistId: playlistId,
                                            type: type
                                        });
                                    });
                                }
                                else {
                                    let newType = type === "up" ? "down" : "up"; //swap the type
                                    this._Vote.update(vote['id'], {
                                        type: newType
                                    }, (error, vote) => {
                                        if (error) {
                                            cb("Vote failed to update", null);
                                        }
                                        else {
                                            this.ResourcePool.updateSubResource("Party-" + playlist['partyId'], "Votes", {
                                                guestId: guestId,
                                                playlistId: playlistId,
                                                type: newType
                                            });
                                            cb(null, vote);
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
    }
    upvote(guestId, playlistId, cb) {
        console.log("Upvoting");
        this.vote(guestId, playlistId, "up", cb);
    }
    downvote(guestId, playlistId, cb) {
        console.log("Downvoting");
        this.vote(guestId, playlistId, "down", cb);
    }
}
exports.default = PlaylistController;
//# sourceMappingURL=PlaylistController.js.map