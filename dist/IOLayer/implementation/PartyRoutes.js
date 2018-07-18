"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = require("../../AuthLayer/implementation/Auth");
const PartyController_1 = require("../../BusinessLayer/Implementation/PartyController");
const RouterHelper_1 = require("../../Helpers/RouterHelper");
class PartyRoutes {
    route(app, ds) {
        let auth = new Auth_1.default(ds);
        let party = new PartyController_1.default(ds);
        app.post("/party", (req, res) => {
            auth.validateHeader(req, res);
            let required = ["name"];
            if (RouterHelper_1.default.matchBody(required, req.body)) {
                party.newParty(req.body.name, (error, party) => {
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
    }
}
exports.default = PartyRoutes;
//# sourceMappingURL=PartyRoutes.js.map