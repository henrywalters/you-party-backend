"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const BodyParser = require("body-parser");
const SocketIO = require("socket.io");
const http_1 = require("http");
class App {
    constructor(datasource, resourcepool, routes) {
        this.express = express();
        this.router = express.Router();
        this.express.use(BodyParser.json());
        this.DataSource = datasource;
        this.ResourcePool = resourcepool;
        //initialize socket server
        this.Server = http_1.createServer(this.express);
        this.IO = SocketIO.listen(this.Server);
        this.IO.on('connect', (socket) => {
            console.log("client connected");
            this.Socket = socket;
            socket.on('join-resource', (resource) => {
                console.log("Joining resource: " + resource);
                this.ResourcePool.joinPool(resource, socket);
            });
            socket.on('join-sub-resource', (resource) => {
                this.ResourcePool.joinSubPool(resource.resource, resource.subIndex, socket);
            });
            this.mountRoutes(routes);
        });
    }
    mountRoutes(routes) {
        this.express.use(function (req, res, next) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, authorization");
            next();
        });
        for (let i = 0; i < routes.length; i++) {
            routes[i].route(this.router, this.Socket, this.DataSource, this.ResourcePool);
        }
        this.express.use('/', this.router);
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map