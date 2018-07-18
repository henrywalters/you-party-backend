"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataObject_1 = require("../Abstract/DataObject");
class User extends DataObject_1.default {
    constructor() {
        super(...arguments);
        this.Schema = {
            username: 'string',
            email: 'string',
            password: 'string'
        };
        this.Table = "Users";
    }
}
exports.default = User;
//# sourceMappingURL=User.js.map