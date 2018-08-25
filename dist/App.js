"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const BodyParser = require("body-parser");
const SocketIO = require("socket.io");
const http_1 = require("http");
const Party_1 = require("./DataLayer/Domain/Party");
class App {
    constructor(datasource, resourcepool, routes) {
        this.express = express();
        this.router = express.Router();
        this.express.use(BodyParser.json());
        this.DataSource = datasource;
        this.ResourcePool = resourcepool;
        //initialize the resource pools from existing parties existed. 
        //without doing this, an error will be thrown. This is intentional. 
        let partyObject = new Party_1.default();
        partyObject.setDataSource(this.DataSource);
        partyObject.getAll((error, parties) => {
            console.log("Got Parties");
            parties.map(party => {
                console.log(partyObject);
                resourcepool.createPool("Party-" + party['id']);
                resourcepool.createSubPool("Party-" + party['id'], "Playlist");
                resourcepool.createSubPool("Party-" + party['id'], "Votes");
                console.log("Initializing pool for party: " + party['name']);
            });
        });
        //initialize socket server
        this.Server = http_1.createServer(this.express);
        this.IO = SocketIO.listen(this.Server);
        this.IO.on('connect', (socket) => {
            this.Socket = socket;
            socket.on('join-resource', (resource) => {
                this.ResourcePool.joinPool(resource, socket);
            });
            socket.on('join-sub-resource', (resource) => {
                this.ResourcePool.joinSubPool(resource.resource, resource.subIndex, socket);
            });
        });
        this.mountRoutes(routes);
        setInterval(() => {
            this.IO.emit("Server-Time", new Date());
        }, 1000);
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
            routes[i].route(this.router, this.Server, this.DataSource, this.ResourcePool);
        }
        this.express.use('/', this.router);
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map