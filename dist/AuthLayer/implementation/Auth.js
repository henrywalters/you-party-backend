"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JWT = require("jsonwebtoken");
const UserController_1 = require("../../BusinessLayer/Implementation/UserController");
const Configs_1 = require("../../Configs");
class Auth {
    constructor(datasource) {
        this.AccessExpiration = 3600;
        this.RefreshExpiration = 3600 * 24 * 30;
        this.Controller = new UserController_1.default(datasource);
        this.Cert = Configs_1.default.Key;
    }
    login(usernameOrEmail, password, cb) {
        this.Controller.validateUser(usernameOrEmail, password, (error, user) => {
            if (!error) {
                let payload = {
                    id: user['id'],
                    username: user['username'],
                    email: user['email'],
                    sub: "Access Token"
                };
                JWT.sign(payload, this.Cert, { expiresIn: this.AccessExpiration }, (error, token) => {
                    if (error) {
                        cb(false);
                    }
                    else {
                        let refreshPayload = {
                            sub: "Refresh Token",
                            token: token
                        };
                        JWT.sign(refreshPayload, this.Cert, { expiresIn: this.RefreshExpiration }, (error, refresh) => {
                            if (!error) {
                                cb({
                                    accessToken: token,
                                    refreshToken: refresh
                                });
                            }
                        });
                    }
                });
            }
            else {
                cb(false);
            }
        });
    }
    validateHeader(request, response) {
        let valid = false;
        if (request.headers.hasOwnProperty("authorization")) {
            let token = request.headers.authorization.split("Bearer-");
            if (token.length === 2) {
                try {
                    let jwt = JWT.verify(token[1], this.Cert);
                    if (jwt) {
                        valid = true;
                    }
                }
                catch (error) {
                }
            }
        }
        if (!valid) {
            response.status(401);
            response.json({
                success: false,
                error: "Access Denied"
            });
        }
    }
    getSelf(request) {
        if (request.headers.hasOwnProperty("authorization")) {
            let token = request.headers.authorization.split("Bearer-");
            if (token.length === 2) {
                try {
                    let jwt = JWT.verify(token[1], this.Cert);
                    if (jwt) {
                        return jwt;
                    }
                }
                catch (error) {
                }
            }
        }
        return null;
    }
    validateToken(token) {
        try {
            let jwt = JWT.verify(token, this.Cert);
            if (jwt) {
                return jwt;
            }
            else {
                return null;
            }
        }
        catch (error) {
            return null;
        }
    }
    refreshToken(refreshToken, cb) {
        JWT.verify(refreshToken, this.Cert, (error, decoded) => {
            if (error) {
                cb(false);
            }
            else {
                JWT.verify(decoded["token"], this.Cert, { ignoreExpiration: true }, (error, decoded) => {
                    if (error) {
                        cb(false);
                    }
                    else {
                        let payload = {
                            id: decoded['id'],
                            username: decoded['username'],
                            email: decoded['email'],
                            sub: "Access Token"
                        };
                        JWT.sign(payload, this.Cert, { expiresIn: this.AccessExpiration }, (error, token) => {
                            if (error) {
                                cb(false);
                            }
                            else {
                                let refreshPayload = {
                                    sub: "Refresh Token",
                                    token: token
                                };
                                JWT.sign(refreshPayload, this.Cert, { expiresIn: this.RefreshExpiration }, (error, refresh) => {
                                    if (!error) {
                                        cb({
                                            accessToken: token,
                                            refreshToken: refresh
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}
exports.default = Auth;
//# sourceMappingURL=Auth.js.map