import * as querystring from 'querystring';
import App from './App'
import ReQL from './DataLayer/Database/ReQL';
import * as BodyParser from 'body-parser';
import AuthRoutes from './IOLayer/implementation/AuthRoutes';
import UserRoutes from './IOLayer/implementation/UserRoutes';
import PartyRoutes from './IOLayer/implementation/PartyRoutes';
import ResourcePool from './IOLayer/implementation/ResourcePool';
import MySQL from './DataLayer/Database/MySQL';
import VideoSearchController from './BusinessLayer/Implementation/VideoSearchController';
import VideoRoutes from './IOLayer/implementation/VideoRoutes';
import Config from './Helpers/ConfigHelper';
import PlaylistRoutes from './IOLayer/implementation/PlaylistRoutes';
import RankHelper, { RankTypes } from './Helpers/RankHelper';
import TestRoutes from './IOLayer/implementation/TestRoutes';
import { EventTimer } from './IOLayer/implementation/EventTimer';




const port = 8080

let db = new MySQL();


let mainApp = new App(db, new ResourcePool(
    [
        "Party"
    ]
), [
    new AuthRoutes(),
    new UserRoutes(),
    new PartyRoutes(),
    new VideoRoutes(),
    new PlaylistRoutes(),
    new TestRoutes()
]);

let app = mainApp.express;
let server = mainApp.Server;

mainApp.mountRoutes([
    new AuthRoutes(),
    new UserRoutes(),
    new PartyRoutes(),
    new VideoRoutes(),
    new PlaylistRoutes(),
    new TestRoutes()
]);

server.listen(process.env.PORT || port);
