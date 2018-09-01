import IQueryable from '../DataLayer/Interface/IQueryable';
import ResourcePool from '../IOLayer/implementation/ResourcePool';
import IResourcePool from '../IOLayer/interface/IResourcePool';
import PlaylistController from '../BusinessLayer/Implementation/PlaylistController';
import Playlist from '../DataLayer/Domain/Playlist';


function randomInt(n: number): number {
    return Math.floor(Math.random() * 100); 
}

export default class PlaylistTests {
    DataSource: IQueryable;
    ResourcePool: IResourcePool;
    PlaylistController: PlaylistController;
    PlaylistObject: Playlist;

    constructor(ds: IQueryable, rp: IResourcePool) {
        this.DataSource = ds;
        this.ResourcePool = rp;
        this.PlaylistController = new PlaylistController(ds, rp);
        this.PlaylistObject = new Playlist();
        this.PlaylistObject.setDataSource(ds);

    }

    async randomVotes(partyId: string, guestId: string, quantity: number): Promise<void> {
        let playlist = await this.PlaylistObject.getPlaylistAsync(partyId);
        let n = playlist.length;

        for (let i = 0; i < quantity; i++) {
            let r1 = randomInt(n);
            let r2 = (randomInt(2) === 0) ? "up" : "down";
            let vote = this.PlaylistController.voteAsync(guestId, playlist[r1].id, r2);
        }
    }
}