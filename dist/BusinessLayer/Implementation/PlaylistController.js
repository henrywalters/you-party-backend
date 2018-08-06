"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Playlist_1 = require("../../DataLayer/Domain/Playlist");
const Party_1 = require("../../DataLayer/Domain/Party");
const PartyGuest_1 = require("../../DataLayer/Domain/PartyGuest");
const Vote_1 = require("../../DataLayer/Domain/Vote");
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
    }
    addToPlaylist(guestId, partyId, videoId, cb) {
        this._Guest.getWhere({ guestId: guestId }, (error, guests) => {
            console.log(guests);
            if (guests.length === 0 || guests[0]['partyId'] !== partyId) {
                cb("User not in party", null);
            }
            else {
                this._Playlist.getWhere({ videoId: videoId, status: "queued" }, (error, videos) => {
                    if (videos.length > 0) {
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
                                cb(null, video);
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
                            if (error || votes.length === 0) { // add a new vote - no logic required 
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
        this.vote(guestId, playlistId, "up", cb);
    }
    downvote(guestId, playlistId, cb) {
        this.vote(guestId, playlistId, "down", cb);
    }
}
exports.default = PlaylistController;
//# sourceMappingURL=PlaylistController.js.map