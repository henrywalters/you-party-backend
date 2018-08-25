import * as BCrypt from 'bcrypt';
import Party from '../../DataLayer/Domain/Party';
import IQueryable from '../../DataLayer/Interface/IQueryable';
import { db } from '../../../node_modules/@types/rethinkdb';
import DataObject from '../../DataLayer/Abstract/DataObject';
import User from '../../DataLayer/Domain/User';

export default class UserController {

    SaltRounds: number = 10;
    UserObject: User;

    constructor(datasource: IQueryable) {
        this.UserObject = new User();
        this.UserObject.setDataSource(datasource);
    }

    checkUsernameExists(username: string, cb: {(boolean): void}) {
        this.UserObject.getWhere({username: username}, (error, res) => {
            if (!error) {
                if (res.length > 0) {
                    cb(true);
                } else {
                    cb(false);
                }
            } else {
                cb(false);
            }
        })
    }

    checkEmailExists(email: string, cb: {(boolean): void}) {
        this.UserObject.getWhere({email: email}, (error, res) => {
            if (!error) {
                if (res.length > 0) {
                    cb(true);
                } else {
                    cb(false);
                }
            } else {
                cb(false);
            }
        })
    }

    newUser(username: string, email: string, password: string, cb: {(error, user): void}) {
        this.checkUsernameExists(username, (userExists) => {
            if (!userExists) {
                this.checkEmailExists(email, (emailExists) => {
                    if (!emailExists) {
                        BCrypt.hash(password, this.SaltRounds, (error, pass) => {
                            if (!error) {
                                this.UserObject.create({
                                    username: username,
                                    email: email,
                                    password: pass
                                }, (error, user) => {
                                    cb("MySQL Failed to commit", user);
                                })
                            } else {
                                console.log("BCrypt failed");
                                cb("Password Hashing Failed", null);
                            }
                        })
                    } else {
                        console.log("Email Exists");
                        cb("Email Exists", null);
                    }
                })
            } else {
                console.log("Username Exists");
                cb("Username Exists", null);
            }
        })
    }

    validateUser(usernameOrEmail: string, password: string, cb: {(error, user): void}): void {
        this.UserObject.getWhere({username: usernameOrEmail}, (error, user) => {
            if (!error && user.length > 0) {
                if (user.length > 0) {
                    BCrypt.compare(password, user[0]['password'], (err, res) => {
                        if (!err && res) {
                            cb(false, user[0]);
                        } else {
                            cb(true, null);
                        }
                    })
                } else {
                    cb(true, null);
                }
            } else {
                this.UserObject.getWhere({email: usernameOrEmail}, (error, user) => {
                    if (!error) {
                        if (user.length > 0) {
                            BCrypt.compare(password, user[0]['password'], (err, res) => {
                                if (!err && res) {
                                    cb(false, user[0]);
                                } else {
                                    cb(true, null);
                                }
                            })
                        } else {
                            cb(true, null);
                        }
                    } else {
                        cb(true, null);
                    }
                })
            }
        })
            
    }

    changePassword(usernameOrEmail: string, password: string, newPassword: string, cb: {(error, user): void}): void {
        this.validateUser(usernameOrEmail, password, (error, user) => {
            if (!error) {
                BCrypt.hash(newPassword, this.SaltRounds, (error, pass) => {
                    if (!error) {
                        this.UserObject.update(user.id, {password: pass}, (error, user) => {
                            if (!error) {
                                cb(true, user);
                            } else {
                                cb(false, null);
                            }
                        })
                    } else {
                        cb(false, null);
                    }
                })
            } else {
                cb(false, null);
            }
        })
    }

    deleteUser(index: string): void {
        this.UserObject.destroy(index, (success) => {
            console.log("User deleted: ", success);
        })
    }
}