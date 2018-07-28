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


		
	
		//initialize socket server

		this.Server = createServer(this.express);
		this.IO = SocketIO.listen(this.Server);		

		this.IO.on('connect', (socket: SocketIO.Socket) => {
			console.log("client connected");
			this.Socket = socket;
			socket.on('join-resource', (resource) => {
				console.log("Joining resource: " + resource);
				this.ResourcePool.joinPool(resource, socket);
			})

			socket.on('join-sub-resource', (resource) => {
				this.ResourcePool.joinSubPool(resource.resource, resource.subIndex, socket);
			})

			this.mountRoutes(routes);
		})
  	}

  	private mountRoutes (routes: Array<IResourceRouter>): void {
		this.express.use(function(req, res, next) {
			res.setHeader("Access-Control-Allow-Origin", "*");
    		res.setHeader("Access-Control-Allow-Credentials", "true");
    		res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    		res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, authorization");
			next();
		  });
		  


		for (let i = 0; i < routes.length; i++) {
			routes[i].route(this.router, this.Socket, this.DataSource, this.ResourcePool);
		}
		this.express.use('/', this.router)   
	 }
}

export default App;