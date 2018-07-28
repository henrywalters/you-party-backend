import * as querystring from 'querystring';
import App from './App'
import ReQL from './DataLayer/Database/ReQL';
import * as BodyParser from 'body-parser';
import AuthRoutes from './IOLayer/implementation/AuthRoutes';
import UserRoutes from './IOLayer/implementation/UserRoutes';
import PartyRoutes from './IOLayer/implementation/PartyRoutes';
import ResourcePool from './IOLayer/implementation/ResourcePool';
import MySQL from './DataLayer/Database/MySQL';




const port = 3000

let db = new MySQL();

let app = new App(db, new ResourcePool(
    [
        "Party"
    ]
), [
    new AuthRoutes(),
    new UserRoutes(),
    new PartyRoutes()
]).express;

app.listen(port, ((err) => {

    app.get("/", (req, res) => {
        res.json("Hello World");
    })

    if (err) {
        return console.log(err);
    }
}));

/*
let db = new ReQL();

db.connect("YouParty", (error, res) => {
    if (!error) {

        let app = new App(db, new ResourcePool(
            [
                "Party"
            ]
        ), [
            new AuthRoutes(),
            new UserRoutes(),
            new PartyRoutes()
        ]).express;

        app.listen(port, ((err) => {
            if (err) {
                return console.log(err);
            }
        }));

    } else {
        console.log(error);
    }
}); 

*/