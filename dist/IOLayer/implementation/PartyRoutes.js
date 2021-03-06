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
            console.log("Getting Parties");
            if (typeof req.query['k'] != 'undefined') {
                console.log(req.query);
                party.getPartyByKey(req.query['k'], (error, party) => {
                    if (error) {
                        res.json({
                            success: false,
                            error: "Party not found"
                        });
                    }
                    else {
                        res.json({
                            success: true,
                            party: party
                        });
                    }
                });
            }
            else if (typeof req.query['id'] != 'undefined') {
                party.getParty(req.query['id'], (error, party) => {
                    if (error) {
                        res.json({
                            success: false,
                            error: "Party not found"
                        });
                    }
                    else {
                        res.json({
                            success: true,
                            party: party
                        });
                    }
                });
            }
            else {
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
            }
        });
        app.get("/party/self", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            party.currentParty(user['id'], (error, party) => {
                if (error) {
                    res.json({
                        success: false,
                        error: "User is not in party"
                    });
                }
                else {
                    console.log(error, party);
                    res.json({
                        success: true,
                        party: party
                    });
                }
            });
        });
        app.get("/self/parties", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            party.getSelfParties(user['id'], (error, party) => {
                if (error) {
                    res.json({
                        success: false,
                        error: "User has no parties"
                    });
                }
                else {
                    console.log(error, party);
                    res.json({
                        success: true,
                        party: party
                    });
                }
            });
        });
        app.post("/party", (req, res) => {
            auth.validateHeader(req, res, "user");
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
            party.joinParty(req['params']['id'], user['id'], (error, guest) => {
                console.log(error, party);
                if (!error && typeof party !== undefined) {
                    res.json({
                        success: true,
                        guest: guest
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
        app.post("/party/:id/leave", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            party.leaveParty(req['params']['id'], user['id'], (error) => {
                res.json({
                    success: error
                });
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