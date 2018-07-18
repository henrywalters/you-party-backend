import IResourceRouter from '../interface/IResourceRouter';
import IQueryable from '../../DataLayer/Interface/IQueryable';
import Auth from '../../AuthLayer/implementation/Auth';
import PartyController from '../../BusinessLayer/Implementation/PartyController';
import RouterHelper from '../../Helpers/RouterHelper';

export default class PartyRoutes implements IResourceRouter {
    route(app: any, ds: IQueryable) {

        let auth = new Auth(ds);
        let party = new PartyController(ds);

        app.post("/party", (req, res) => {
            auth.validateHeader(req, res);
            let required = ["name"];

            if (RouterHelper.matchBody(required, req.body)) {
                party.newParty(req.body.name, (error, party) => {
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
    }
}