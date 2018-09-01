import IQueryable from '../DataLayer/Interface/IQueryable';
import ResourcePool from '../IOLayer/implementation/ResourcePool';
import IResourcePool from '../IOLayer/interface/IResourcePool';
import PlaylistController from '../BusinessLayer/Implementation/PlaylistController';
import Playlist from '../DataLayer/Domain/Playlist';


function randomInt(n: number): number {
    return Math.floor(Math.random() * n); 
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
            
            await setTimeout(() => {}, 50);
        }

        return new Promise<void> (response => {
            response();
        })
    }
}