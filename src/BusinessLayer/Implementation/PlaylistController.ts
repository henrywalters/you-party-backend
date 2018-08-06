import IQueryable from '../../DataLayer/Interface/IQueryable';
import Playlist from '../../DataLayer/Domain/Playlist';
import Party from '../../DataLayer/Domain/Party';
import PartyGuest from '../../DataLayer/Domain/PartyGuest';
import IResourcePool from '../../IOLayer/interface/IResourcePool';
export default class PlaylistController {
    private DataSource: IQueryable;
    private _Playlist: Playlist;
    private _Party: Party;
    private _Guest: PartyGuest;
    
    constructor(ds: IQueryable, resourcePool: IResourcePool) {
        this.DataSource = ds;
        this._Playlist = new Playlist();
        this._Playlist.setDataSource(ds);
        this._Party = new Party();
        this._Party.setDataSource(ds);
        this._Guest = new PartyGuest();
        this._Guest.setDataSource(ds);
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
}