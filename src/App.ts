import * as express from 'express'
import IQueryable from './DataLayer/Interface/IQueryable';
import Auth from './AuthLayer/implementation/Auth';
import * as BodyParser from 'body-parser';
import User from './DataLayer/Domain/User';
import UserController from './BusinessLayer/Implementation/UserController';
import IResourceRouter from './IOLayer/interface/IResourceRouter';

class App {
  	public express;
	public DataSource: IQueryable;
	public router;

 	constructor (datasource: IQueryable, routes: Array<IResourceRouter>) {
		this.express = express()
		this.router = express.Router();
		this.express.use(BodyParser.json());
		this.DataSource = datasource;
		this.mountRoutes(routes);
  	}

  	private mountRoutes (routes: Array<IResourceRouter>): void {

		let auth = new Auth(this.DataSource)
		let user = new UserController(this.DataSource);

		for (let i = 0; i < routes.length; i++) {
			routes[i].route(this.router, this.DataSource);
		}

    	this.express.use('/', this.router)
    
	 }
}

export default App;