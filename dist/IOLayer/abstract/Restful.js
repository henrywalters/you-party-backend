"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const BodyParser = require("body-parser");
class Restful {
    constructor(datasource, routes) {
        this.DataObject = datasource;
        this.express = express();
        this.express.use(BodyParser.json());
        //this.router = this.express.Router()
        this.Routes = routes;
    }
    mountRoutes(cb) {
        for (let i = 0; i < this.Routes.length; i++) {
            console.log(this.Routes[i].Method + " " + this.Routes[i].Route);
            switch (this.Routes[i].Method) {
                case 'get':
                    this.express.get(this.Routes[i].Route, this.Routes[i].callback);
                    break;
                case 'post':
                    this.express.post(this.Routes[i].Route, this.Routes[i].callback);
                    break;
                case 'put':
                    this.express.put(this.Routes[i].Route, this.Routes[i].callback);
                    break;
                case 'delete':
                    this.express.delete(this.Routes[i].Route, this.Routes[i].callback);
                    break;
                default:
                    console.log("Invalid method for Rest");
            }
        }
        return this.express;
    }
}
exports.default = Restful;
//# sourceMappingURL=Restful.js.map