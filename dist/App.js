"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const BodyParser = require("body-parser");
const SocketIO = require("socket.io");
const http_1 = require("http");
const Party_1 = require("./DataLayer/Domain/Party");
const Playlist_1 = require("./DataLayer/Domain/Playlist");
const RankHelper_1 = require("./Helpers/RankHelper");
const PlaylistController_1 = require("./BusinessLayer/Implementation/PlaylistController");
const Events = require("events");
const VideoController_1 = require("./BusinessLayer/Implementation/VideoController");
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
        let playlistObject = new Playlist_1.default();
        playlistObject.setDataSource(this.DataSource);
        let playlistController = new PlaylistController_1.default(this.DataSource, this.ResourcePool);
        let videoController = new VideoController_1.default(this.DataSource, this.ResourcePool);
        partyObject.getAll((error, parties) => {
            console.log("Got Parties");
            parties.map(party => {
                playlistController.getSortedPlaylist(party['id'], RankHelper_1.RankTypes["Wilson Lower Bound"], (error, playlist) => {
                    let sortablePlaylist = playlist.map(video => {
                        console.log(video);
                        return {
                            id: video['id'],
                            upvotes: video['upvotes'],
                            downvotes: video['downvotes'],
                            timeAdded: video['timeAdded'],
                            title: video['title'],
                            videoId: video['videoId'],
                            descriptino: video['description'],
                            videoKey: video['videoKey'],
                            duration: video['duration'],
                            licensedContent: video['licensedContent']
                        };
                    });
                    resourcepool.createPool("Party-" + party['id']);
                    resourcepool.createSubListPool("Party-" + party['id'], "Playlist", RankHelper_1.RankTypes["Wilson Lower Bound"], sortablePlaylist);
                    resourcepool.createSubPool("Party-" + party['id'], "Votes");
                    resourcepool.createSubPool("Party-" + party['id'], "Video");
                    videoController.playNextVideo(party['id'], (error, video) => {
                        console.log(error, video);
                    });
                });
            });
        });
        let events = new Events.EventEmitter();
        events.on('list-sync-failure', (resource) => {
            console.log("LIST SYNC FAILED");
            console.log(resource);
        });
        events.on('list-sync-success', (resource) => {
            console.log("LIST SYNC SUCCEEDED");
            console.log(resource);
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
            socket.on('join-sub-list-resource', (resource) => {
                console.log("Joined Sub List Resource");
                this.ResourcePool.joinSubListPool(resource.resource, resource.subIndex, socket);
            });
            routes.map(route => {
                if (route['routeSocket']) {
                    console.log("Socket Routing: " + route.toString());
                    route['routeSocket'](socket, this.DataSource, this.ResourcePool);
                }
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