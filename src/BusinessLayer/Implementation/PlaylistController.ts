import IQueryable from '../../DataLayer/Interface/IQueryable';
import Playlist from '../../DataLayer/Domain/Playlist';
import Party from '../../DataLayer/Domain/Party';
import PartyGuest from '../../DataLayer/Domain/PartyGuest';
import IResourcePool from '../../IOLayer/interface/IResourcePool';
import Vote from '../../DataLayer/Domain/Vote';
export default class PlaylistController {
    private DataSource: IQueryable;
    private _Playlist: Playlist;
    private _Party: Party;
    private _Guest: PartyGuest;
    private _Vote: Vote;
    
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
    }

    addToPlaylist(guestId: string, partyId: string, videoId: string, cb: {(error: string, video: Object): void}): void {
        this._Guest.getWhere({guestId: guestId}, (error, guests) => {
            console.log(guests);
            if (guests.length === 0 || guests[0]['partyId'] !== partyId) {
                cb("User not in party", null);
            } else {
                this._Playlist.getWhere({videoId: videoId, status: "queued"}, (error, videos) => {
                    if (videos.length > 0) {
                        cb("Video already in playlist", null);
                    } else {
                        this._Playlist.create({
                            partyId: partyId,
                            videoId: videoId,
                            guestId: guestId,
                            status: "queued"
                        },(error, video) => {
                            if (!error) {
                                cb(null, video);
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

    private vote(guestId: string, playlistId: string, type: string, cb: {(error: string, vote: Object): void}) {
        this._Playlist.get(playlistId, (error, playlist) => {
            if (error || typeof playlist === 'undefined') {
                cb("Playlist does not exist", null);
            } else {
                this._Guest.getWhere({guestId: guestId}, (error, guests) => {
                    if (guests.length === 0 || guests[0]['partyId'] !== playlist['partyId']) {
                        cb("User not in party", null);
                    } else {
                        this._Vote.getWhere({guestId: guestId, playlistId: playlistId}, (error, votes) => {
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
                                    } else {
                                        cb(null, vote);
                                    }
                                })
                            } else { 
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
                                    })
                                } else {
                                    let newType = type === "up" ? "down" : "up"; //swap the type
                                    this._Vote.update(vote['id'], {
                                        type: newType
                                    }, (error, vote) => {
                                        if (error) {
                                            cb("Vote failed to update", null);
                                        } else {
                                            cb(null, vote);
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
        })
    }

    public upvote(guestId: string, playlistId: string, cb: {(error: string, vote: Object): void}) {
        this.vote(guestId, playlistId, "up", cb);
    }

    public downvote(guestId: string, playlistId: string, cb: {(error: string, vote: Object): void}) {
        this.vote(guestId, playlistId, "down", cb);
    }
}