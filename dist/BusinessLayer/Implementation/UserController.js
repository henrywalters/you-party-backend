"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BCrypt = require("bcrypt");
const User_1 = require("../../DataLayer/Domain/User");
class UserController {
    constructor(datasource) {
        this.SaltRounds = 10;
        this.UserObject = new User_1.default();
        this.UserObject.setDataSource(datasource);
    }
    checkUsernameExists(username, cb) {
        this.UserObject.getWhere({ username: username }, (error, res) => {
            if (!error) {
                if (res.length > 0) {
                    cb(true);
                }
                else {
                    cb(false);
                }
            }
            else {
                cb(false);
            }
        });
    }
    checkEmailExists(email, cb) {
        this.UserObject.getWhere({ email: email }, (error, res) => {
            if (!error) {
                if (res.length > 0) {
                    cb(true);
                }
                else {
                    cb(false);
                }
            }
            else {
                cb(false);
            }
        });
    }
    newUser(username, email, password, cb) {
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
                                    cb(error, user);
                                });
                            }
                            else {
                                console.log("BCrypt failed");
                                cb("Password Hashing Failed", null);
                            }
                        });
                    }
                    else {
                        console.log("Email Exists");
                        cb("Email Exists", null);
                    }
                });
            }
            else {
                console.log("Username Exists");
                cb("Username Exists", null);
            }
        });
    }
    validateUser(usernameOrEmail, password, cb) {
        this.UserObject.getWhere({ username: usernameOrEmail }, (error, user) => {
            if (!error) {
                if (user.length > 0) {
                    BCrypt.compare(password, user[0]['password'], (err, res) => {
                        if (!err && res) {
                            cb(false, user[0]);
                        }
                        else {
                            cb(true, null);
                        }
                    });
                }
                else {
                    cb(true, null);
                }
            }
            else {
                this.UserObject.getWhere({ email: usernameOrEmail }, (error, user) => {
                    if (!error) {
                        if (user.length > 0) {
                            BCrypt.compare(password, user[0]['password'], (err, res) => {
                                if (!err && res) {
                                    cb(false, user[0]);
                                }
                                else {
                                    cb(true, null);
                                }
                            });
                        }
                        else {
                            cb(true, null);
                        }
                    }
                    else {
                        cb(true, null);
                    }
                });
            }
        });
    }
    changePassword(usernameOrEmail, password, newPassword, cb) {
        this.validateUser(usernameOrEmail, password, (error, user) => {
            if (!error) {
                BCrypt.hash(newPassword, this.SaltRounds, (error, pass) => {
                    if (!error) {
                        this.UserObject.update(user.id, { password: pass }, (error, user) => {
                            if (!error) {
                                cb(true, user);
                            }
                            else {
                                cb(false, null);
                            }
                        });
                    }
                    else {
                        cb(false, null);
                    }
                });
            }
            else {
                cb(false, null);
            }
        });
    }
    deleteUser(index) {
        this.UserObject.destroy(index, (success) => {
            console.log("User deleted: ", success);
        });
    }
}
exports.default = UserController;
//# sourceMappingURL=UserController.js.map