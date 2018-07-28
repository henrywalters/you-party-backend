"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = require("../../AuthLayer/implementation/Auth");
class AuthRoutes {
    route(app, socket, ds, pool) {
        let auth = new Auth_1.default(ds);
        app.post("/login", (req, res) => {
            console.log(req.body);
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
        app.post("/refresh", (req, res) => {
            if (typeof req.body.refreshToken !== undefined) {
                auth.refreshToken(req.body.refreshToken, (jwt) => {
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
            }
        });
    }
}
exports.default = AuthRoutes;
//# sourceMappingURL=AuthRoutes.js.map