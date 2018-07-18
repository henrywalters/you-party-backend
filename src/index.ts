import App from './App'
import ReQL from './DataLayer/Database/ReQL';
import * as BodyParser from 'body-parser';
import AuthRoutes from './IOLayer/implementation/AuthRoutes';
import UserRoutes from './IOLayer/implementation/UserRoutes';

const port = 3000

let db = new ReQL();

db.connect("YouParty", (error, res) => {
    if (!error) {

        let app = new App(db, [
            new AuthRoutes(),
            new UserRoutes()
        ]).express;

        /*app.use((req, res, next) => {
            const err = new Error('Not Found');
            err['error'] = 404;
            next(err);
          });
          */

        app.listen(port, ((err) => {
            if (err) {
                return console.log(err);
            }
        }));
    
    } else {
        console.log(error);
    }
}); 