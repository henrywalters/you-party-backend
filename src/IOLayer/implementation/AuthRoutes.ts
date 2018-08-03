import IResourceRouter from '../interface/IResourceRouter';
import IQueryable from '../../DataLayer/Interface/IQueryable';
import Auth from '../../AuthLayer/implementation/Auth';
import IResourcePool from '../interface/IResourcePool';
import RouterHelper from '../../Helpers/RouterHelper';

export default class AuthRoutes implements IResourceRouter {
    route(app: any, socket: SocketIO.Socket,  ds: IQueryable, pool: IResourcePool) {
        let auth = new Auth(ds);

        app.post("/login", (req, res) => {
            console.log(req.body);
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

        app.post("/login/guest", (req, res) => {
            if (RouterHelper.matchBody(["name", "partyKey"], req.body)) {
                auth.guestLogin(req.body.name, req.body.partyKey, (jwt) => {
                    if (jwt) {
                        res.json({
                            success: true,
                            token: jwt
                        })
                    } else {
                        res.json({
                            success: false
                        })
                    }
                })
            } else {
                res.json({
                    success: false,
                    error: RouterHelper.matchBodyError(["name", "partyKey"], req.body)
                })
            }
            
        })

        app.post("/refresh", (req, res) => {
            if (typeof req.body.refreshToken !== undefined) {
                auth.refreshToken(req.body.refreshToken, (jwt) => {
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
            }
        })
    }
}