import IAuth from '../interface/IAuth';
import DataObject from '../../DataLayer/Abstract/DataObject';
import * as JWT from 'jsonwebtoken';
import * as FS from 'fs';
import IQueryable from '../../DataLayer/Interface/IQueryable';
import UserController from '../../BusinessLayer/Implementation/UserController';
import Config from '../../Configs';

export default class Auth implements IAuth {
    
    Controller: UserController;
    Cert: string;
    AccessExpiration: number = 3600;
    RefreshExpiration: number = 3600 * 24 * 30;

    constructor(datasource: IQueryable) {
        this.Controller = new UserController(datasource);
        this.Cert = Config.Key;
    }

    login(usernameOrEmail: string, password: string, cb: {(jwt: boolean | Object):void}) {
        this.Controller.validateUser(usernameOrEmail, password, (error, user) => {
            if (!error) {
                let payload = {
                    id: user['id'],
                    username: user['username'],
                    email: user['email'],
                    sub: "Access Token"
                }

                JWT.sign(payload, this.Cert, {expiresIn: this.AccessExpiration}, (error, token) => {
                    if (error) {
                        cb(false);
                    } else {
                        
                        let refreshPayload = {
                            sub: "Refresh Token",
                            token: token
                        };

                        JWT.sign(refreshPayload, this.Cert, {expiresIn: this.RefreshExpiration}, (error, refresh) => {
                            if (!error) {
                                cb({
                                    accessToken: token,
                                    refreshToken: refresh
                                });
                            }
                        })

                    }
                })
            } else {
                cb(false);
            }
        })
    }

    validateHeader(request: any, response: any): void {
        let valid = false;
        if (request.headers.hasOwnProperty("authorization")) {
            let token = request.headers.authorization.split("Bearer-");
            if (token.length === 2) {
                try {
                    let jwt = JWT.verify(token[1], this.Cert);
                    if (jwt) {
                        valid = true;
                    }
                } catch(error) {
                    
                }
            } 
        }

        if (!valid) {
            response.status(401);
            response.json({
                success: false,
                error: "Access Denied"
            })
        }
    }

    getSelf(request): Object | null {
        if (request.headers.hasOwnProperty("authorization")) {
            let token = request.headers.authorization.split("Bearer-");
            if (token.length === 2) {
                try {
                    let jwt = JWT.verify(token[1], this.Cert);
                    if (jwt) {
                        return jwt
                    }
                } catch(error) {
                    
                }
            } 
        }

        return null;
    }

    validateToken(token: string) {
        try {
            let jwt = JWT.verify(token, this.Cert);
            if (jwt) {
                return jwt;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }

    refreshToken(refreshToken: string, cb: {(jwt: boolean | Object): void}) {
        JWT.verify(refreshToken, this.Cert, (error, decoded) => {
            if (error) {
                cb(false);
            } else {
                JWT.verify(decoded["token"], this.Cert, {ignoreExpiration: true}, (error, decoded) => {
                    if (error) {
                        cb(false);
                    } else {
                        let payload = {
                            id: decoded['id'],
                            username: decoded['username'],
                            email: decoded['email'],
                            sub: "Access Token"
                        }

                        JWT.sign(payload, this.Cert, {expiresIn: this.AccessExpiration}, (error, token) => {
                            if (error) {
                                cb(false);
                            } else {
                                
                                let refreshPayload = {
                                    sub: "Refresh Token",
                                    token: token
                                };

                                JWT.sign(refreshPayload, this.Cert, {expiresIn: this.RefreshExpiration}, (error, refresh) => {
                                    if (!error) {
                                        cb({
                                            accessToken: token,
                                            refreshToken: refresh
                                        });
                                    }
                                })

                            }
                        })
                    }
                });
            }
        })
    }

}