import IResourceRouter from "../interface/IResourceRouter";
import IQueryable from "../../DataLayer/Interface/IQueryable";
import IResourcePool from "../interface/IResourcePool";
import VideoSearchController from '../../BusinessLayer/Implementation/VideoSearchController';
import PlaylistController from '../../BusinessLayer/Implementation/PlaylistController';
import Auth from "../../AuthLayer/implementation/Auth";

export default class UserRoutes implements IResourceRouter {
    route(app: any, socket: SocketIO.Socket, ds: IQueryable, pool: IResourcePool) {
        let videoSearch = new VideoSearchController(ds);
        let playlist = new PlaylistController(ds, pool);
        let auth = new Auth(ds);

        app.get("/video", (req, res) => {
            if (typeof req.query.q != 'undefined') {
                videoSearch.search(req.query.q, (videos) => {
                    res.json({
                        success: true,
                        videos: videos
                    })
                })
            } else {
                res.json({
                    success: false,
                    error: "Expected query"
                })
            }
        })

        app.post("party/:partyId/add/:videoId", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            console.log(req.params.partyId, req.params.videoId, user['id']);
        });
    }
}