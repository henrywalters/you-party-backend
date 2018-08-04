"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Playlist_1 = require("../../DataLayer/Domain/Playlist");
const Party_1 = require("../../DataLayer/Domain/Party");
const PartyGuest_1 = require("../../DataLayer/Domain/PartyGuest");
class PlaylistController {
    constructor(ds, resourcePool) {
        this.DataSource = ds;
        this._Playlist = new Playlist_1.default();
        this._Playlist.setDataSource(ds);
        this._Party = new Party_1.default();
        this._Party.setDataSource(ds);
        this._Guest = new PartyGuest_1.default();
        this._Guest.setDataSource(ds);
    }
    addToPlaylist(guestId, partyId, videoId, cb) {
        this._Guest.getWhere({ guestId: guestId }, (error, guests) => {
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
}
exports.default = PlaylistController;
//# sourceMappingURL=PlaylistController.js.map