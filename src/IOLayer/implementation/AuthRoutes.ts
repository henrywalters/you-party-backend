import IResourceRouter from '../interface/IResourceRouter';
import IQueryable from '../../DataLayer/Interface/IQueryable';
import Auth from '../../AuthLayer/implementation/Auth';

export default class AuthRoutes implements IResourceRouter {
    route(app: any, ds: IQueryable) {
        let auth = new Auth(ds);

        app.post("/login", (req, res) => {
            console.log("Posting");

            auth.login(req.body.username, req.body.password, (jwt) => {
                if (jwt) {
                    res.json({
                        success: true,
                        tokens: jwt
                    });
                } else {
                    res.json({
                        success: false
                    })
                }
            })
        })
    }
}