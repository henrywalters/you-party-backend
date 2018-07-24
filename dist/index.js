"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("./App");
const ReQL_1 = require("./DataLayer/Database/ReQL");
const AuthRoutes_1 = require("./IOLayer/implementation/AuthRoutes");
const UserRoutes_1 = require("./IOLayer/implementation/UserRoutes");
const PartyRoutes_1 = require("./IOLayer/implementation/PartyRoutes");
const ResourcePool_1 = require("./IOLayer/implementation/ResourcePool");
const port = 3000;
let db = new ReQL_1.default();
db.connect("YouParty", (error, res) => {
    if (!error) {
        let app = new App_1.default(db, new ResourcePool_1.default([
            "Party"
        ]), [
            new AuthRoutes_1.default(),
            new UserRoutes_1.default(),
            new PartyRoutes_1.default()
        ]).express;
        app.listen(port, ((err) => {
            if (err) {
                return console.log(err);
            }
        }));
    }
    else {
        console.log(error);
    }
});
//# sourceMappingURL=index.js.map