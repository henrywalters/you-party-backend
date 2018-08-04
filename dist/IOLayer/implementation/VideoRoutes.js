"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VideoSearchController_1 = require("../../BusinessLayer/Implementation/VideoSearchController");
class UserRoutes {
    route(app, socket, ds, pool) {
        let videoSearch = new VideoSearchController_1.default(ds);
        app.get("/video", (req, res) => {
            if (typeof req.query.q != 'undefined') {
                videoSearch.search(req.query.q, (videos) => {
                    res.json({
                        success: true,
                        videos: videos
                    });
                });
            }
            else {
                res.json({
                    success: false,
                    error: "Expected query"
                });
            }
        });
    }
}
exports.default = UserRoutes;
//# sourceMappingURL=VideoRoutes.js.map