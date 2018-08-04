import IResourceRouter from "../interface/IResourceRouter";
import IQueryable from "../../DataLayer/Interface/IQueryable";
import IResourcePool from "../interface/IResourcePool";
import VideoSearchController from '../../BusinessLayer/Implementation/VideoSearchController';

export default class UserRoutes implements IResourceRouter {
    route(app: any, socket: SocketIO.Socket, ds: IQueryable, pool: IResourcePool) {
        let videoSearch = new VideoSearchController(ds);

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
    }
}