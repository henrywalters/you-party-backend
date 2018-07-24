import IResourceRouter from '../interface/IResourceRouter';
import IQueryable from '../../DataLayer/Interface/IQueryable';
import Auth from '../../AuthLayer/implementation/Auth';
import PartyController from '../../BusinessLayer/Implementation/PartyController';
import RouterHelper from '../../Helpers/RouterHelper';
import IResourcePool from '../interface/IResourcePool';
import { Router } from '../../../node_modules/@types/express';
import TimerHelper from '../../Helpers/TimerHelper';

export default class PartyRoutes implements IResourceRouter {
    route(app: any, socket: SocketIO.Socket,  ds: IQueryable, pool: IResourcePool) {

        let auth = new Auth(ds);
        let party = new PartyController(ds, pool);

        

        socket.on('create-party', (newParty) => {
            let t = new TimerHelper();
            let required = ["name", "jwt"];
            
            if (RouterHelper.matchBody(required, newParty)) {
                let user = auth.validateToken(newParty.jwt);
                if (user !== null) {
                    party.newParty(newParty.name, user['id'], (error, newParty) => {
                        console.log("Created Party");
                        t.stop();
                        console.log(t.toString());
                    })
                }
            }
            
        })

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
                    })
                } else {
                    res.json({
                        success: true,
                        parties: parties
                    })
                }
            })
        })

        app.post("/party", (req, res) => {
            auth.validateHeader(req, res);
            let required = ["name"];
            let user = auth.getSelf(req);
            let userId = user["id"];
            if (RouterHelper.matchBody(required, req.body)) {
                party.newParty(req.body.name, userId,(error, party) => {
                    if (!error) {
                        res.json({
                            success: true,
                            party: party
                        })
                    } else {
                        res.json({
                            success: false,
                            error: error
                        })
                    }
                })
            } else {
                res.json({
                    success: false,
                    error: RouterHelper.matchBodyError(required, req.body)
                })
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
                    })
                } else {
                    res.json({
                        success: false,
                        error: error
                    })
                }
            })
        })

        app.delete("/party/:id", (req, res) => {
            auth.validateHeader(req, res);
            let user = auth.getSelf(req);
            let userId = user['id'];

            party.deleteParty(req.params.id, userId, (success) => {
                res.json(success);
            })
            
        })
    }
}