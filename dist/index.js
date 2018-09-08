"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("./App");
const AuthRoutes_1 = require("./IOLayer/implementation/AuthRoutes");
const UserRoutes_1 = require("./IOLayer/implementation/UserRoutes");
const PartyRoutes_1 = require("./IOLayer/implementation/PartyRoutes");
const ResourcePool_1 = require("./IOLayer/implementation/ResourcePool");
const MySQL_1 = require("./DataLayer/Database/MySQL");
const VideoSearchController_1 = require("./BusinessLayer/Implementation/VideoSearchController");
const VideoRoutes_1 = require("./IOLayer/implementation/VideoRoutes");
const PlaylistRoutes_1 = require("./IOLayer/implementation/PlaylistRoutes");
const TestRoutes_1 = require("./IOLayer/implementation/TestRoutes");
const port = 8080;
let db = new MySQL_1.default();
let v = new VideoSearchController_1.default(db);
v.search('tool', videos => {
    console.log(videos);
});
let mainApp = new App_1.default(db, new ResourcePool_1.default([
    "Party"
]), [
    new AuthRoutes_1.default(),
    new UserRoutes_1.default(),
    new PartyRoutes_1.default(),
    new VideoRoutes_1.default(),
    new PlaylistRoutes_1.default(),
    new TestRoutes_1.default()
]);
let app = mainApp.express;
let server = mainApp.Server;
mainApp.mountRoutes([
    new AuthRoutes_1.default(),
    new UserRoutes_1.default(),
    new PartyRoutes_1.default(),
    new VideoRoutes_1.default(),
    new PlaylistRoutes_1.default(),
    new TestRoutes_1.default()
]);
server.listen(process.env.PORT || port);
//# sourceMappingURL=index.js.map