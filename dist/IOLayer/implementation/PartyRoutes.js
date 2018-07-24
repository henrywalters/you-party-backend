"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = require("../../AuthLayer/implementation/Auth");
const PartyController_1 = require("../../BusinessLayer/Implementation/PartyController");
const RouterHelper_1 = require("../../Helpers/RouterHelper");
const TimerHelper_1 = require("../../Helpers/TimerHelper");
class PartyRoutes {
    route(app, socket, ds, pool) {
        let auth = new Auth_1.default(ds);
        let party = new PartyController_1.default(ds, pool);
        socket.on('create-party', (newParty) => {
            let t = new TimerHelper_1.default();
            let required = ["name", "jwt"];
            if (RouterHelper_1.default.matchBody(required, newParty)) {
                let user = auth.validateToken(newParty.jwt);
                if (user !== null) {
                    party.newParty(newParty.name, user['id'], (error, newParty) => {
                        console.log("Created Party");
                        t.stop();
                        console.log(t.toString());
                    });
                }
            }
        });
        /*socket.on('join-party', (newParty) => {
            let required = ["id", "jwt"];
            if (RouterHelper.matchBody(required, newParty)) {
                let user = auth.validateToken(newParty.jwt);
                party.joinParty(newParty.id, user['id'], (error, party) => {
                    if (!error) {
                        
                    }
                })
            }

        })
        */
        app.get("/party", (req, res) => {
            party.getParties((error, parties) => {
                if (error) {
                    res.json({
                        success: false,
                        error: error
                    });
                }
                else {
                    res.json({
                        success: true,
                        parties: parties
                    });
                }
            });
        });
        app.post("/party", (req, res) => {
            auth.validateHeader(req, res);
            let required = ["name"];
            let user = auth.getSelf(req);
            let userId = user["id"];
            if (RouterHelper_1.default.matchBody(required, req.body)) {
                party.newParty(req.body.name, userId, (error, party) => {
                    if (!error) {
                        res.json({
                            success: true,
                            party: party
                        });
                    }
                    else {
                        res.json({
                            success: false,
                            error: error
                        });
                    }
                });
            }
            else {
                res.json({
                    success: false,
                    error: RouterHelper_1.default.matchBodyError(required, req.body)
                });
            }
        });
        app.post("/party/:id/join", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            party.joinParty(req['params']['id'], user['id'], (error, party) => {
                console.log(error, party);
                if (!error && typeof party !== undefined) {
                    res.json({
                        success: true,
                        party: party
                    });
                }
                else {
                    res.json({
                        success: false,
                        error: error
                    });
                }
            });
        });
        app.delete("/party/:id", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            let userId = user['id'];
            party.deleteParty(req.params.id, userId, (success) => {
                res.json(success);
            });
        });
    }
}
exports.default = PartyRoutes;
//# sourceMappingURL=PartyRoutes.js.map