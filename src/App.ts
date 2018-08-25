import * as express from 'express'
import IQueryable from './DataLayer/Interface/IQueryable';
import Auth from './AuthLayer/implementation/Auth';
import * as BodyParser from 'body-parser';
import User from './DataLayer/Domain/User';
import UserController from './BusinessLayer/Implementation/UserController';
import IResourceRouter from './IOLayer/interface/IResourceRouter';
import * as SocketIO from 'socket.io';
import { createServer, Server } from 'http';
import * as Emitter from 'central-event';
import IResourcePool from './IOLayer/interface/IResourcePool';
import * as Cors from 'cors';
import Party from './DataLayer/Domain/Party';

class App {
  	public express;
	public DataSource: IQueryable;
	public ResourcePool: IResourcePool;
	public router;
	public Server;
	public IO: SocketIO.Server;
	public Socket: SocketIO.Socket;

 	constructor (datasource: IQueryable, resourcepool: IResourcePool, routes: Array<IResourceRouter>) {
		this.express = express()
		this.router = express.Router();
		this.express.use(BodyParser.json());
		this.DataSource = datasource;
		this.ResourcePool = resourcepool;

		//initialize the resource pools from existing parties existed. 
		//without doing this, an error will be thrown. This is intentional. 

		let partyObject = new Party();
		partyObject.setDataSource(this.DataSource);
		
		partyObject.getAll((error, parties) => {
			console.log("Got Parties");
			parties.map(party => {
				console.log(partyObject);

				resourcepool.createPool("Party-" + party['id']);
				resourcepool.createSubPool("Party-" + party['id'], "Playlist");
				resourcepool.createSubPool("Party-" + party['id'], "Votes");

				console.log("Initializing pool for party: " + party['name']);
			})
		})
		
	
		//initialize socket server

		this.Server = createServer(this.express);
		this.IO = SocketIO.listen(this.Server);		

		this.IO.on('connect', (socket: SocketIO.Socket) => {
			this.Socket = socket;
			socket.on('join-resource', (resource) => {
				this.ResourcePool.joinPool(resource, socket);
			})

			socket.on('join-sub-resource', (resource) => {
				this.ResourcePool.joinSubPool(resource.resource, resource.subIndex, socket);
			})

			
		})

		this.mountRoutes(routes);

		setInterval(() => {
			this.IO.emit("Server-Time", new Date());
		}, 1000)
  	}	

  	public mountRoutes (routes: Array<IResourceRouter>): void {
		this.express.use(function(req, res, next) {
			res.setHeader("Access-Control-Allow-Origin", "*");
    		res.setHeader("Access-Control-Allow-Credentials", "true");
    		res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    		res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, authorization");
			next();
		  });
		  


		for (let i = 0; i < routes.length; i++) {
			routes[i].route(this.router, this.Server, this.DataSource, this.ResourcePool);
		}
		this.express.use('/', this.router)   
	 }
}

export default App;