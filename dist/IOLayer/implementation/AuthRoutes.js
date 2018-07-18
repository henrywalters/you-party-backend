"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = require("../../AuthLayer/implementation/Auth");
class AuthRoutes {
    route(app, ds) {
        let auth = new Auth_1.default(ds);
        app.post("/login", (req, res) => {
            console.log("Posting");
            auth.login(req.body.username, req.body.password, (jwt) => {
                if (jwt) {
                    res.json({
                        success: true,
                        tokens: jwt
                    });
                }
                else {
                    res.json({
                        success: false
                    });
                }
            });
        });
    }
}
exports.default = AuthRoutes;
//# sourceMappingURL=AuthRoutes.js.map