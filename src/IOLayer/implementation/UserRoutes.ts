import IResourceRouter from "../interface/IResourceRouter";
import IQueryable from "../../DataLayer/Interface/IQueryable";
import UserController from "../../BusinessLayer/Implementation/UserController";
import RouterHelper from "../../Helpers/RouterHelper";
import Auth from "../../AuthLayer/implementation/Auth";

export default class UserRoutes implements IResourceRouter {
    route(app: any, ds: IQueryable) {
        let user = new UserController(ds);
        let auth = new Auth(ds);

        app.get("/self", (req, res) => {
            auth.validateHeader(req, res);

            let user = auth.getSelf(req);
            res.json({
                success: true,
                self: user
            })
        })

        app.post("/user", (req, res) => {
            let required = ["username", "email", "password", "confirm"];
            console.log("posted user");
            if (RouterHelper.matchBody(required, req.body)) {
                console.log("body match");
                if (req.body.password === req.body.confirm) {
                    user.newUser(req.body.username, req.body.email, req.body.password, (error, user) => {
                        if (error) {
                            res.json({
                                success: false,
                                error: error
                            })
                        } else {
                            res.json({
                                success: true,
                                user: user
                            })
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        error: "Passwords don't match"
                    })
                }
            } else {
                res.json({
                    success: false,
                    error: RouterHelper.matchBodyError(required, req.body)
                })
            }
        })
    }
}