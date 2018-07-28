"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserController_1 = require("../../BusinessLayer/Implementation/UserController");
const RouterHelper_1 = require("../../Helpers/RouterHelper");
const Auth_1 = require("../../AuthLayer/implementation/Auth");
class UserRoutes {
    route(app, socket, ds, pool) {
        let user = new UserController_1.default(ds);
        let auth = new Auth_1.default(ds);
        app.get("/self", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            res.json({
                success: true,
                self: user
            });
        });
        console.log("Adding User Routes");
        app.post("/user", (req, res) => {
            let required = ["username", "email", "password", "confirm"];
            console.log("posted user");
            if (RouterHelper_1.default.matchBody(required, req.body)) {
                console.log("body match");
                if (req.body.password === req.body.confirm) {
                    user.newUser(req.body.username, req.body.email, req.body.password, (error, user) => {
                        if (error) {
                            res.json({
                                success: false,
                                error: error
                            });
                        }
                        else {
                            res.json({
                                success: true,
                                user: user
                            });
                        }
                    });
                }
                else {
                    res.json({
                        success: false,
                        error: "Passwords don't match"
                    });
                }
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
exports.default = UserRoutes;
//# sourceMappingURL=UserRoutes.js.map