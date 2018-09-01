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
const PlaylistController_1 = require("../BusinessLayer/Implementation/PlaylistController");
const Playlist_1 = require("../DataLayer/Domain/Playlist");
function randomInt(n) {
    return Math.floor(Math.random() * n);
}
class PlaylistTests {
    constructor(ds, rp) {
        this.DataSource = ds;
        this.ResourcePool = rp;
        this.PlaylistController = new PlaylistController_1.default(ds, rp);
        this.PlaylistObject = new Playlist_1.default();
        this.PlaylistObject.setDataSource(ds);
    }
    randomVotes(partyId, guestId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            let playlist = yield this.PlaylistObject.getPlaylistAsync(partyId);
            console.log(playlist);
            let n = playlist.length;
            console.log("Playlist Length: " + n);
            for (let i = 0; i < quantity; i++) {
                let r1 = randomInt(n);
                console.log("index: " + r1);
                console.log(playlist[r1]);
                let r2 = (randomInt(2) === 0) ? "up" : "down";
                let vote = this.PlaylistController.voteAsync(guestId, playlist[r1].id, r2);
                console.log(i + " out of " + quantity);
                return new Promise(response => {
                    response();
                });
            }
        });
    }
}
exports.default = PlaylistTests;
//# sourceMappingURL=PlaylistTests.js.map