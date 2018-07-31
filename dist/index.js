"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("./App");
const AuthRoutes_1 = require("./IOLayer/implementation/AuthRoutes");
const UserRoutes_1 = require("./IOLayer/implementation/UserRoutes");
const PartyRoutes_1 = require("./IOLayer/implementation/PartyRoutes");
const ResourcePool_1 = require("./IOLayer/implementation/ResourcePool");
const MySQL_1 = require("./DataLayer/Database/MySQL");
const port = 8080;
let db = new MySQL_1.default();
db.query("", (error, res) => {
    console.log(error, res);
});
let mainApp = new App_1.default(db, new ResourcePool_1.default([
    "Party"
]), [
    new AuthRoutes_1.default(),
    new UserRoutes_1.default(),
    new PartyRoutes_1.default()
]);
let app = mainApp.express;
let server = mainApp.Server;
mainApp.mountRoutes([
    new AuthRoutes_1.default(),
    new UserRoutes_1.default(),
    new PartyRoutes_1.default()
]);
server.listen(process.env.PORT || port);
/*
let db = new ReQL();

db.connect("YouParty", (error, res) => {
    if (!error) {

        let app = new App(db, new ResourcePool(
            [
                "Party"
            ]
        ), [
            new AuthRoutes(),
            new UserRoutes(),
            new PartyRoutes()
        ]).express;

        app.listen(port, ((err) => {
            if (err) {
                return console.log(err);
            }
        }));

    } else {
        console.log(error);
    }
});

*/ 
//# sourceMappingURL=index.js.map