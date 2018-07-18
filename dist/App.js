"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const Auth_1 = require("./AuthLayer/implementation/Auth");
const BodyParser = require("body-parser");
const UserController_1 = require("./BusinessLayer/Implementation/UserController");
class App {
    constructor(datasource, routes) {
        this.express = express();
        this.router = express.Router();
        this.express.use(BodyParser.json());
        this.DataSource = datasource;
        this.mountRoutes(routes);
    }
    mountRoutes(routes) {
        let auth = new Auth_1.default(this.DataSource);
        let user = new UserController_1.default(this.DataSource);
        for (let i = 0; i < routes.length; i++) {
            routes[i].route(this.router, this.DataSource);
        }
        this.express.use('/', this.router);
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map