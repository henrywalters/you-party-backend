"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = require("../../AuthLayer/implementation/Auth");
const PlaylistTests_1 = require("../../Tests/PlaylistTests");
class TestRoutes {
    route(app, socket, ds, pool) {
        let auth = new Auth_1.default(ds);
        app.get("/test/party/:partyId/random-votes", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            let playlistTests = new PlaylistTests_1.default(ds, pool);
            playlistTests.randomVotes(req.params.partyId, user['id'], 1000);
        });
    }
}
exports.default = TestRoutes;
//# sourceMappingURL=TestRoutes.js.map