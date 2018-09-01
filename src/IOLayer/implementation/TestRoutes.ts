import IResourceRouter from "../interface/IResourceRouter";
import IResourcePool from "../interface/IResourcePool";
import IQueryable from "../../DataLayer/Interface/IQueryable";
import Auth from "../../AuthLayer/implementation/Auth";
import PlaylistTests from "../../Tests/PlaylistTests";

export default class TestRoutes implements IResourceRouter {
    route(app: any, socket: SocketIO.Socket,  ds: IQueryable, pool: IResourcePool) {
        let auth = new Auth(ds);
        
        app.get("/test/party/:partyId/random-votes/:quantity", (req, res) => {
            auth.validateHeader(req,res);
            let user = auth.getSelf(req);

            let playlistTests = new PlaylistTests(ds, pool);

            playlistTests.randomVotes(req.params.partyId, user['id'], req.params.quantity);
        }) 
    }
}